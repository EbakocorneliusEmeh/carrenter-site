"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import {
  changePassword,
  getFriendlyError,
  updateProfile,
  uploadAvatar,
} from "@/services/auth.service";
import type { ChangePasswordPayload, UpdateProfilePayload } from "@/types/auth.types";
import styles from "./ProfileSettings.module.css";

type TabType = "profile" | "password";

export default function ProfileSettings() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  // Profile form state
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // Avatar upload state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setAvatarError("File size must be less than 5MB");
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setAvatarError(null);

      // Show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      await uploadAvatar(file);
      setProfileSuccess("Profile picture updated successfully!");
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (error) {
      const errorMsg = getFriendlyError(error);
      setAvatarError(errorMsg);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (!fullName.trim()) {
      setProfileError("Full name is required");
      return;
    }

    if (!phone.trim()) {
      setProfileError("Phone number is required");
      return;
    }

    try {
      setIsSubmittingProfile(true);
      const payload: UpdateProfilePayload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
      };
      await updateProfile(payload);
      setProfileSuccess("Profile updated successfully!");
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (error) {
      const errorMsg = getFriendlyError(error);
      setProfileError(errorMsg);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    // Validation
    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }

    if (!newPassword) {
      setPasswordError("New password is required");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      setIsSubmittingPassword(true);
      const payload: ChangePasswordPayload = {
        currentPassword,
        newPassword,
        confirmPassword,
      };
      await changePassword(payload);
      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (error) {
      const errorMsg = getFriendlyError(error);
      setPasswordError(errorMsg);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  if (!user) {
    return <div className={styles.noUser}>Please log in to view settings</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Profile Settings</h1>
        <p className={styles.subtitle}>Manage your account information</p>
      </div>

      {/* Avatar Section */}
      <div className={styles.avatarSection}>
        <div className={styles.avatarContainer}>
          {avatarPreview || user?.avatarUrl ? (
            <Image
              src={avatarPreview || user.avatarUrl || ""}
              alt="Profile"
              width={120}
              height={120}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
              </svg>
            </div>
          )}
        </div>
        <div className={styles.avatarInfo}>
          <h3>{user.fullName}</h3>
          <p>{user.email}</p>
          <button
            type="button"
            className={styles.uploadBtn}
            onClick={handleAvatarClick}
            disabled={isUploadingAvatar}
          >
            {isUploadingAvatar ? "Uploading..." : "Change Picture"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className={styles.hiddenInput}
          />
          {avatarError && <p className={styles.error}>{avatarError}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === "profile" ? styles.active : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Personal Info
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === "password" ? styles.active : ""}`}
          onClick={() => setActiveTab("password")}
        >
          Security
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfileSubmit} className={styles.form}>
          {profileError && <div className={styles.errorAlert}>{profileError}</div>}
          {profileSuccess && <div className={styles.successAlert}>{profileSuccess}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              disabled={isSubmittingProfile}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={user.email}
              disabled
              className={styles.disabled}
            />
            <small>Email cannot be changed</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone">Phone Number *</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              disabled={isSubmittingProfile}
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmittingProfile}
          >
            {isSubmittingProfile ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <form onSubmit={handlePasswordSubmit} className={styles.form}>
          {passwordError && <div className={styles.errorAlert}>{passwordError}</div>}
          {passwordSuccess && <div className={styles.successAlert}>{passwordSuccess}</div>}

          <div className={styles.passwordNote}>
            <p>
              Make sure your password is at least 6 characters and includes a mix of letters,
              numbers, and symbols for security.
            </p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="currentPassword">Current Password *</label>
            <div className={styles.passwordInput}>
              <input
                id="currentPassword"
                type={showPasswords ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                disabled={isSubmittingPassword}
              />
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => setShowPasswords(!showPasswords)}
                disabled={isSubmittingPassword}
              >
                {showPasswords ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="newPassword">New Password *</label>
            <div className={styles.passwordInput}>
              <input
                id="newPassword"
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                disabled={isSubmittingPassword}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm New Password *</label>
            <div className={styles.passwordInput}>
              <input
                id="confirmPassword"
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                disabled={isSubmittingPassword}
              />
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmittingPassword}
          >
            {isSubmittingPassword ? "Updating..." : "Change Password"}
          </button>
        </form>
      )}
    </div>
  );
}
