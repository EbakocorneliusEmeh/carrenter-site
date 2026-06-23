import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <p className={styles.brand}>CarRent</p>
          <p className={styles.copy}>
            Modern auth and dashboard shell for your car rental platform.
          </p>
        </div>

        <nav className={styles.links} aria-label="Footer">
          <Link href="/">Home</Link>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
          <Link href="/profile">Profile</Link>
        </nav>
      </div>
    </footer>
  );
}
