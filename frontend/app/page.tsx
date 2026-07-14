import Link from "next/link";
import styles from "./page.module.css";

const features = [
  {
    title: "Role-based access",
    description:
      "Separate journeys for customers, dealers, and admins with protected dashboards.",
  },
  {
    title: "Token refresh",
    description:
      "Automatic refresh handling keeps authenticated users moving without extra login prompts.",
  },
  {
    title: "Modern auth screens",
    description:
      "Responsive forms, validation, loading states, and polished feedback for every auth step.",
  },
];

export default function HomePage() {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.copy}>
          <p className={styles.kicker}>CarRent — Simple car rentals</p>
          <h1>Rent cars, manage listings, and run a small dealership.</h1>
          <p className={styles.description}>
            CarRent is a focused frontend for a car rental platform. Visitors
            can create a customer account, sign in, and land on a role-based
            dashboard. Dealers create a separate business account (not via the
            regular sign-up) to manage listings and sales from their business
            dashboard.
          </p>

          <div className={styles.actions}>
            <Link className={styles.primaryButton} href="/register">
              Create account
            </Link>
            <Link className={styles.secondaryButton} href="/login">
              Login
            </Link>
          </div>
        </div>

        <div className={styles.heroCard}>
          <p className={styles.heroLabel}>What you'll find</p>
          <ul className={styles.heroList}>
            <li>Customer booking and trip management</li>
            <li>Dealer business onboarding and vehicle listings</li>
            <li>Role-protected dashboards and profile management</li>
            <li>Clear, separate flows for users and business owners</li>
          </ul>
        </div>
      </div>

      <div className={styles.featureGrid}>
        {features.map((feature) => (
          <article key={feature.title} className={styles.featureCard}>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
