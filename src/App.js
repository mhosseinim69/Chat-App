import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chat from './pages/Chat';
import Register from './pages/Register';
import Login from './pages/Login';
import SetAvatar from './pages/SetAvatar';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="https://chat-app-9pd5.onrender.com/Register" element={<Register />} />
        <Route path="https://chat-app-9pd5.onrender.com/Login" element={<Login />} />
        <Route path="https://chat-app-9pd5.onrender.com/SetAvatar" element={<SetAvatar />} />
        <Route path="https://chat-app-9pd5.onrender.com" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );     
}