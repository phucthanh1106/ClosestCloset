import Navbar from "./components/Navbar.jsx"
import './styles/index.css'
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <>
      <Toaster 
        position="top-center" 
        reverseOrder={false}  
        toastOptions={{
          style: {
            marginTop: '40px', // Another way to add a "bump" down
            background: 'oklch(25% 0.01 250)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            },
        }}
        />
      <Navbar />
      <Outlet />
    </>
  )
}

