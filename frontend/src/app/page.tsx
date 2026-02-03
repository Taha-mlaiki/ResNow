import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className="container">
        {/* Simple Navbar Placeholder */}
        <nav className={styles.nav}>
          <div className={styles.logo}>ReservNow</div>
          <div className={styles.links}>
            <Link href="/events" className="btn glass">
              Explore Events
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className={styles.hero}>
          <h1 className={styles.title}>
            Discover <span className="gradient-text">Extraordinary</span> <br />
            Events Near You
          </h1>
          <p className={styles.subtitle}>
            Seamless booking for conferences, workshops, and exclusive gatherings.
          </p>
          <div className={styles.actions}>
            <Link href="/events" className="btn btn-primary">
              Browse Catalog
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
