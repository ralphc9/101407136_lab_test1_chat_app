import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();  // Updated to useNavigate

  const leaveRoom = () => {
    navigate("/chat");  // Navigate back to the chat page
  };

  return (
    <div>
      <h1>Room {roomId}</h1>
      <button onClick={leaveRoom}>Leave Room</button>
    </div>
  );
};

export default Room;
