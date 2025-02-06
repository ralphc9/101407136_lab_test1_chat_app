// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container">
      <h1>Welcome to the Chat App</h1>
      <Link to="/login"><button>Login</button></Link>
      <Link to="/signup"><button>Signup</button></Link>
    </div>
  );
}

export default Home;
