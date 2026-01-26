import { useState } from 'react';
import Navbar from "./Navbar.jsx"
import '../styles/index.css'
import { Outlet, Route, Routes } from 'react-router-dom';

export default function App() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

