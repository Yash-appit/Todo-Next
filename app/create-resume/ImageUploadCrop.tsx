import React, { useState, useCallback } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FiEdit3 } from "react-icons/fi";


interface ImageUploadCropProps {
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: Error) => void;
}

const ImageUploadCrop: React.FC<ImageUploadCropProps> = ({
  onUploadSuccess,
  onUploadError,
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [cropper, setCropper] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null); // State for preview
  const [isContOpen, setContOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setPreview(null); // Reset preview
    e.preventDefault();
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.onerror = () => {
        setError('Error reading file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropAndUpload = useCallback(async () => {
    if (!cropper) return;
    setError(null);

    try {
      setLoading(true);

      // Get cropped canvas
      const croppedCanvas = cropper.getCroppedCanvas({
        maxWidth: 4096,
        maxHeight: 4096,
        fillColor: '#fff',
      });

      // Generate a preview URL
      const croppedImageUrl = croppedCanvas.toDataURL('image/jpeg', 0.9);
      setPreview(croppedImageUrl); // Set the preview URL

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        croppedCanvas.toBlob(
          (blob: Blob | null) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/jpeg',
          0.9
        );
      });

      // Create FormData
      const formData = new FormData();
      formData.append('signature', blob, 'signature.jpg');

      // Upload to API
      const response = await fetch(
        'https://resumebuilderbackend-fb7n.onrender.com/api/v1/uploads/uploadFile',
        {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      // console.log('Response Data:', data); // Log the parsed response data

      if (onUploadSuccess) {
        onUploadSuccess(data);
      }

      // Reset state
      setImage(null);
    } catch (error) {
      console.error('Detailed upload error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      if (onUploadError && error instanceof Error) {
        onUploadError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [cropper, onUploadSuccess, onUploadError]);

  const handleReset = () => {
    setImage(null);
    setPreview(null); // Reset preview
    setError(null);
    if (cropper) {
      cropper.destroy();
      setCropper(null);
    }
  };

  return (
<>
          {!image ? (
            <div className='pic-upload'>
               <label><FiEdit3 /></label>
               <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
          ) : (
            <div>
              <Cropper
                src={image}
                style={{ height: 400, width: '100%' }}
                aspectRatio={16 / 9}
                guides={true}
                crop={undefined}
                onInitialized={(instance) => setCropper(instance)}
                minCropBoxWidth={100}
                minCropBoxHeight={100}
              />
              <div className="d-flex justify-content-end gap-2 mt-3">
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCropAndUpload}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Uploading...
                    </>
                  ) : (
                    'Upload Cropped Image'
                  )}
                </Button>
              </div>
              {preview && (
                <div className="mt-3">
                  <h6>Preview of Cropped Image:</h6>
                  <img
                    src={preview}
                    alt="Cropped Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      border: '1px solid #ccc',
                    }}
                  />
                </div>
              )}
            </div>
          )}
       
       </>);
};

export default ImageUploadCrop;
