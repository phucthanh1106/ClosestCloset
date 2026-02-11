import Navbar from "./components/Navbar.jsx"
import './styles/index.css'
import { Outlet } from 'react-router-dom';

export default function App() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

