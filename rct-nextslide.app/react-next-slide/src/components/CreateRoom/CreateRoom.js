import React, { useState } from 'react';
import sendRuntimeMessage from '../../utility/ExtensionProxy';


const CreateRoom = (props) => {
  const {extensionState} = props;

  const [selectedTab, setSelectedTab] = useState({});
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const initiateRoomCreation = () => {
    sendRuntimeMessage({ action: 'createRoom', selectedTab, takeScreenshot: isChecked});
  }

  return <>
      <div className="divide-y divide-gray-300/50">
        <div className="space-y-6 text-base leading-7 text-gray-600">
          <small>Select the presentation tab and grant the presenters the ability to steer the course:</small>
          <div className="relative overflow-auto">
            <div className="dark:highlight-white/5 relative mx-auto flex min-h-64 h-64 flex-col divide-y overflow-auto bg-white ring-1 ring-black/5 dark:divide-slate-900/5">
            { props.extensionState.tabs.length >0 && props.extensionState.tabs.map((tab) => {
                return ( 
                  <div className={`flex items-center gap-4 p-4 cursor-pointer ${selectedTab.tabId === tab.tabId ? 'bg-slate-200':'hover:bg-slate-400'}`} onClick={()=>{setSelectedTab(tab)}}>
                    <img className="h-12 w-12 rounded-full" src={tab.type === 'google.slides'?'gslides.png':'ppoint.png'} />
                    <div className="flex flex-col">
                      <strong className="text-sm font-medium text-slate-900 dark:text-slate-900">{tab.title}</strong>
                    </div>
                  </div>
                )})
            }
            { props.extensionState.tabs.length == 0 && (
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex flex-col">
                      <strong className="text-sm font-medium text-red-900 dark:text-slate-900">No presentation tab detected</strong>
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400"></span>
                    </div>
                  </div>
                )
            }
            </div>
          </div>
        </div>
        <div className="flex items-center mb-4">
          <input checked={isChecked} onChange={handleCheckboxChange} type="checkbox" value="" className="w-4 h-4 text-blue-600 rounded"/>
          <label className="ms-2 text-sm font-medium text-gray-900">Share slide as screenshot</label>
        </div>
        <button onClick={()=>{initiateRoomCreation()}} className="w-full rounded bg-blue-500 py-2 font-bold text-white">{extensionState.creatingRoom ? 'Sharing...' : 'Share'}</button>
      </div>
      </>
};

export default CreateRoom;
