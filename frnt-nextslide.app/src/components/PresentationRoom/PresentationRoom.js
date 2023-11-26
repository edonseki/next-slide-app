import React, { useState } from 'react';


const PresentationRoom = ({auth, appState, onStop}) => {
  const [presentationDetails, setPresentationDetails] = useState({currentSlide: 0, totalSlides: 0});
  const [started, setStarted] = useState(false);

  const [nextText, setNextText] = useState("»Next»");
  const [previousText, setPreviousText] = useState("«Previous«");

  const updateRoomDetails = () => {
    if(!appState || appState !== 'present'){
      return;
    }
    fetch(`${process.env.REACT_APP_API_URL}/presentation/details`, {
        headers: {
            'Authorization': auth
        }
    }).then((d)=>{
      if(d.status === 401 || d.status === 404){
        onStop();
        return;
      }
      return d.json();
    }).then((data)=>{
      setPresentationDetails(data.presentationDetails);
      checkContentChanges(data.presentationDetails.contentVersionId);
    }).catch((e)=>{
      onStop();
    });
  }

  const checkContentChanges = (version) => {
    if(!appState || appState !== 'present'){
      return;
    }
    fetch(`${process.env.REACT_APP_API_URL}/presentation/details-version`, {
        headers: {
            'Authorization': auth
        }
    }).then((d)=>{
      if(d.status === 401 || d.status === 404){
        onStop();
        return;
      }
      return d.json();
    }).then((data)=>{
      if(version !== data.contentVersionId){
        updateRoomDetails();
      }else{
        setTimeout(()=>{
          checkContentChanges(version);
        }, 200);
      }
    }).catch((e)=>{
      onStop();
    });
  }

  const moveSlide = (direction) => {
    if(direction === "previous"){
      setPreviousText("...");
    }else if (direction === "next"){
      setNextText("...");
    }

    fetch(`${process.env.REACT_APP_API_URL}/presentation/${direction}`, {
        method: 'POST',
        headers: {
            'Authorization': auth
        }
    }).then(r=>r.json()).then((d)=>{
      if (direction === "previous") {
        setPreviousText("«Previous«");
      } else if (direction === "next") {
        setNextText("»Next»");
      }
    }).catch((e)=>{
      onStop();
    });
  }

  useState(()=>{
    if(appState === 'present' && !started){
      setStarted(true);
      checkContentChanges("-");
    }

    return () => {
      setStarted(false);
    }
  }, [appState]);

  return <>
    <div className="space-y-6 text-base leading-7 text-gray-600">
      <img className="border" src={!presentationDetails.slideScreenshot ? "/no-presentation.png" : presentationDetails.slideScreenshot } />
    </div>
    <div className="border-0">
      <label className="text-center block text-gray-700  mb-2 mt-2">
        {presentationDetails.currentSlide}/{presentationDetails.totalSlides}
      </label>
    </div>
    <div className="flex space-x-4">
      <button onClick={() => { moveSlide('previous') }} type="button" className="bg-violet-600 hover:bg-violet-800 w-1/2 text-gray-100 font-bold py-2 px-4 rounded-l">
        {previousText}
      </button>
      <button onClick={() => { moveSlide('next') }} type="button" className="bg-violet-600 hover:bg-violet-800 w-1/2 text-gray-100 font-bold py-2 px-4 rounded-r">
        {nextText}
      </button>
    </div>
    <div className="border-0">
      <label className="text-center block text-gray-700 text-sm mb-1 mt-8">
        Made with <span className="text-red-500">❤</span>  
      </label>
    </div>
  </>
};

export default PresentationRoom;
