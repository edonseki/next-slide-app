import { useEffect, useState } from 'react';
import './App.css';
import CreateRoom from './components/CreateRoom/CreateRoom';
import ManageRoom from './components/ManageRoom/ManageRoom';
import sendRuntimeMessage from './utility/ExtensionProxy';

function App() {
  
  const [extensionState, setExtensionState] = useState({
    mode: "create",
    creatingRoom: false,
    roomId: "",
    creatorId: "",
    joinToken: "",
    hostToken: "",
    clients: [],
    tabs: []
  });

  const areObjectsIdentical = (obj1, obj2) => {
    const arraysAreEqual = (arr1, arr2) => {
      if (arr1.length !== arr2.length) {
        return false;
      }
    
      for (let i = 0; i < arr1.length; i++) {
        if (isObject(arr1[i]) && isObject(arr2[i])) {
          if (!areObjectsIdentical(arr1[i], arr2[i])) {
            return false;
          }
        } else if (arr1[i] !== arr2[i]) {
          return false;
        }
      }
    
      return true;
    }
    
    const isObject = (obj) => {
      return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
  
    if (keys1.length !== keys2.length) {
      return false;
    }
  
    for (const key of keys1) {
      if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
        if (!arraysAreEqual(obj1[key], obj2[key])) {
          return false;
        }
      } else if (isObject(obj1[key]) && isObject(obj2[key])) {
        if (!areObjectsIdentical(obj1[key], obj2[key])) {
          return false;
        }
      } else if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
  
    return true;
  }    

  useEffect(()=>{
    const interval = setInterval(()=>{
      sendRuntimeMessage({action: "getState"}, (response) => {
        if(!areObjectsIdentical(extensionState, response)){
          setExtensionState(response);
        }
      });
    }, 10);

    return ()=>{
      clearInterval(interval);
    }
  }, []);

  return <>
    <div class="relative flex flex-col justify-center overflow-hidden py-1">
      <div class="absolute inset-0 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div class="relative bg-white px-6 m:mx-auto sm:max-w-lg sm:px-10">
        <img src="nextslide.png" class="h-10 mb-3" alt="NextSlideApp" />
        <div class="mx-auto max-w-md">
          {extensionState.mode === 'create' ? 
          <CreateRoom extensionState={extensionState} /> : '' }
          {extensionState.mode === 'present' ? 
          <ManageRoom extensionState={extensionState} /> : ''}
        </div>
      </div>
    </div>
    </>;
}

export default App;
