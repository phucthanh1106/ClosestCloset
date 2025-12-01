import { useState } from 'react';
import Navbar from "./Navbar.jsx"
import '../index.css';
import { Outlet, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

export default App;
