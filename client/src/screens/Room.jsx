import React, { useCallback, useEffect } from "react";
import { useSocket } from "../context/SocketProvider";

const RoomPage = () => {
  const socket = useSocket();

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} id ${id}, user joined`);
  });


  useEffect(() => {
  
    //(2)listening the user:joined event    
    socket.on("user:joined", handleUserJoined);

    //Deregistering socket to prevent re-rendering
    return () => {
      socket.off("user:joined", handleUserJoined);
    };

  }, [socket, handleUserJoined]);
  return (
    <div>
      <h1>Room page</h1>
    </div>
  );
};

export default RoomPage;
