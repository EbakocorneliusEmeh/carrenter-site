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
          <p className={styles.kicker}>CarRent — Your Journey Starts Here</p>
          <h1>Drive away in your dream car today.</h1>
          <p className={styles.description}>
            Experience the easiest way to rent a car. Whether you are looking for a weekend getaway or a long-term rental, CarRent connects you with top dealers and the best vehicles. Business owners can also join to list and manage their own fleets effortlessly.
          </p>

          <div className={styles.actions}>
            <Link className={styles.primaryButton} href="/register">
              Get Started
            </Link>
            <Link className={styles.secondaryButton} href="/login">
              Login to Account
            </Link>
          </div>
        </div>

        <div className={styles.heroCard}>
          <p className={styles.heroLabel}>Why Choose CarRent</p>
          <ul className={styles.heroList}>
            <li>Vast selection of premium vehicles</li>
            <li>Transparent pricing with no hidden fees</li>
            <li>Dedicated dealer tools and business dashboards</li>
            <li>Seamless booking and profile management</li>
          </ul>
        </div>
      </div>

      <div className={styles.howItWorks}>
        <h2>How It Works</h2>
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <h3>Create an Account</h3>
            <p>Sign up in seconds. Verify your profile to unlock full access to our extensive vehicle network.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <h3>Find Your Car</h3>
            <p>Browse through hundreds of listings from top-rated dealers and find the perfect match for your needs.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>3</div>
            <h3>Hit the Road</h3>
            <p>Book instantly, pick up your keys, and enjoy the ride. Our platform makes it that simple.</p>
          </div>
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
