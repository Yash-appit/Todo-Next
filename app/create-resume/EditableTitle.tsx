import { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import { RiEditFill } from "react-icons/ri";

interface EditableTitleProps {
  initialTitle: string | null;
  onTitleChange: (newTitle: string) => void;
  className?: string;
}

const EditableTitle: React.FC<EditableTitleProps> = ({ initialTitle, onTitleChange, className }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle || 'Untitled');

  useEffect(() => {
    setTitle(initialTitle || 'Untitled');
  }, [initialTitle]);

  const handleBlur = () => {
    setIsEditing(false);
    onTitleChange(title);
  };

  return (
    <>
      {isEditing ? (
        <TextField
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleBlur}
          className={`title ${className || ''}`}
          fullWidth
          autoFocus
          variant="standard"
          inputProps={{
            maxLength: 50,
          }}
          InputProps={{
            disableUnderline: true,
            style: {
              fontSize: '1.5rem',
              fontWeight: 'bold',
              padding: 0,
              margin: 0
            },
     
          }}
          sx={{
            '& .MuiInputBase-root': {
              padding: 0,
              margin: 0
            }
          }}

        />
      ) : (
        <h3 className={`text-center my-4 mt-3 ${className || ''}`}>
          {title}
          <button 
            type="button" 
            onClick={() => setIsEditing(true)} 
            className="fs-4 border-0 bg-transparent sec-col"
          >
            <RiEditFill />
          </button>
        </h3>
      )}
    </>
  );
};

export default EditableTitle;