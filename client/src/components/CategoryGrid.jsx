import { useParams, useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext.js";
import ItemCard from "./ItemCard.jsx";
import AddPhotoButton from "./AddPhotoButton.jsx";
import ShowProgress from "./ShowProgress.jsx";
import API_BASE_URL from '../config.js';
import socket from "../sockets/socketClient.js"


export default function CategoryGrid() {
  const [items, setItems] = useState([]); // state to hold items in this category
  const [categoryName, setCategoryName] = useState("");
  const [liveStatus, setLiveStatus] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const { categoryId } = useParams(); // reads the dynamic part of URL
  const { user } = useAuthContext();
  const { handleRenameCategory } = useOutletContext();

  useEffect(() => {
    // Getting the items from the server
    const fetchItems = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}/itemCards`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();

          // Updating states
          setCategoryName(data.categoryName);
          setItems(data.items); 
        }
      } catch (err) {
        console.error("Failed to fetch images: ", err);
      }
    }

    if (user) {
      fetchItems();
    }
  }, [categoryId, user]);

  // Handle Ctrl+V / Cmd+V paste event
  useEffect(() => {
    const handlePaste = async (e) => {
      // Check if clipboard has items
      if (!navigator.clipboard) {
        console.warn("Clipboard API not available");
        return;
      }

      try {
        // Try to read image files from clipboard
        const items = await navigator.clipboard.read();
        
        for (const item of items) {
          if (item.types.includes("image/png") || item.types.includes("image/jpeg") || item.types.includes("image/webp")) {
            const imageType = item.types.find(t => t.startsWith("image/"));
            const blob = await item.getType(imageType);
            const file = new File([blob], `pasted-image.${imageType.split("/")[1]}`, { type: imageType });

            handleAddItem(file);
            return;
          }
        }
      } catch (err) {
        console.error("Paste event failed:", err);
      }
    };

    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [categoryId, user]);


  // WebSocket Live Update
  useEffect(() => {
    const handleUploadStatus = (status) => {
        setLiveStatus(status);
    };

    socket.on("upload-status", handleUploadStatus);

    return () => {
        socket.off("upload-status", handleUploadStatus);
    };
  }, []);


  // Handle adding new image to the grid
  const handleAddItem = async (newFile) => {
    if (!newFile) return;

    try {
      const formData = new FormData();
      formData.append("image", newFile); // must match uploadImage.single("image")
      formData.append("category", categoryId);
      formData.append("description", "");
      formData.append("userId", user.id);
      formData.append("brand", "");
      formData.append("url", "");
      formData.append("notes", "");
      formData.append("hasInfo", "false");

      const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}/itemCards`, {
        method: 'POST',
        headers: {
          "X-Socket-ID": socket.id,
        },
        credentials: "include",
        body: formData,
      });

      const savedItem = await response.json();

      if (response.ok) {
        setItems((prevItems) => [...prevItems, savedItem]);
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (err) {
      console.error("Failed to add image to database:", err);
      alert("Upload failed!");
    }
  }

  // Removing an image
  const handleDeleteItem = async (itemId) => {
    // Check for user's confirmation
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    // Cache the item in memory just in case we need to roll back on server failure
    const itemToBackup = items.find((item) => item._id === itemId);

    // OPTIMISTIC UPDATE: Remove it from the UI state instantly!
    setItems((prevItems) => prevItems.filter((item) => item._id !== itemId));

    try {
      // Fire off the delete request quietly in the background
      const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}/itemCards/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorMessage = await response.json();
        console.error(errorMessage);
        alert("Could not delete item");
      }

      console.log(`Successfully removed item ${itemId} from database and Pinecone index.`);

    } catch (err) {
      console.error("Delete request failed: ", err);
      alert("Couldn't delete the item, check your connection!");

      // 5. 🛡️ STATE ROLLBACK: If the network failed, put the item right back where it was
      if (itemToBackup) {
        setItems((prevItems) => [...prevItems, itemToBackup]);
      }
    }
  }

  // Save the form info for an item
  const handleSaveItemInfo = (updatedItem) => {
    setItems((prevItems) => prevItems.map(item => item._id === updatedItem._id ? updatedItem : item))
  }

  // Rename category
  const handleStartEdit = () => {
    setEditName(categoryName);
    setIsEditing(true);
  }

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName("");
  }

  const handleSaveName = async () => {
    const trimmed = editName.trim();
    if (!trimmed) return alert('Category name cannot be empty');

    setIsSavingName(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({ name: trimmed }),
      });

      if (response.ok) {
        const updated = await response.json();
        setCategoryName(updated.name);
        handleRenameCategory(updated);
        setIsEditing(false);
        // Reload so navbar/dropdown syncs
        setEditName("");
      } else {
        const err = await response.json();
        console.error('Rename failed', err);
        alert('Rename failed');
      }
    } catch (err) {
      console.error('Rename error', err);
      alert('Rename failed');
    } finally {
      setIsSavingName(false);
    }
  }

  return (
    <div className="w-full flex flex-col items-center pt-5">
      <ShowProgress status={liveStatus} />

      {/* Category name with edit button */}
      <div className="w-full flex items-center justify-center pt-5 ml-10">
        {!isEditing ? (
          <h1 className="font-[500] funnel-display text-black text-6xl">{categoryName}</h1>
        ) : (
          <input
            className="text-center text-6xl funnel-display bg-transparent border-b-2 border-dashed border-gray-400 focus:outline-none"
            value={editName}
            style={{ width: `${Math.max(editName.length, 2)}ch` }}
            onChange={(e) => setEditName(e.target.value)}
          />
        )}

        {/* Pen icon / buttons */}
        <div className="ml-4">
            {!isEditing ? (
              <button onClick={handleStartEdit} aria-label="Edit category" className="text-gray-700 hover:text-black relative top-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
              </button>
            ) : (
              <div className="flex gap-2 items-center relative top-2">
                <button
                  onClick={handleSaveName}
                  disabled={isSavingName}
                  title="Save"
                  className={`p-2 rounded ${isSavingName ? 'opacity-60 cursor-not-allowed' : 'hover:text-black text-white'}`}>
                  {!isSavingName ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  )}
                </button>

                <button onClick={handleCancelEdit} title="Cancel" className="p-2 text-white rounded hover:text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            )}
        </div>
      </div>

      {/* Add Photo Button */}
      <div className="flex mt-5">
        <AddPhotoButton addItem={handleAddItem} />
      </div>

      {/* Cards container */}
      <div className="mt-7 mb-7 w-full max-w-[95vw] px-4 sm:px-6 lg:px-8 columns-1 sm:columns-2 lg:columns-3 xl:columns-4 [column-gap:1.25rem]">
        {items.map((item) => (
          <div key={item._id} className="mb-5 break-inside-avoid">
            <ItemCard item={item} itemId={item._id.toString()} image={item.file} onDelete={handleDeleteItem} onSave={handleSaveItemInfo}/>
          </div>
        ))}
      </div>
    </div>
  );
}
