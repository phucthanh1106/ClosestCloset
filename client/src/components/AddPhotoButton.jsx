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
                const files = Array.from(event.target.files);

                if (files.length === 0) return;

                const validFiles = files.filter((file) => file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp");

                for (const file of validFiles) {
                    try {
                        await addItem(file);
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
