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

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
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
            <div style={styles.linkContainer}>
                <Link href="/dashboard" style={styles.dashboardButton}>
                    &larr; Back to Dashboard
                </Link>
            </div>

            <h1 style={styles.header}>Images</h1>
            <div style={styles.formContainer}>
                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={form.title}
                    onChange={handleInputChange}
                    style={styles.input}
                />
                <input
                    type="text"
                    name="src"
                    placeholder="Image Source"
                    value={form.src}
                    onChange={handleInputChange}
                    style={styles.input}
                />
                {editingIndex !== null ? (
                    <button onClick={handleUpdateImage} style={styles.button}>
                        Update Image
                    </button>
                ) : (
                    <button onClick={handleAddImage} style={styles.button}>
                        Add Image
                    </button>
                )}
            </div>
            <ul style={styles.imagesList}>
                {images.map((image, index) => (
                    <li key={image.id} style={styles.imageItem}>
                        <h3 style={styles.imageTitle}>{image.title}</h3>
                        <img src={image.src} alt={image.title} style={styles.image} />
                        <div style={styles.imageActions}>
                            <button onClick={() => handleEditImage(index)} style={styles.editButton}>
                                Edit
                            </button>
                            <button onClick={() => handleDeleteImage(index)} style={styles.deleteButton}>
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: '700px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    linkContainer: {
        marginBottom: '20px',
    },
    dashboardButton: {
        display: 'inline-block',
        padding: '10px 20px',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#007BFF',
        textDecoration: 'none',
        borderRadius: '5px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    header: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '20px',
    },
    formContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '20px',
    },
    input: {
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '5px',
    },
    button: {
        padding: '10px',
        fontSize: '16px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    imagesList: {
        listStyle: 'none',
        padding: '0',
    },
    imageItem: {
        backgroundColor: '#fff',
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        marginBottom: '10px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    imageTitle: {
        margin: '0 0 5px',
        color: '#333',
        fontWeight: 'bold',
    },
    image: {
        maxWidth: '100%',
        height: 'auto',
        marginBottom: '10px',
    },
    imageActions: {
        display: 'flex',
        gap: '10px',
    },
    editButton: {
        padding: '5px 10px',
        fontSize: '14px',
        backgroundColor: '#FFC107',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    deleteButton: {
        padding: '5px 10px',
        fontSize: '14px',
        backgroundColor: '#DC3545',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
};

export default Images;