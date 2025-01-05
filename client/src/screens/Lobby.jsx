import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";
const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  //using our socket
  const socket = useSocket();

  //use navigate to push user to any route
  const navigate = useNavigate();

  const handleSumbitForm = useCallback(
    (e) => {
      e.preventDefault();
      //emitting with our email n room (sending data to backend)
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  //handling room join
  const handleJoinRoom = useCallback(
    (data) => {
      const { room } = data;

      //sending user to particular room
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    //(1) using data which came back from B_End
    socket.on("room:join", handleJoinRoom);
    //Deregistering listener, to prevent multiple rerending of comp.
    return () => {
      //as socket.on, we do socket.off also to off
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div>
      <h1>Lobby</h1>
      <form onSubmit={handleSumbitForm}>
        <label htmlFor="email">Email Id</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <label htmlFor="room">Room Number</label>
        <input
          type="text"
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button>Join</button>
      </form>
    </div>
  );
};

export default LobbyScreen;
