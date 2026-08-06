import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

const features = [
  {
    icon: "🛡️",
    title: "Premium Fleet Access",
    description: "Browse an exclusive collection of high-end vehicles from verified, top-tier dealers.",
  },
  {
    icon: "⚡",
    title: "Seamless Booking",
    description: "Reserve your dream car instantly with our streamlined, secure booking process.",
  },
  {
    icon: "💎",
    title: "Transparent Pricing",
    description: "No hidden fees. Experience luxury with upfront costs and premium support.",
  },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBackground}>
          <Image
            src="/images/hero-bg.png"
            alt="Luxury SUV on a coastal road"
            fill
            className={styles.heroImage}
            priority
          />
          <div className={styles.heroOverlay} />
        </div>
        
        <div className={styles.heroContent}>
          <div className={styles.badge}>Experience Luxury</div>
          <h1 className={styles.heroTitle}>Drive away in your dream car today.</h1>
          <p className={styles.heroDescription}>
            The premier platform for high-end vehicle rentals. Whether for a weekend getaway or a long-term lease, CarRent connects you with the world&apos;s best vehicles.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href="/register">
              Start Your Journey
            </Link>
            <Link className={styles.secondaryButton} href="/login">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorksSection}>
        <div className={styles.sectionHeader}>
          <h2>How It Works</h2>
          <p>Your journey begins in three simple steps.</p>
        </div>
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>01</div>
            <h3>Create an Account</h3>
            <p>Sign up in seconds and get verified to unlock full access to our exclusive fleet.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>02</div>
            <h3>Find Your Car</h3>
            <p>Browse through hundreds of listings from top-rated dealers and find the perfect match.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>03</div>
            <h3>Hit the Road</h3>
            <p>Book instantly, pick up your keys, and enjoy the ride. Our platform makes it that simple.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresGrid}>
          {features.map((feature) => (
            <div key={feature.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
