import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ItemCard from "./ItemCard.jsx";
import AddPhotoButton from "./AddPhotoButton.jsx";

export default function CategoryGrid() {
  const [items, setItems] = useState([]); // state to hold items in this category
  const [categoryName, setCategoryName] = useState("");
  const { categoryId } = useParams(); // reads the dynamic part of URL

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // const responseForId = await fetch("/api/categories/");

        // if (!responseForId.ok) {
        //   throw new Error("Failed to fetch categories");
        // } 

        // const id = responseForId.json()._id;
        const response = await fetch(`/api/categories/${categoryId}`);

        if (response.ok) {
          const data = await response.json();

          // Updating states
          setCategoryName(data.categoryName);
          console.log("name", data.categoryName);
          setItems(data.items); // Axios uses .data as the consistent "bucket" for whatever your backend sent back in res.json()
        }
      } catch (err) {
        console.error("Failed to fetch images: ", err);
      }
    }
    

    fetchItems();
  }, [categoryId]);


  // Handle adding new image to the category
  const handleAddItem = async (newFile) => {
    if (!newFile) return;

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Required for the server to "see" your data
        },
        body: JSON.stringify({
            myFile: newFile,
            category: categoryId, // This comes from your fetchCategory useEffect
            description: "",      // Initial empty values
            brand: "",
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
      alert("Upload failed. Is the file too large?");
    }
  }

  // Removing an image
  const handleDeleteItem = (itemDelete) => {
    setItems((prevItems) => {
      const currentCategoryItems = prevItems[categoryId] || [];
      return {
        ...prevItems,
        [categoryId]: currentCategoryItems.filter(item => item.id !== itemDelete.id),
      };
    })
  }

  // Save the form info for an item
  const handleSaveItemInfo = (updatedItem) => {
    setItems((prevItems) => {
      const currentCategoryItems = prevItems[categoryId] || [];
      return {
        ...prevItems,
        [categoryId]: currentCategoryItems.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        )
      };
    })
  }


  return (
    <div className="w-full flex flex-col items-center pt-5">
      {/* Category name */}
      <h1 className="text-center text-white text-5xl font-inherit pt-5 font-inherit">{categoryName.replace(/-/g, " ")}</h1>

      {/* Add Photo Button */}
      <div className="flex justify-center mt-5">
        <AddPhotoButton addItem={handleAddItem} />
      </div>

      {/* Cards container */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 justify-items-center mt-7 mb-7">
        {items.map((item) => (
          <div>
            <ItemCard key={item._id} item={item} image={item.myFile} onDelete={handleDeleteItem} onSave={handleSaveItemInfo}/>
          </div>
        ))  
        }
      </div>

    </div>
  );
}