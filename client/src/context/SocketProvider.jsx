import { io } from "socket.io-client";
import React, { createContext, useContext, useMemo } from "react";
const SocketContext = createContext(null);


//custom hook useSocket, wherever I want to use socket i will call this useSocket fn
export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

//Creating a react provider which manage data passing through components
export const SocketProvider = (props) => {
  //Giving backend server address
  const socket = useMemo(() => io(`localhost:8000`), []);

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};
