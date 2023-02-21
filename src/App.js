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
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/SetAvatar" element={<SetAvatar />} />
        <Route path="/" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );     
}