import { styled } from '@mui/material/styles';
import { useRef } from "react";
import Button from '@mui/material/Button';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function AddPhotoButton({ addItem }) {
    const fileInputRef = useRef();

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
                resolve(fileReader.result);
            };
            fileReader.onerror = (error) => {
                reject(error)
            }
        })
    };

    return (
        <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        startIcon={<AddPhotoAlternateIcon />}
        sx={{
            backgroundColor: '#333333',   // dark grey
            color: 'white',               // text color
            '&:hover': {
            backgroundColor: '#555555', // slightly lighter on hover
            },
        }}
        >
        Upload
        <VisuallyHiddenInput
            ref={fileInputRef}  
            type="file"
            onChange={async (event) => {
                const files = Array.from(event.target.files); // convert FileList to array

                // Check that at least one file is selected
                if (files.length === 0) return;

                // Filter only jpg/png files (extra safety)
                const validFiles = files.filter((file) => file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp");

                // Convert to base 64
                // IMPORTANT!!!: Use a for loop instead of using forEach since forEach does not support async 
                for (const file of validFiles) {
                    try {
                        const base64 = await convertToBase64(file);
                        // This will now wait for the server to say "OK" before moving to the next file
                        await addItem(base64); 
                    } catch (err) {
                        console.error("Error processing file:", file.name, err);
                    }
                }

                fileInputRef.current.value = null; // reset the input
            }}
            multiple
        />
        </Button>
    );
}