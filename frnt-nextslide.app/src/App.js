
import { useState } from "react";
import PresentationRoom from "./components/PresentationRoom/PresentationRoom";
import JoinRoom from "./components/JoinRoom/JoinRoom";

function App() {
  const [roomDetails, setRoomDetails] = useState({});
  const [auth, setAuth] = useState('');
  const [appState, setAppState] = useState('validating');

  const onJoin = (data) =>{
    localStorage.setItem("auth", data.presentationToken);
    localStorage.setItem("roomId", data.roomId);
    localStorage.setItem("joinToken", data.joinToken);
    setAuth(data.presentationToken)
    setAppState('present');
  }

  const onStop = () => {
    localStorage.removeItem('auth');
    localStorage.removeItem('roomId');
    localStorage.removeItem('joinToken');
    setAppState('stopped');
  }

  useState(()=>{
    const details = window.location.pathname.split("/")
    if(details.length !== 3){
      onStop();
      return;
    }

    setRoomDetails({roomId: details[1], joinToken: details[2]});
    setAppState('join');


    if (localStorage.getItem("auth") && 
      localStorage.getItem("roomId") === details[1] &&
      localStorage.getItem("joinToken") === details[2]) {
      setAuth(localStorage.getItem("auth"))
      setAppState('present');
      return;
    }
  }, []);

  return (
    <div className="relative flex flex-col justify-center h-full overflow-hidden bg-gray-50 py-6 sm:py-12">
      <div className="absolute inset-0 bg-[url(https://play.tailwindcss.com/img/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="relative bg-white px-6 pb-8 pt-5 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:max-w-lg sm:rounded-lg sm:px-10">
        <div className="mx-auto max-w-md">
          <img src="/nextslide.png" className="h-10 mb-2" alt="NextSlideApp" />
          <div className="divide-y divide-gray-300/50">
            {appState === 'validating' ? "Validating..." : ''}
            {appState === 'stopped' ? <>
              <div className="flex items-center mt-8">
                <svg xmlns="http://www.w3.org/2000/svg"
                  className="w-20 rounded-2xl p-3 border border-blue-100 text-blue-400 bg-blue-50" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div className="flex flex-col ml-3">
                  <div className="font-medium leading-none">Invalid Presentation Keys or Host Disconnection</div>
                  <p className="text-sm text-gray-600 leading-none mt-3">The host may have stopped sharing, or the presentation keys provided could be invalid. That's why you're seeing this message. Thank you for your understanding ❤.
                  </p>
                </div>
              </div>
              </> : ''}
            {appState === 'join' ? <JoinRoom roomDetails={roomDetails} onStop={onStop} onJoin={onJoin}/> : ''}
            {appState === 'present' ? <PresentationRoom auth={auth} onStop={onStop} appState={appState}/> : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;