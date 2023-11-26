import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import sendRuntimeMessage from '../../utility/ExtensionProxy';


const ManageRoom = (props) => {
  const {extensionState} = props;
  const [copyState, setCopyState] = useState("Copy");

  const prepareLink = () => {
    return `${process.env.REACT_APP_PRESENT_URL}/${extensionState.roomId}/${extensionState.joinToken}`
  }

  const stopSharing = () => {
    sendRuntimeMessage({action:'stopRoom'});
  }

  const copyToClipBoard = () => {
    setCopyState('...');
    navigator.clipboard.writeText(prepareLink());
    setTimeout(()=>{
      setCopyState('Copy')
    }, 800);
  }

  return <>
      <div className="divide-gray-300/50">
        <div className=" m-auto flex max-w-xs flex-col bg-white">
        <QRCode
          className="m-auto"
          size={150}
          style={{ height: "150", maxWidth: "150", width: "150" }}
          value={prepareLink()}
          viewBox={`0 0 150 150`}
          />
          <div className="m-auto flex w-64 flex-col gap-4 pl-2 pr-2">
            <small className="text-center">Use your mobile camera</small>
          </div>
        </div>

        <div className="mb-3 mt-3 flex w-full">
          <input disabled={true} className="mr-1 w-5/6 rounded border border-solid px-4 py-2" type="text" value={prepareLink()} placeholder="Your presentation link" id="copyMe" />
        <button className="w-1/6 rounded border py-2 text-sm text-black hover:bg-gray-100" onClick={() => { copyToClipBoard() }}>{copyState}</button>
        </div>

        <div className="relative overflow-auto">
          <div className="dark:highlight-white/5 relative mx-auto flex h-52 max-h-52 flex-col divide-y overflow-auto bg-white ring-1 ring-black/5 dark:divide-slate-900/5">
          { props.extensionState.clients.length >0 && props.extensionState.clients.map((client, index) => {
            return (
              <div className="flex items-center gap-4 p-4">
                <img className="h-12 w-12 rounded-full" src="user.png" />
                <div className="flex flex-col">
                  <strong className="text-sm font-medium text-slate-900 dark:text-slate-900">User: {client.username}</strong>
                </div>
              </div>
              )
            })
          }
          { props.extensionState.clients.length == 0 && (
              <div className="flex items-center gap-4 p-4">
                <div className="flex flex-col">
                  <strong className="text-sm font-medium text-slate-900 dark:text-slate-900">No presenter connected</strong>
                </div>
              </div>
              )
          }
          </div>
        </div>

        <button onClick={()=>{stopSharing()}} className="w-full rounded bg-red-500 py-2 font-bold text-white">Stop Sharing</button>
      </div>
      </>;
};

export default ManageRoom;
