import React, { useState } from 'react';


const JoinRoom = (props) => {
  const [userName, setUserName] = useState('');
  const [joinText, setJoinText] = useState("Join");

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      joinRoom();
    }
  };

  const onInputchange = (event) => {
    setUserName(event.target.value);
  }

  const joinRoom = () => {
    if(!userName){
      return;
    }

    setJoinText("Joining...");

    fetch(`${process.env.REACT_APP_API_URL}/presentation/join/${props.roomDetails.roomId}/${props.roomDetails.joinToken}`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          'username': userName
      })
    }).then((r)=>{
      if(r.status === 401 || r.status === 404){
        props.onStop();
        return;
      }
      return r.json()
    }).then((data)=>{
      if(!data.status === "OK"){
        alert(data.message);
        return;
      }

      setJoinText("Join");
      props.onJoin(data);
    }).catch((e)=>{
      props.onStop();
    });
  }

  return <>
    <div>
      <input onKeyDown={handleKeyPress} value={userName} onChange={onInputchange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Nickname"></input>
    </div>
    <div className="mt-2">
      <button onClick={()=>{joinRoom()}} type="button" className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow w-full">
        {joinText}
      </button>
    </div>
  </>
};

export default JoinRoom;
