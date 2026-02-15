import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext.js";
import ItemCard from "./ItemCard.jsx";
import AddPhotoButton from "./AddPhotoButton.jsx";

export default function CategoryGrid() {
  const [items, setItems] = useState([]); // state to hold items in this category
  const [categoryName, setCategoryName] = useState("");
  const { categoryId } = useParams(); // reads the dynamic part of URL
  const { user } = useAuthContext();

  useEffect(() => {
    // Getting the items from the server
    const fetchItems = async () => {
      try {
        const response = await fetch(`/api/categories/${categoryId}/itemCards`, {
          headers: {
            "Authorization": `Bearer ${user.token}`
          }
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


  // Handle adding new image to the grid
  const handleAddItem = async (newFile) => {
    if (!newFile) return;

    try {
      const response = await fetch(`/api/categories/${categoryId}/itemCards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Required for the server to "see" your data
          "Authorization": `Bearer ${user.token}`,
        },
        body: JSON.stringify({
            file: newFile,
            category: categoryId, // This comes from your fetchCategory useEffect
            description: "",      // Initial empty values
            userId: user.id,
            brand: "",
            url: "",
            notes: "",
            hasInfo: false
        }),
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

    try {
      const response = await fetch(`/api/categories/${categoryId}/itemCards/${itemId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.token}`,
        }
      })

      if (response.ok) {
        setItems(((prevItems) => prevItems.filter((item) => item._id !== itemId)));;
      } else {
        const errorMessage = await response.json();
        console.error(errorMessage);
        alert("Could not delete category");
      }
    } catch (err) {
      console.error("Delete request failed: ", err);
      alert("Couldn't delete the item, check your connection!");
    }
  }

  // Save the form info for an item
  const handleSaveItemInfo = (updatedItem) => {
    setItems((prevItems) => prevItems.map(item => item._id === updatedItem._id ? updatedItem : item))
  }

  return (
    <div className="w-full flex flex-col items-center pt-5">
      {/* Category name */}
      <h1 className="text-center font-[500] funnel-display text-black text-6xl pt-5 ">{categoryName.replace(/-/g, " ")}</h1>

      {/* Add Photo Button */}
      <div className="flex justify-center mt-5">
        <AddPhotoButton addItem={handleAddItem} />
      </div>

      {/* Cards container */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 justify-items-center mt-7 mb-7">
        {items.map((item) => (
          <div>
            <ItemCard key={item._id} item={item} itemId={item._id.toString()} image={item.file} onDelete={handleDeleteItem} onSave={handleSaveItemInfo}/>
          </div>
        ))  
        }
      </div>

    </div>
  );
}