import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link } from '@inertiajs/react';

interface Image {
    id: number;
    title: string;
    src: string;
}

const Images: React.FC = () => {
    const [images, setImages] = useState<Image[]>([]);
    const [form, setForm] = useState<Image>({ id: 0, title: '', src: '' });
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    const fetchImages = async () => {
        try {
            const response = await fetch('/images', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setImages(data);
            } else {
                console.error('Failed to fetch images');
            }
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    // Handle text inputs (Title, etc.)
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    // --- NEW: Handle File Upload (Convert to Base64 String) ---
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // The result is a Base64 string which we can save in 'src'
                // The backend will treat this just like a long text string
                setForm({ ...form, src: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddImage = async () => {
        try {
            const response = await fetch('/images', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify(form),
            });

            if (response.ok) {
                await fetchImages();
            } else {
                console.error('Failed to save the image');
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setForm({ id: 0, title: '', src: '' });
    };

    const handleEditImage = (index: number) => {
        const imageToEdit = images[index];
        setForm(imageToEdit);
        setEditingIndex(index);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUpdateImage = async () => {
        if (editingIndex !== null) {
            try {
                const response = await fetch(`/images/${form.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken || '',
                    },
                    body: JSON.stringify(form),
                });

                if (response.ok) {
                    await fetchImages();
                    setEditingIndex(null);
                } else {
                    console.error('Failed to update the image');
                }
            } catch (error) {
                console.error('Error updating the image:', error);
            }
        }
        setForm({ id: 0, title: '', src: '' });
    };

    const handleDeleteImage = async (index: number) => {
        const imageToDelete = images[index];
        try {
            const response = await fetch(`/images/${imageToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            });

            if (response.ok) {
                await fetchImages();
            } else {
                console.error('Failed to delete the image');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.headerRow}>
                <Link href="/dashboard" style={styles.dashboardButton}>
                    &larr; Dashboard
                </Link>
                <h1 style={styles.header}>Image Gallery</h1>
            </div>

            {/* Input Bar */}
            <div style={styles.formCard}>
                <h3 style={styles.formTitle}>
                    {editingIndex !== null ? 'Edit Image' : 'Add New Image'}
                </h3>
                
                <div style={styles.formInputs}>
                    <input
                        type="text"
                        name="title"
                        placeholder="Image Title"
                        value={form.title}
                        onChange={handleInputChange}
                        style={styles.input}
                    />
                    
                    {/* Option 1: Paste URL */}
                    <input
                        type="text"
                        name="src"
                        placeholder="Paste Image URL..."
                        value={form.src.substring(0, 30) + (form.src.length > 30 ? '...' : '')} // Truncate display if it's base64
                        onChange={handleInputChange}
                        style={styles.input}
                    />

                    {/* Option 2: Upload File */}
                    <div style={styles.fileUploadWrapper}>
                        <label style={styles.fileLabel}>
                            Or Upload File
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                style={styles.hiddenFileInput} 
                            />
                        </label>
                    </div>

                    {/* Preview of currently selected image in form */}
                    {form.src && (
                        <div style={styles.previewContainer}>
                            <img src={form.src} alt="Preview" style={styles.previewImage} />
                        </div>
                    )}

                    {editingIndex !== null ? (
                        <div style={styles.buttonGroup}>
                            <button onClick={handleUpdateImage} style={{...styles.button, ...styles.updateButton}}>
                                Update
                            </button>
                            <button 
                                onClick={() => { setEditingIndex(null); setForm({ id: 0, title: '', src: '' }); }} 
                                style={{...styles.button, ...styles.cancelButton}}
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleAddImage} style={{...styles.button, ...styles.addButton}}>
                            + Add to Gallery
                        </button>
                    )}
                </div>
            </div>

            {/* Gallery Grid */}
            <div style={styles.galleryGrid}>
                {images.map((image, index) => (
                    <div key={image.id} style={styles.galleryCard}>
                        <div style={styles.imageWrapper}>
                            <img src={image.src} alt={image.title} style={styles.image} />
                            <div style={styles.overlay}>
                                <button onClick={() => handleEditImage(index)} style={styles.iconButton}>
                                    ✎ Edit
                                </button>
                                <button onClick={() => handleDeleteImage(index)} style={{...styles.iconButton, ...styles.deleteIcon}}>
                                    ✕ Delete
                                </button>
                            </div>
                        </div>
                        <div style={styles.cardFooter}>
                            <p style={styles.imageTitle}>{image.title}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            {images.length === 0 && (
                <div style={styles.emptyState}>
                    No images found. Add one above!
                </div>
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '30px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: '#f4f6f8',
        minHeight: '100vh',
    },
    headerRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px',
    },
    dashboardButton: {
        textDecoration: 'none',
        color: '#555',
        fontWeight: '600',
        fontSize: '14px',
    },
    header: {
        margin: 0,
        color: '#2c3e50',
        flexGrow: 1,
        textAlign: 'center',
        marginRight: '80px',
    },
    formCard: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        marginBottom: '40px',
        border: '1px solid #e1e4e8',
    },
    formTitle: {
        margin: '0 0 15px 0',
        fontSize: '16px',
        color: '#7f8c8d',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    formInputs: {
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        minWidth: '200px',
        padding: '12px 15px',
        fontSize: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    // Styles for file upload
    fileUploadWrapper: {
        display: 'flex',
        alignItems: 'center',
    },
    fileLabel: {
        backgroundColor: '#e9ecef',
        color: '#495057',
        padding: '12px 15px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 600,
        border: '1px solid #ced4da',
        whiteSpace: 'nowrap',
    },
    hiddenFileInput: {
        display: 'none',
    },
    previewContainer: {
        width: '50px',
        height: '50px',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '1px solid #ddd',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
    },
    button: {
        padding: '12px 25px',
        fontSize: '15px',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    addButton: {
        backgroundColor: '#3498db',
        color: '#fff',
    },
    updateButton: {
        backgroundColor: '#2ecc71',
        color: '#fff',
    },
    cancelButton: {
        backgroundColor: '#e74c3c',
        color: '#fff',
    },
    galleryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '25px',
    },
    galleryCard: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        display: 'flex',
        flexDirection: 'column',
    },
    imageWrapper: {
        position: 'relative',
        height: '200px',
        width: '100%',
        backgroundColor: '#eee',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    overlay: {
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        display: 'flex',
        gap: '8px',
    },
    iconButton: {
        padding: '6px 12px',
        fontSize: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        color: '#333',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    },
    deleteIcon: {
        color: '#e74c3c',
    },
    cardFooter: {
        padding: '15px',
        borderTop: '1px solid #f0f0f0',
    },
    imageTitle: {
        margin: 0,
        fontWeight: '600',
        color: '#333',
        fontSize: '16px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    emptyState: {
        textAlign: 'center',
        padding: '50px',
        color: '#95a5a6',
        fontSize: '18px',
    }
};

export default Images;