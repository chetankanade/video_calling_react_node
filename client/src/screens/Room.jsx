import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../services/peer";

const RoomPage = () => {
  const socket = useSocket();

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} id ${id}, user joined`);
    setRemoteSocketId(id);
  }, []);

  // when user call/connect we will on our stream
  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    //creating offer to send other user
    const offer = await peer.getOffer();
    //(3)now we will send this offer to new user using socket
    socket.emit("user:call", { to: remoteSocketId, offer });

    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback((from,offer) => {
    console.log("----",from,offer);
    
  }, []);

  // Now need to render stream to our local machine using reactPlayer packg
  useEffect(() => {
    //(2)listening the user:joined event
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);

    //Deregistering socket to prevent re-rendering
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
    };
  }, [socket, handleUserJoined, handleIncomingCall]);
  return (
    <div>
      <h1>Room page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {
        // showing call button only if remoteSocketId is present
        remoteSocketId && <button onClick={handleCallUser}>Call</button>
      }

      {myStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            height="300px"
            width="300px"
            playing
            muted
            url={myStream}
          />
        </>
      )}
    </div>
  );
};

export default RoomPage;
