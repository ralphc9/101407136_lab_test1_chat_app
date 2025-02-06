import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const socket = io('http://localhost:5000'); // Backend server URL (Socket.io)

function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState('chatroom1'); // Default room
  const navigate = useNavigate();
  const messagesEndRef = useRef(null); // Ref to scroll to the bottom of messages

  // Emit the message when the user clicks "Send"
  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = { from_user: 'ralphc', message };

      // Emit to server
      socket.emit('sendMessage', { ...newMessage, room });

      // Display the message immediately
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      setMessage(''); // Clear the input field
    }
  };

  // Handle user logout
  const handleLogout = () => {
    socket.disconnect();
    navigate('/login');
  };

  // Listen for incoming messages
  useEffect(() => {
    const receiveMessageHandler = (msg) => {
      console.log('Received message: ', msg);
      setMessages((prevMessages) => [...prevMessages, msg]); // Append new message
    };

    socket.on('receiveMessage', receiveMessageHandler);

    return () => {
      socket.off('receiveMessage', receiveMessageHandler);
    };
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-container">
      <h1>Chat Room</h1>

      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.from_user}:</strong> {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Auto-scroll anchor */}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()} // Send on Enter key press
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </div>
  );
}

export default Chat;
