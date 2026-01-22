"use client";
import { useState } from 'react';
import Header from '@/components/Header';
import UploadForm from '@/components/UploadForm';
import ImageGallery from '@/components/ImageGallery';
import styles from './page.module.css';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <Header />
      <main className="container" style={{ paddingTop: '2rem' }}>
        <div className={styles.layout}>
          {/* Sidebar / Upload Section */}
          <aside className={`${styles.sidebar} animate-fade-in`}>
            <div style={{ marginBottom: '2rem' }}>
              <h1 className="title-gradient" style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', lineHeight: 1.1 }}>
                CloudDeploy App
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5 }}>
                Upload your images
              </p>
            </div>

            <UploadForm onUploadSuccess={handleUploadSuccess} />
          </aside>

          {/* Main Content / Gallery Section */}
          <section className={styles.gallerySection}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginRight: '1rem', color: 'var(--text-primary)' }}>
                Gallery
              </h2>
              <div style={{ height: '1px', background: 'var(--glass-border)', flex: 1 }}></div>
            </div>

            <ImageGallery refreshTrigger={refreshTrigger} />
          </section>
        </div>
      </main>
    </>
  );
}
