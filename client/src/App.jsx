import Navbar from "./components/Navbar.jsx"
import TypewriterText from "./components/TypewriterText.jsx";
import { useAuthContext } from "./hooks/useAuthContext.js";
import './styles/index.css'
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useLocation } from "react-router-dom";
import { useState } from "react";


export default function App() {
  const [typingDone, setTypingDone] = useState(false);
  const location = useLocation().pathname;
  const { user } = useAuthContext();

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
      {location==="/" && (
        <div className="flex items-center justify-center min-h-[calc(100vh-350px)] px-6">
          <div className="text-8xl flex flex-col [word-spacing:-0.5em] items-center font-black shizuru-regular text-white text-center">
              {!user && (
                <>
                  <div className="top-[20%] text-center mr-50 ml-50">
                    <TypewriterText
                      className="fixed"
                      text="Archive your wishlist in your closest closet"
                      speed={50}
                      onComplete={() => setTypingDone(true)}
                    />
                  </div>

                  <div></div>
                  {/* Button to get to login page */}
                  <div className="flex flex-col items-center gap-6">
                      <button
                        onClick={() => window.location.href = "/signup"}
                        className={
                          `mt-[6vh] font-bold text-5xl text-[oklch(27.1%_0.105_12.094)] bg-[oklch(64.8%_0.2_131.684)]/50 [word-spacing:-0.5em] hover:bg-[oklch(64.8%_0.2_131.684)]/60 px-4 py-2 rounded-full border-4 border-[oklch(27.1%_0.105_12.094)] shadow-2xl
                          ${typingDone ? "opacity-100" : "opacity-0 pointer-events-none"}`
                        }
                      >
                        SIGN UP
                      </button>    
                  </div>
                </>
              )}
              {user && (
                <TypewriterText
                  text="Welcome to your closet!"
                  speed={55}
                />
              )}
          </div>
        </div>
      )}
      <Outlet />
    </>
  )
}

