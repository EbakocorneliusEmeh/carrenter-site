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
          <p className={styles.kicker}>Car rental auth platform</p>
          <h1>Secure login, registration, and dashboards for every role.</h1>
          <p className={styles.description}>
            This frontend connects to your existing auth API for customers,
            dealers, and admins. It includes session handling, protected routes,
            password recovery, and a clean layout that scales with the rest of
            the product.
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
          <p className={styles.heroLabel}>Included flows</p>
          <ul className={styles.heroList}>
            <li>Customer, dealer, and admin sign-in</li>
            <li>Email or phone login identifier</li>
            <li>Forgot and reset password forms</li>
            <li>Profile page and route protection</li>
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
