"use client";
import { useState, useRef, FormEvent } from 'react';
import styles from './UploadForm.module.css';

export default function UploadForm({ onUploadSuccess }: { onUploadSuccess: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('description', description);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                setFile(null);
                setTitle('');
                setDescription('');
                if (fileInputRef.current) fileInputRef.current.value = '';
                onUploadSuccess();
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error(error);
            alert('Error uploading');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className={`card ${styles.form}`} onSubmit={handleSubmit}>
            <h2 className="title-gradient" style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                Upload Image
            </h2>

            <div className={styles.dropzone} onClick={() => fileInputRef.current?.click()}>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept="image/*"
                />
                {file ? (
                    <div className={styles.fileInfo}>
                        <span className={styles.icon}>📄</span>
                        <span>{file.name}</span>
                    </div>
                ) : (
                    <div className={styles.placeholder}>
                        <span className={styles.icon}>☁️</span>
                        <span>Click to select image</span>
                    </div>
                )}
            </div>

            <label className="label">Title</label>
            <input
                className="input-field"
                type="text"
                placeholder="Image Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />

            <label className="label">Description</label>
            <textarea
                className="input-field"
                placeholder="Short description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
            />

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? <span className="spinner"></span> : 'Upload to Cloud'}
            </button>
        </form>
    );
}
