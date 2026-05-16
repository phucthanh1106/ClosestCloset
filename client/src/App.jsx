import Navbar from "./components/Navbar.jsx"
import TypewriterText from "./components/TypewriterText.jsx";
import { useAuthContext } from "./hooks/useAuthContext.js";
import './styles/index.css'
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import API_BASE_URL from './config.js';


export default function App() {
  const [typingDone, setTypingDone] = useState(false);
  const location = useLocation().pathname;
  const { user } = useAuthContext();
  const [categories, setCategories] = useState([]);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Fetch categories when user is logged in or when navigating to home page
  useEffect(() => {
    const fetchCategories = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/categories`, {
          headers: {
            "Authorization": `Bearer ${user.token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    if (user && location === "/") {
      fetchCategories();
    }
  }, [user, location]);

  // Handle creating a new category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    setIsCreating(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({
          name: newCategoryName,
          userId: user.id
        })
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories([newCategory, ...categories]);
        setNewCategoryName("");
        setShowCreateInput(false);
        toast.success(`Category "${newCategoryName}" created!`);
      }
    } catch (err) {
      console.error("Failed to create category:", err);
      toast.error("Failed to create category");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Toaster 
        position="top-center" 
        reverseOrder={false}  
        toastOptions={{
          style: {
            marginTop: '40px', 
            background: 'oklch(25% 0.01 250)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            },
        }}
        />

      <Navbar />

      {/* Text running */}
      {location==="/" && (
        <div className="flex items-center justify-center min-h-[calc(100vh-350px)] px-6">
          <div className="text-8xl flex flex-col [word-spacing:-0.5em] items-center font-black shizuru-regular text-white text-center">
              {/* When people first visit the site */}
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

              {/* When user is logged in */}
              {user && (
                <div className="flex flex-col items-center gap-8">
                  <TypewriterText
                    text="Welcome to your closet!"
                    speed={100}
                  />

                  {/* Categories and Create Button */}
                  <div className="flex flex-wrap justify-center items-center gap-6 max-w-5xl">
                    {/* Category Buttons */}
                    {categories.map((category) => (
                      <a
                        key={category._id}
                        href={`/${user.id}/${category._id}`}
                        className="font-bold text-2xl funnel-display [word-spacing:normal] whitespace-nowrap text-white bg-gray-800 hover:bg-gray-700 px-8 py-4 rounded-lg border-white shadow-lg transition"
                      >
                        {category.name.replace(/-/g, " ")}
                      </a>
                    ))}

                    {/* Create Category Button / Input */}
                    {!showCreateInput ? (
                      <button
                        onClick={() => setShowCreateInput(true)}
                        className="font-bold text-4xl funnel-display w-16 h-16 flex items-center justify-center text-white bg-green-400 hover:bg-green-300 rounded-full  border-white shadow-lg transition"
                      >
                        +
                      </button>
                    ) : (
                      <form onSubmit={handleCreateCategory} className="flex gap-3 items-center">
                        <input
                          type="text"
                          placeholder="New category"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="px-6 py-4 text-2xl funnel-display rounded-lg bg-gray-800 text-white border-3 border-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={isCreating}
                          className="font-bold text-2xl funnel-display text-white bg-gray-800 hover:bg-gray-700 disabled:opacity-50 px-6 py-4 rounded-lg border-3 border-white transition"
                        >
                          {isCreating ? "..." : "Add"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateInput(false);
                            setNewCategoryName("");
                          }}
                          className="font-bold text-2xl funnel-display text-white bg-gray-800 hover:bg-gray-700 px-6 py-4 rounded-lg border-3 border-white transition"
                        >
                          ✕
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
      <Outlet />
    </>
  )
}

