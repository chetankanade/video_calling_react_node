import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";

const RoomPage = () => {
  const socket = useSocket();

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} id ${id}, user joined`);
    setRemoteSocketId(id);
  }, []);

  // when user call/connect we will unable audio video
  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    setMyStream(stream);
  }, []);

  // Now need to render stream to our local machine using reactPlayer packg

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
