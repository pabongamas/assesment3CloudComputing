"use client";
import { useEffect, useState } from 'react';
import styles from './ImageGallery.module.css';
import skeletonStyles from './Skeleton.module.css';

interface DocItem {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    s3Key: string;
    createdAt: string;
}

const GalleryItem = ({ item, onDelete, onUpdate }: { item: DocItem, onDelete: (id: string, key: string) => void, onUpdate: (id: string, t: string, d: string) => Promise<void> }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(item.title);
    const [desc, setDesc] = useState(item.description);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await onUpdate(item.id, title, desc);
        setSaving(false);
        setIsEditing(false);
    };

    return (
        <div className={`card ${styles.card} animate-fade-in`}>
            <div className={styles.imageContainer}>
                <img src={item.imageUrl} alt={item.title} className={styles.image} />
                <div className={styles.overlay}>
                    <button
                        onClick={() => onDelete(item.id, item.s3Key)}
                        className="btn btn-danger"
                        style={{ marginRight: '0.5rem' }}
                    >
                        Delete
                    </button>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn btn-secondary"
                        >
                            Edit
                        </button>
                    )}
                </div>
            </div>
            <div className={styles.content}>
                {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                        <input
                            className="input-field"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            style={{ marginBottom: 0, padding: '0.5rem' }}
                        />
                        <textarea
                            className="input-field"
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            rows={2}
                            style={{ marginBottom: 0, padding: '0.5rem', flex: 1 }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button onClick={handleSave} className="btn btn-primary" style={{ padding: '0.5rem', fontSize: '0.8rem', flex: 1 }} disabled={saving}>
                                {saving ? <span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }}></span> : 'Save'}
                            </button>
                            <button onClick={() => setIsEditing(false)} className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.8rem', flex: 1 }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h3 className={styles.title}>{item.title}</h3>
                        <p className={styles.desc}>{item.description}</p>
                        <span className={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </>
                )}
            </div>
        </div>
    );
};

const SkeletonCard = () => (
    <div className={skeletonStyles.skeleton}>
        <div className={skeletonStyles.imagePlaceholder} />
        <div className={skeletonStyles.content}>
            <div className={`${skeletonStyles.titleLine} ${skeletonStyles.shimmer}`} />
            <div className={`${skeletonStyles.descLine} ${skeletonStyles.shimmer}`} />
            <div className={`${skeletonStyles.descLineShort} ${skeletonStyles.shimmer}`} />
            <div className={`${skeletonStyles.dateLine} ${skeletonStyles.shimmer}`} />
        </div>
    </div>
);

export default function ImageGallery({ refreshTrigger }: { refreshTrigger: number }) {
    const [items, setItems] = useState<DocItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchItems = async () => {
        if (items.length === 0) setLoading(true);
        try {
            const res = await fetch('/api/documents');
            const data = await res.json();
            if (Array.isArray(data)) setItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [refreshTrigger]);

    const handleDelete = async (id: string, s3Key: string) => {
        if (!confirm("Are you sure you want to delete this document?")) return;
        try {
            await fetch(`/api/documents?id=${id}&s3Key=${s3Key}`, { method: 'DELETE' });
            fetchItems();
        } catch (error) {
            console.error(error);
            alert("Failed to delete");
        }
    };

    const handleUpdate = async (id: string, title: string, description: string) => {
        try {
            await fetch('/api/documents', {
                method: 'PATCH',
                body: JSON.stringify({ id, title, description }),
                headers: { 'Content-Type': 'application/json' }
            });
            // Update local state to avoid full re-fetch flicker
            setItems(prev => prev.map(item => item.id === id ? { ...item, title, description } : item));
        } catch (error) {
            console.error(error);
            alert("Failed to update");
        }
    }

    if (loading && items.length === 0) return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );

    if (items.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <p>No documents found. Upload one above!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
            {items.map(item => (
                <GalleryItem key={item.id} item={item} onDelete={handleDelete} onUpdate={handleUpdate} />
            ))}
        </div>
    );
}
