const API_URL ='https://api.nextslide.app';

let popupWindowId = null;

let currentState = {
  mode: "create",
  creatingRoom: false,
  roomId: "",
  creatorId: "",
  joinToken: "",
  hostToken: "",
  clients: [],
  tabs: [],
  currentSlide: 0,
  totalSlides: 0,
  takeScreenshot: false,
};

let selectedPresentationTab = null;

let hostAuthToken = null;


chrome.action.onClicked.addListener((tab)=>{
  if (popupWindowId !== null) {
    // A popup is already open; bring it to the front
    chrome.windows.update(popupWindowId, { focused: true });
  } else {
    const width=400, height=550;
    chrome.windows.create({
        url: "app/index.html",
        type: "popup",
        width: width,
        height: height
    }, function(window) {
      popupWindowId = window.id;
    });
    setTimeout(()=>{
      detectPresentationTabs();
    }, 100);
  }
});

chrome.windows.onRemoved.addListener((windowId)=>{
  if (windowId === popupWindowId) {
    popupWindowId = null; // Reset the window ID
    // disable room
    stopRoom();
  }
});

chrome.runtime.onMessage.addListener( (request,sender,sendResponse)=>
{
  if( request.action === "getState" )
  {
    sendResponse( currentState );        
  }else if (request.action === "createRoom" && 
    currentState.creatingRoom === false){
    createRoom(request);
  }else if (request.action === "stopRoom"){
    stopRoom();
  } else if(request.action === "scrUpdate"){
    updateRoomDetails(request);
  }

});

function stopRoom(){
  fetch(`${API_URL}/api/host/room`, {
    method: 'DELETE',
    headers: {
        'Authorization': hostAuthToken
    }
  }).catch((e)=>{});
  selectedPresentationTab = null;
  hostAuthToken = null;
  currentState = {
    mode: "create",
    creatingRoom: false,
    roomId: "",
    creatorId: "",
    joinToken: "",
    hostToken: "",
    clients: [],
    tabs: [],
    currentSlide: 0,
    totalSlides: 0,
    takeScreenshot: false,
  };

  if(popupWindowId != null){
    setTimeout(()=>{detectPresentationTabs()}, 100);
  }
}

function createRoom(request){
  currentState.takeScreenshot = request.takeScreenshot ? request.takeScreenshot : false;
  currentState.creatingRoom = true;
  fetch(`${API_URL}/api/host/room`, {
      method: 'POST',
      headers: {
          'Authorization': chrome.runtime.getURL("popup.html")
      }
  }).then(r => r.json()).then(rsp => {
    if(rsp.status === 'OK'){
      currentState.creatingRoom = false;
      currentState.mode = 'present';
      currentState.roomId = rsp.roomId;
      currentState.creatorId = rsp.creatorId;
      currentState.joinToken = rsp.joinToken;
      hostAuthToken = rsp.hostToken;

      selectedPresentationTab = request.selectedTab;
      observePresentationCommands();
    }
  }).catch((e)=>{
    stopRoom();
  });
}

function updateRoomDetails(details){
  let detatilsCurrent = parseInt(details.current);
  let detatilsTotal = parseInt(details.total);

  if (isNaN(detatilsCurrent) || typeof detatilsCurrent === 'undefined'){
    detatilsCurrent = 0;
  }

  if (isNaN(detatilsTotal) || typeof detatilsTotal === 'undefined') {
    detatilsTotal = 0;
  }


  if (detatilsCurrent === currentState.currentSlide && 
    detatilsTotal === currentState.totalSlides){
      return;
  }

  currentState.currentSlide = detatilsCurrent;
  currentState.totalSlides = detatilsTotal;

  fetch(`${API_URL}/api/host/presentation-details`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': hostAuthToken
    },
    body: JSON.stringify({
        'slideScreenshot': details.dataURL,
        'totalSlides': details.total,
        'currentSlide': details.current
    })
  }).catch((e)=>{
    stopRoom();
  });
}

async function getTabId() {
  const tabs = await chrome.tabs.query({active: true, currentWindow: true});
  return (tabs.length > 0) ? tabs[0].id : null;
}

function detectPresentationTabs(){
  if(popupWindowId == null || currentState.mode !== 'create'){
    return;
  }
  let presentationTabs = [];
  chrome.windows.getAll({ populate: true }, async (windows) => {
    for (let i = 0; i < windows.length; i++) {
      const window = windows[i];
      const tabs = window.tabs;
      for (let j = 0; j < tabs.length; j++) {
        const tab = tabs[j];

        if(tab.url.startsWith("https://docs.google.com/presentation/")){
          presentationTabs.push({
            tabId: tab.id,
            title: tab.title,
            type: 'google.slides',
            windowId: window.id
          });
        }
        if (tab.url.startsWith("https://onedrive.live.com/") && tab.url.includes("file%2cpptx")){
          presentationTabs.push({
            tabId: tab.id,
            title: tab.title,
            type: 'powerpoint',
            windowId: window.id
          });
        }
      }
    }
    currentState.tabs = presentationTabs;
  });
  setTimeout(()=>{
    detectPresentationTabs();
  }, 100)
}

function observePresentationCommands(){
  if(selectedPresentationTab == null){
    return;
  }

  fetch(`${API_URL}/api/host/commands`, {
      headers: {
          'Authorization': hostAuthToken
      }
  }).then(r => {
    if(r.status > 205){
      stopRoom();
      return;
    }
    return r.json()
  }).then((response)=>{
    currentState.clients = response.clients;
    if(response.commands.length > 0){
      response.commands.forEach((command)=>{
        executeCommand(selectedPresentationTab.tabId, command, selectedPresentationTab.type);
      });
      if(selectedPresentationTab.type === "google.slides"){
        gglInitiateScreenshotAndDetails(selectedPresentationTab.tabId);
      }else{
        pptxInitiateScreenshotAndDetails(selectedPresentationTab.tabId)
      }
    }else{
      if (selectedPresentationTab.type === "google.slides") {
        gglInitiateScreenshotAndDetails(selectedPresentationTab.tabId);
      } else {
        pptxInitiateScreenshotAndDetails(selectedPresentationTab.tabId)
      }
    }
    setTimeout(()=>{
      observePresentationCommands();
    }, 200);
  }).catch((e)=>{
    stopRoom();
  });
}

function executeCommand(tabId, command, type) {
  let keyCode = -1;
  if(['next', 'previous'].includes(command)){
    keyCode = command === 'next' ?39:37;
  }

  if(keyCode === -1){
    return;
  }

  const handleNavigation = (details) => {
    for(let detail of details){
      if (type === "google.slides" && detail.url.includes('/present?token')) {
        chrome.scripting.executeScript({
          target: { tabId: tabId, frameIds : [detail.frameId] },
          func: gglExecKeyPress,
          args : [ keyCode ]
        });
      }
      if (type === "powerpoint" &&
        detail.url.startsWith("https://powerpoint.officeapps.live.com")) {
        chrome.scripting.executeScript({
          target: { tabId: tabId, frameIds: [detail.frameId] },
          func: pptxExecKeyPress,
          args: [keyCode]
        });
      }
    }
  }
  
  // Define the query object with the tabId
  const queryInfo = {
    tabId: tabId, // Replace with the actual tab ID you want to monitor
  };
  
  // Call chrome.webNavigation.getAllFrames with the query and callback function
  chrome.webNavigation.getAllFrames(queryInfo, handleNavigation);
}

function pptxInitiateScreenshotAndDetails(tabId){
  const handleNavigation = (details) => {
    for (let detail of details) {
        if (detail.url.startsWith("https://powerpoint.officeapps.live.com")) {
          chrome.scripting.executeScript({
            target: { tabId: tabId, frameIds: [detail.frameId] },
            func: pptxTakeScreenshotAndDetails,
            args: [currentState.currentSlide, currentState.totalSlides, currentState.takeScreenshot]
          });
        }
    }
  }

  // Define the query object with the tabId
  const queryInfo = {
    tabId: tabId, // Replace with the actual tab ID you want to monitor
  };

  // Call chrome.webNavigation.getAllFrames with the query and callback function
  chrome.webNavigation.getAllFrames(queryInfo, handleNavigation);
}

function pptxExecKeyPress(keyCode) {
  const nextButton = document.querySelector("#nextButton");
  const prevButton = document.querySelector("#prevButton");

  if (keyCode === 39){
    nextButton.click();
  }else{
    prevButton.click();
  }
}

function pptxTakeScreenshotAndDetails(currentSlide, totalSlides, takeScreenshot) {
  let total = 0;
  let current = 0;

  try {
    const text = document.querySelector("#live-region-accessibility-element").innerHTML;
    const regex = /(\d+):/;

    const match = text.match(regex);

    if (match && match.length > 1) {
      current = parseInt(match[1]);
    }
    total = document.querySelectorAll('[id^="content-image-view-id"]').length;
  } catch (e) {
  }

  if (currentSlide === current && totalSlides === total) {
    return;
  }

  if (!takeScreenshot) {
    chrome.runtime.sendMessage({ action: "scrUpdate", dataURL: "", total: total, current: current });
    return;
  }

  let dataURL = '';
  try{
    dataURL = document.querySelector("#webgl-canvas").toDataURL("image/png", 0.5);
  }catch(e){
    console.log(e);
  }
  
  chrome.runtime.sendMessage({ action: "scrUpdate", dataURL: dataURL, total: total, current: current });
}

function gglInitiateScreenshotAndDetails(tabId){
  const handleNavigation = (details) => {
    for(let detail of details){
      if (detail.url.includes('/present?token')) {
        chrome.scripting.executeScript({
          target: { tabId: tabId, frameIds : [detail.frameId] },
          func: gglTakeScreenshotAndDetails,
          args : [ currentState.currentSlide, currentState.totalSlides, currentState.takeScreenshot ]
        });
      }
    }
  }
  
  // Define the query object with the tabId
  const queryInfo = {
    tabId: tabId, // Replace with the actual tab ID you want to monitor
  };
  
  // Call chrome.webNavigation.getAllFrames with the query and callback function
  chrome.webNavigation.getAllFrames(queryInfo, handleNavigation);
}

function gglExecKeyPress(keyCode){
  KPressManager = {};

  KPressManager.keydown = function(k, docc) {
      var oEvent = docc.createEvent('KeyboardEvent');

      // Chromium Hack
      Object.defineProperty(oEvent, 'keyCode', {
                  get : function() {
                      return this.keyCodeVal;
                  }
      });     
      Object.defineProperty(oEvent, 'which', {
                  get : function() {
                      return this.keyCodeVal;
                  }
      });     


          oEvent = new KeyboardEvent("keydown", {
              bubbles: true,
              cancelable: true,
              view: docc.defaultView,
              key: k,
              code: k,
              location: 0,
              altKey: false,
              ctrlKey: false,
              shiftKey: false,
              metaKey: false,
              repeat: false,
              isComposing: false,
              charCode: 0,
              keyCode: k,
              which: 0,
            });
      oEvent.keyCodeVal = k;

      if (oEvent.keyCode !== k) {
          alert("keyCode mismatch " + oEvent.keyCode + "(" + oEvent.which + ")");
      }

      docc.body.dispatchEvent(oEvent);
  }
  KPressManager.keydown(keyCode, document);
}

function gglTakeScreenshotAndDetails(currentSlide, totalSlides, takeScreenshot) {
  let total = 0;
  let current = 0;

  try{
    const element = document.querySelector(".goog-inline-block .docs-material-menu-button-flat-default-caption");

    total = parseInt(element.getAttribute("aria-setsize"));
    current = parseInt(element.getAttribute("aria-posinset"));
  }catch(e){
  }

  if(currentSlide === current && totalSlides===total){
    return;
  }

  if (!takeScreenshot){
    chrome.runtime.sendMessage({ action: "scrUpdate", dataURL: "", total: total, current: current });
    return;
  }

  var svg = document.querySelector('svg');
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var img = new Image();

  img.onload = function() {
    canvas.width = svg.clientWidth;
    canvas.height = svg.clientHeight;
    ctx.drawImage(img, 0, 0);

    // Convert the canvas to a data URL in PNG format
    const dataURL = canvas.toDataURL('image/png', 0.7);

    chrome.runtime.sendMessage({ action: "scrUpdate", dataURL: dataURL, total:total, current:current});
  };

  const svgData = new XMLSerializer().serializeToString(svg);
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}