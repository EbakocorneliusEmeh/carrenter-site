"use client";

import Link from "next/link";
import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { becomeDealer, getFriendlyError } from "@/services/auth.service";
import { listCustomerBookings, cancelBooking, deleteBooking, type Booking } from "@/services/booking.service";
import ReviewModal from "@/components/ReviewModal";
import { useToast } from "@/components/Toast";
import styles from "./page.module.css";

type ActiveSection = "overview" | "rentals" | "profile" | "account" | "business";
const VALID_SECTIONS: ActiveSection[] = ["overview", "rentals", "profile", "account", "business"];

function ContactDealerModal({ dealer, onClose }: { dealer: any, onClose: () => void }) {
  if (!dealer) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        <div className={styles.modalHeader}>
          <span className={styles.modalIcon}>🏢</span>
          <h3>Contact {dealer.businessName}</h3>
        </div>
        <p className={styles.modalDesc}>Use the methods below to reach out to the dealer and coordinate your vehicle pickup.</p>
        
        <div className={styles.contactList}>
          {dealer.contactWhatsapp ? (
            <a href={`whatsapp://send?phone=${dealer.contactWhatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className={styles.contactItem}>
              <span className={styles.contactIcon}>💬</span>
              <div className={styles.contactDetails}>
                <strong>WhatsApp</strong>
                <span>{dealer.contactWhatsapp}</span>
              </div>
            </a>
          ) : (
             <div className={`${styles.contactItem} ${styles.contactItemDisabled}`}>
              <span className={styles.contactIcon}>💬</span>
              <div className={styles.contactDetails}>
                <strong>WhatsApp</strong>
                <span>Not provided by dealer</span>
              </div>
            </div>
          )}

          {dealer.contactPhone ? (
            <a href={`tel:${dealer.contactPhone}`} className={styles.contactItem}>
              <span className={styles.contactIcon}>📞</span>
              <div className={styles.contactDetails}>
                <strong>Phone</strong>
                <span>{dealer.contactPhone}</span>
              </div>
            </a>
          ) : (
            <div className={`${styles.contactItem} ${styles.contactItemDisabled}`}>
              <span className={styles.contactIcon}>📞</span>
              <div className={styles.contactDetails}>
                <strong>Phone</strong>
                <span>Not provided by dealer</span>
              </div>
            </div>
          )}

          {dealer.contactEmail ? (
            <a href={`mailto:${dealer.contactEmail}`} className={styles.contactItem}>
              <span className={styles.contactIcon}>✉️</span>
              <div className={styles.contactDetails}>
                <strong>Email</strong>
                <span>{dealer.contactEmail}</span>
              </div>
            </a>
          ) : (
            <div className={`${styles.contactItem} ${styles.contactItemDisabled}`}>
              <span className={styles.contactIcon}>✉️</span>
              <div className={styles.contactDetails}>
                <strong>Email</strong>
                <span>Not provided by dealer</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CustomerRentals({ bookings, loading, onCancel, onDelete, onContact }: {
  bookings: Booking[], loading: boolean, onCancel: (id:string)=>void, onDelete: (id:string)=>void, onContact: (dealer:any)=>void
}) {
  const [reviewBooking, setReviewBooking] = useState<{ id: string; vehicleName: string } | null>(null);
  const { showToast } = useToast();

  if (loading) return <div style={{ padding: "2rem" }}>Loading rentals...</div>;

  if (!bookings.length) return (
    <div className={styles.comingSoon}>
      <div className={styles.comingSoonIcon}>🚗</div>
      <p>You haven&apos;t rented any cars yet.</p>
    </div>
  );

  return (
    <div className={styles.rentalsList}>
      {bookings.map(b => (
        <div key={b.id} className={styles.rentalCard}>
          <div className={styles.rentalCardHeader}>
            <span className={styles.rentalStatus} data-status={b.status}>{b.status}</span>
            <span className={styles.rentalDate}>{new Date(b.createdAt).toLocaleDateString()}</span>
          </div>
          <div className={styles.rentalCardBody}>
            {b.vehicle?.images?.[0] ? (
              <img src={b.vehicle.images[0].url} alt={b.vehicle?.name || "Vehicle"} className={styles.rentalImg} />
            ) : (
              <div className={styles.rentalImgPlaceholder}>🚗</div>
            )}
            <div className={styles.rentalInfo}>
              <h4>{b.vehicle?.brand} {b.vehicle?.model} ({b.vehicle?.year})</h4>
              {b.dealer && (
                <p>
                  Rented from:{" "}
                  {b.dealer.slug ? (
                    <Link href={`/business/${b.dealer.slug}`} className={styles.dealerLink}>
                      <strong>{b.dealer.businessName}</strong>
                    </Link>
                  ) : (
                    <strong>{b.dealer.businessName}</strong>
                  )}
                </p>
              )}
              {b.startDate && b.endDate && <p>Dates: {b.startDate} to {b.endDate}</p>}
              {b.totalPrice && <p>Total: {b.totalPrice.toLocaleString()} FCFA</p>}
            </div>
          </div>

          {b.dealer && (
            <div className={styles.approvedContactBlock}>
              <p className={styles.approvedContactTitle}>
                {b.status === "APPROVED" ? "🎉 Your booking is approved! Coordinate with the dealer for pickup." : "💬 Have questions? Contact the dealer directly."}
              </p>
              <button className={styles.primaryBtn} onClick={() => onContact(b.dealer)}>Contact Dealer</button>
            </div>
          )}

          <div className={styles.rentalCardActions}>
            {b.status === "PENDING" && (
              <button className={styles.cancelBtn} onClick={() => onCancel(b.id)}>Cancel Request</button>
            )}
            {b.status === "COMPLETED" && (
              <button className={styles.reviewBtn} onClick={() => setReviewBooking({ id: b.id, vehicleName: `${b.vehicle?.brand} ${b.vehicle?.model}` })}>
                ⭐ Leave a Review
              </button>
            )}
            <button className={styles.deleteBtn} onClick={() => onDelete(b.id)}>Delete Record</button>
          </div>
        </div>
      ))}

      {reviewBooking && (
        <ReviewModal
          bookingId={reviewBooking.id}
          vehicleName={reviewBooking.vehicleName}
          onClose={() => setReviewBooking(null)}
          onSuccess={() => {
            showToast("Thank you for your review!", "success");
            setReviewBooking(null);
          }}
        />
      )}
    </div>
  );
}

/** Inner component that safely uses useSearchParams (must be inside Suspense) */
function CustomerDashboardInner() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const notifRef = useRef<HTMLDivElement>(null);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<any>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const sectionParam = searchParams.get("section") as ActiveSection | null;
  const [activeSection, setActiveSection] = useState<ActiveSection>(
    sectionParam && VALID_SECTIONS.includes(sectionParam) ? sectionParam : "overview"
  );

  const [businessName, setBusinessName] = useState("");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  useEffect(() => {
    if (sectionParam && VALID_SECTIONS.includes(sectionParam)) {
      setActiveSection(sectionParam);
    }
  }, [sectionParam]);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchBookings = () => {
    setBookingsLoading(true);
    listCustomerBookings()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setBookingsLoading(false));
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await cancelBooking(id);
      fetchBookings();
      showToast("Booking cancelled successfully.", "info");
    } catch (e) {
      showToast("Failed to cancel booking. Please try again.", "error");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this record?")) return;
    try {
      await deleteBooking(id);
      fetchBookings();
      showToast("Booking record deleted.", "info");
    } catch (e) {
      showToast("Failed to delete record. Please try again.", "error");
    }
  };

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;
    try {
      setIsUpgrading(true);
      setUpgradeError(null);
      await becomeDealer({ businessName });
      window.location.href = "/dealer/dashboard";
    } catch (err: any) {
      setUpgradeError(getFriendlyError(err));
      setIsUpgrading(false);
    }
  };

  const handleNotificationClick = (b: Booking) => {
    setIsNotifOpen(false);
    setActiveSection("rentals");
    if (b.status === "APPROVED" && b.dealer) {
      setSelectedDealer(b.dealer);
    }
  };

  const navItems: { key: ActiveSection; label: string; icon: string }[] = [
    { key: "overview",  label: "Overview",                icon: "🏠" },
    { key: "rentals",   label: "My Rentals",              icon: "🚗" },
    { key: "profile",   label: "Update Profile",          icon: "👤" },
    { key: "account",   label: "Account Settings",        icon: "⚙️" },
    { key: "business",  label: "Become a Business Owner", icon: "🚀" },
  ];

  const recentNotifications = bookings.filter(b => b.status === "APPROVED" || b.status === "REJECTED").slice(0, 5);
  const unreadCount = recentNotifications.length; // Simplified for now

  return (
    <div className={styles.dashboardContainer}>
      <ContactDealerModal dealer={selectedDealer} onClose={() => setSelectedDealer(null)} />

      {/* Image Modal */}
      {isImageModalOpen && user?.avatarUrl && (
        <div className={styles.imageModal} onClick={() => setIsImageModalOpen(false)}>
          <div className={styles.imageModalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setIsImageModalOpen(false)}>×</button>
            <Image
              src={user.avatarUrl}
              alt={user.fullName || "Profile"}
              width={500}
              height={500}
              className={styles.fullSizeImage}
            />
          </div>
        </div>
      )}

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.avatarWrapper} onClick={() => user?.avatarUrl && setIsImageModalOpen(true)} style={{ cursor: user?.avatarUrl ? "pointer" : "default" }}>
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.fullName || "Profile"}
                width={80}
                height={80}
                className={styles.avatarImg}
              />
            ) : (
              <div className={styles.avatar}>
                {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div>
            <h1 className={styles.welcomeText}>
              Welcome back, <span>{user?.fullName || "Guest"}</span>
            </h1>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.notifWrapper} ref={notifRef}>
            <button className={styles.notifBtn} onClick={() => setIsNotifOpen(!isNotifOpen)}>
              🔔
              {unreadCount > 0 && <span className={styles.notifBadge}>{unreadCount}</span>}
            </button>
            {isNotifOpen && (
              <div className={styles.notifDropdown}>
                <div className={styles.notifHeader}>Notifications</div>
                <div className={styles.notifList}>
                  {recentNotifications.length > 0 ? recentNotifications.map(b => (
                    <div key={b.id} className={styles.notifItem} onClick={() => handleNotificationClick(b)}>
                      <div className={styles.notifIcon}>{b.status === 'APPROVED' ? '✅' : '❌'}</div>
                      <div className={styles.notifText}>
                        <strong>{b.vehicle?.brand} {b.vehicle?.model}</strong> request was {b.status.toLowerCase()} by {b.dealer?.businessName}.
                      </div>
                    </div>
                  )) : <div className={styles.notifEmpty}>No new notifications.</div>}
                </div>
              </div>
            )}
          </div>
          <div className={styles.roleBadge}>Customer</div>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            {navItems.map((item) => (
              <button
                key={item.key}
                className={`${styles.navItem} ${activeSection === item.key ? styles.navItemActive : ""}`}
                onClick={() => setActiveSection(item.key)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {activeSection === item.key && <span className={styles.navArrow}>›</span>}
              </button>
            ))}
          </nav>
        </aside>

        <main className={styles.mainPanel}>
          {activeSection === "overview" && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Dashboard Overview</h2>
              <p className={styles.sectionSub}>Here&apos;s a summary of your activity on CarRenter.</p>
              <div className={styles.statsGrid}>
                {[
                  { icon: "🚗", value: bookings.filter(b=>b.status==="APPROVED").length, label: "Active Rentals" },
                  { icon: "📋", value: bookings.length, label: "Total Bookings" },
                  { icon: "⭐", value: "—", label: "Reviews Given" },
                  { icon: "❤️", value: "0", label: "Saved Vehicles" },
                ].map((s) => (
                  <div key={s.label} className={styles.statCard}>
                    <div className={styles.statIcon}>{s.icon}</div>
                    <div className={styles.statValue}>{s.value}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className={styles.infoPanel}>
                <h3>Quick Info</h3>
                {[
                  { label: "Full Name",    value: user?.fullName },
                  { label: "Email",        value: user?.email },
                  { label: "Phone",        value: user?.phone },
                  { label: "Account Type", value: "Customer" },
                ].map((r) => (
                  <div key={r.label} className={styles.infoRow}>
                    <span className={styles.infoLabel}>{r.label}</span>
                    <span className={styles.infoValue}>{r.value || "—"}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeSection === "rentals" && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>My Rentals</h2>
              <p className={styles.sectionSub}>Manage cars you have rented or requested.</p>
              <CustomerRentals 
                bookings={bookings} 
                loading={bookingsLoading} 
                onCancel={handleCancelBooking} 
                onDelete={handleDeleteBooking}
                onContact={(dealer) => setSelectedDealer(dealer)}
              />
            </section>
          )}

          {activeSection === "profile" && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Update Profile</h2>
              <p className={styles.sectionSub}>Manage your personal information.</p>
              <div className={styles.comingSoon}>
                <div className={styles.comingSoonIcon}>🛠️</div>
                <p>Profile editing is coming soon.</p>
              </div>
            </section>
          )}

          {activeSection === "account" && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Account Settings</h2>
              <p className={styles.sectionSub}>Manage your security and preferences.</p>
              <div className={styles.comingSoon}>
                <div className={styles.comingSoonIcon}>🔒</div>
                <p>Account settings are coming soon.</p>
              </div>
            </section>
          )}

          {activeSection === "business" && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Become a Business Owner</h2>
              <p className={styles.sectionSub}>
                Upgrade your account to start listing vehicles and managing your own rental business.
              </p>
              <div className={styles.upgradeCard}>
                <div className={styles.upgradeCardHeader}>
                  <span className={styles.upgradeIcon}>🚀</span>
                  <div>
                    <h3 className={styles.upgradeCardTitle}>Dealer Account Upgrade</h3>
                    <p className={styles.upgradeCardDesc}>
                      Enter your business name to get started. You can fill in all other details from
                      your Dealer Dashboard after upgrading.
                    </p>
                  </div>
                </div>
                <form onSubmit={handleUpgrade} className={styles.upgradeForm}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="businessName">Business Name *</label>
                    <input
                      id="businessName"
                      type="text"
                      className={styles.input}
                      placeholder="e.g. Premium Auto Rentals"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                      disabled={isUpgrading}
                    />
                  </div>
                  {upgradeError && <p className={styles.errorText}>{upgradeError}</p>}
                  <button
                    type="submit"
                    className={styles.upgradeBtn}
                    disabled={isUpgrading || !businessName.trim()}
                  >
                    {isUpgrading ? "Upgrading…" : "🚀 Upgrade to Dealer"}
                  </button>
                </form>
                <ul className={styles.perks}>
                  <li>✅ Create and manage business pages</li>
                  <li>✅ List your vehicles for rent</li>
                  <li>✅ Accept customer bookings</li>
                  <li>✅ Access dealer analytics (coming soon)</li>
                </ul>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

/** Exported page wraps inner component in Suspense (required by Next.js for useSearchParams) */
export default function CustomerDashboard() {
  return (
    <Suspense fallback={<div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>Loading dashboard…</div>}>
      <CustomerDashboardInner />
    </Suspense>
  );
}
