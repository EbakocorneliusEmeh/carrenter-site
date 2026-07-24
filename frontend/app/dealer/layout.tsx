import Link from "next/link";
import styles from "./layout.module.css";

export default function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>DriveNow Dealer</div>
        <nav className={styles.nav}>
          <Link href="/dealer/vehicles" className={styles.navLink}>
            🚗 Vehicles
          </Link>
          <Link href="/dealer/bookings" className={styles.navLink}>
            📅 Bookings
          </Link>
          <Link href="/dealer/settings" className={styles.navLink}>
            ⚙️ Settings
          </Link>
          <hr className={styles.divider} />
          <Link href="/" className={styles.navLink}>
            🏠 Back to Home
          </Link>
        </nav>
      </aside>
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
