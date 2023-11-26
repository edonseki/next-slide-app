const sendRuntimeMessage = (request, callback) => {
    /* global chrome */
    if(!chrome.runtime){
        return;
    }
    chrome.runtime.sendMessage(request,callback);
}

export default sendRuntimeMessage;