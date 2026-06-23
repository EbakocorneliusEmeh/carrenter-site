import styles from "./Loader.module.css";

interface LoaderProps {
  label?: string;
  fullScreen?: boolean;
}

export default function Loader({ label = "Loading...", fullScreen = false }: LoaderProps) {
  return (
    <div className={`${styles.loader} ${fullScreen ? styles.fullScreen : ""}`}>
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
