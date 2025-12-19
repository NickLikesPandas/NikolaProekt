import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

interface Image {
    id: number;
    title: string;
    file_name: string;
    file_url: string;
}

const Images: React.FC = () => {
    const [images, setImages] = useState<Image[]>([]);
    const [form, setForm] = useState<{ id: number; title: string; file: File | null }>({
        id: 0,
        title: '',
        file: null,
    });
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Helper to get CSRF token safely
    const getCsrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    // Fetch all images
    const fetchImages = async () => {
        try {
            const response = await fetch('/images', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(), // Add CSRF token
                },
            });

            //if (!response.ok) {
            //    throw new Error('Failed to fetch images');
           // }

            const data = await response.json();
            setImages(data.images);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    // Handle input changes
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    // Handle file input changes
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setForm({ ...form, file });
    };

    // Add a new image
    const handleAddImage = async () => {
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            if (form.file) {
                formData.append('file', form.file);
            }

            const response = await fetch('/images', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(), // Add CSRF token
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add image');
            }

            const data = await response.json();
            setImages((prevImages) => [data.image, ...prevImages]);
            setForm({ id: 0, title: '', file: null });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Update an existing image
    const handleUpdateImage = async () => {
        if (editingIndex !== null) {
            try {
                const formData = new FormData();
                formData.append('title', form.title);
                if (form.file) {
                    formData.append('file', form.file);
                }

                const response = await fetch(`/images/${form.id}`, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': getCsrfToken(), // Add CSRF token
                    },
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to update image');
                }

                const data = await response.json();
                setImages((prevImages) =>
                    prevImages.map((img) => (img.id === data.image.id ? data.image : img))
                );

                setEditingIndex(null);
                setForm({ id: 0, title: '', file: null });
            } catch (error) {
                console.error('Error updating the image:', error);
            }
        }
    };

    // Delete an image
    const handleDeleteImage = async (id: number) => {
        if (!confirm('Are you sure?')) return;

        try {
            const response = await fetch(`/images/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(), // Add CSRF token
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete image');
            }

            setImages((prevImages) => prevImages.filter((img) => img.id !== id));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Edit an image
    const handleEditImage = (image: Image) => {
        setForm({ id: image.id, title: image.title, file: null });
        setEditingIndex(image.id);
    };

    // Handle form submission
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        editingIndex === null ? handleAddImage() : handleUpdateImage();
    };

    return (
        <div style={{ padding: '20px' }}>
            <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    placeholder="Title"
                    required
                    style={{ marginRight: '10px' }}
                />
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ marginRight: '10px' }}
                />
                <button type="submit">
                    {editingIndex === null ? 'Add Image' : 'Update Image'}
                </button>
                {editingIndex !== null && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditingIndex(null);
                            setForm({ id: 0, title: '', file: null });
                        }}
                        style={{ marginLeft: '10px' }}
                    >
                        Cancel
                    </button>
                )}
            </form>

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {images.map((image) => (
                    <li key={image.id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                                src={image.file_url}
                                alt={image.title}
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            />
                            <div>
                                <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>{image.title}</p>
                                <button
                                    onClick={() => handleEditImage(image)}
                                    style={{ marginRight: '5px' }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteImage(image.id)}
                                    style={{ color: 'red' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Images;