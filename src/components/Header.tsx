import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
    return (
        <header className={styles.header}>
            <div className="container">
                <div className={styles.inner}>
                    <Link href="/" className={`title-gradient ${styles.brand}`}>
                        CloudDeploy App
                    </Link>
                    {/* <div className={styles.status}>
                        <span className={styles.dot}></span> System Online
                    </div> */}
                </div>
            </div>
        </header>
    );
}
