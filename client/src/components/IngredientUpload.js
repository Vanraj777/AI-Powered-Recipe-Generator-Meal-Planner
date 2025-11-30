import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './IngredientUpload.css';

function IngredientUpload({ onIngredientsRecognized }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/api/ingredients/recognize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (onIngredientsRecognized) {
        onIngredientsRecognized(response.data.ingredients);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to recognize ingredients');
      console.error('Error recognizing ingredients:', error);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });

  return (
    <div className="ingredient-upload">
      <div
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="upload-status">
            <div className="spinner"></div>
            <p>Recognizing ingredients...</p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📸</div>
            <p>
              {isDragActive
                ? 'Drop the image here'
                : 'Drag & drop an image here, or click to select'}
            </p>
            <p className="upload-hint">Upload a photo of ingredients to identify them</p>
          </div>
        )}
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default IngredientUpload;

