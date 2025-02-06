import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const socket = io('http://localhost:5000'); // Backend server URL (Socket.io)

function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState('chatroom1'); // Default room
  const [typing, setTyping] = useState(false); // State to track typing indicator
  const [typingUser, setTypingUser] = useState(''); // Track user who's typing
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
      setTyping(false); // Reset typing indicator
      socket.emit('stopTyping', { room, user: 'ralphc' }); // Stop typing event
    }
  };

  // Emit typing event when the user types
  const handleTyping = () => {
    if (!typing) {
      setTyping(true);
      socket.emit('userTyping', { room, user: 'ralphc' }); // Emit typing event
    }

    // Reset typing state after a delay (e.g., 3 seconds)
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      setTyping(false);
      socket.emit('stopTyping', { room, user: 'ralphc' }); // Emit stop typing event
    }, 3000); // Duration for typing indicator (increased to 3 seconds)
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

  // Listen for typing events
  useEffect(() => {
    const typingHandler = (user) => {
      setTyping(true); // Show typing indicator for the specified user
      setTypingUser(user); // Show the username of the typing user
    };

    const stopTypingHandler = (user) => {
      setTyping(false); // Hide typing indicator when the user stops typing
      setTypingUser(''); // Reset the username
    };

    socket.on('userTyping', typingHandler);
    socket.on('stopTyping', stopTypingHandler);

    return () => {
      socket.off('userTyping', typingHandler);
      socket.off('stopTyping', stopTypingHandler);
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

      {/* Typing indicator above the text box */}
      {typing && <div className="typing-indicator">{typingUser} ralphc is typing...</div>}

      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()} // Send on Enter key press
          onInput={handleTyping} // Detect typing
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </div>
  );
}

export default Chat;
