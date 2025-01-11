import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../services/peer";

const RoomPage = () => {
  const socket = useSocket();

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();

  // (7)
  const [remoteStream, setRemoteStream] = useState();

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

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      console.log("incoming call", from, offer);
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);

      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  // (7 & 11)
  const sendStream = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  // (6)
  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("call accepted");

      sendStream(); //(7) Now after call accepted we will exchange stream
    },
    [sendStream]
  );

  //(8)
  const handleNegotiationNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  //(8) for negotiation
  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegotiationNeeded);

    //de-register same thing 👆
    return () => {
      peer.peer.removeEventListener(
        "negotiationneeded",
        handleNegotiationNeeded
      );
    };
  }, [handleNegotiationNeeded]);

  //(9)
  const handleIncomingNegotiation = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  // (10)
  const handleNegoFinal = useCallback(async ({ from, ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  //(7)
  useEffect(() => {
    peer.peer.addEventListener("track", async (eventt) => {
      const remoteStream = eventt.streams;
      console.log("GOT TRACKS!!");

      setRemoteStream(remoteStream[0]);
    });
  }, []);

  // Now need to render stream to our local machine using reactPlayer packg
  useEffect(() => {
    //(2)listening the user:joined event
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleIncomingNegotiation); //(9)
    socket.on("peer:nego:final", handleNegoFinal); //(10)

    //Deregistering socket to prevent re-rendering
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleIncomingNegotiation); //(9)
      socket.off("peer:nego:final", handleNegoFinal); //(10)
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleIncomingNegotiation,
    handleNegoFinal,
  ]);
  return (
    <div>
      <h1>Room page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>

      {myStream && <button onClick={sendStream}>Send Stream</button>}
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

      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer
            height="300px"
            width="300px"
            playing
            muted
            url={remoteStream}
          />
        </>
      )}
    </div>
  );
};

export default RoomPage;
