"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getVehicle, updateVehicle } from "@/services/vehicles.service";
import type { Vehicle } from "@/types/vehicle.types";
import { ListingType } from "@/types/vehicle.types";
import type { ListingType as ListingTypeValue } from "@/types/vehicle.types";
import styles from "../../new/page.module.css";
import editStyles from "./page.module.css";

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = typeof params?.id === "string" ? params.id : "";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // New files to upload
  const [newFiles, setNewFiles] = useState<File[]>([]);
  // Existing images from DB
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);

  const [formData, setFormData] = useState<{
    brand: string;
    model: string;
    year: number;
    registrationNumber: string;
    fuelType: string;
    transmission: string;
    listingType: ListingTypeValue;
    dailyRentalPrice: string;
    salePrice: string;
    pickupLocation: string;
    isAvailable: string;
  }>({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    registrationNumber: "",
    fuelType: "Petrol",
    transmission: "Automatic",
    listingType: ListingType.RENT,
    dailyRentalPrice: "",
    salePrice: "",
    pickupLocation: "",
    isAvailable: "true",
  });

  useEffect(() => {
    if (!vehicleId) return;
    getVehicle(vehicleId)
      .then((v) => {
        setVehicle(v);
        setFormData({
          brand: v.brand ?? "",
          model: v.model ?? "",
          year: v.year ?? new Date().getFullYear(),
          registrationNumber: v.registrationNumber ?? "",
          fuelType: v.fuelType ?? "Petrol",
          transmission: v.transmission ?? "Automatic",
          listingType: v.listingType ?? ListingType.RENT,
          dailyRentalPrice: v.dailyRentalPrice?.toString() ?? "",
          salePrice: v.salePrice?.toString() ?? "",
          pickupLocation: v.pickupLocation ?? "",
          isAvailable: v.isAvailable ? "true" : "false",
        });
        setExistingImages((v.images ?? []).map((img) => ({ id: img.id, url: img.url })));
      })
      .catch(() => setError("Failed to load vehicle"))
      .finally(() => setLoading(false));
  }, [vehicleId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedFiles = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith("image/"));
    if (pastedFiles.length > 0) setNewFiles((prev) => [...prev, ...pastedFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (droppedFiles.length > 0) setNewFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter((f) => f.type.startsWith("image/"));
      setNewFiles((prev) => [...prev, ...selected]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeNewFile = (index: number) => setNewFiles((prev) => prev.filter((_, i) => i !== index));
  const removeExistingImage = (id: string) => setExistingImages((prev) => prev.filter((img) => img.id !== id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = new FormData();
      payload.append("brand", formData.brand);
      payload.append("model", formData.model);
      payload.append("year", formData.year.toString());
      if (formData.registrationNumber) payload.append("registrationNumber", formData.registrationNumber);
      payload.append("fuelType", formData.fuelType);
      payload.append("transmission", formData.transmission);
      payload.append("listingType", formData.listingType);
      payload.append("pickupLocation", formData.pickupLocation);
      payload.append("isAvailable", formData.isAvailable);
      if (formData.dailyRentalPrice) payload.append("dailyRentalPrice", formData.dailyRentalPrice);
      if (formData.salePrice) payload.append("salePrice", formData.salePrice);

      // Attach new image files
      newFiles.forEach((file) => payload.append("images", file));

      await updateVehicle(vehicleId, payload);
      setSuccess(true);
      setTimeout(() => router.push("/dealer/vehicles"), 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update vehicle");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.container}><p>Loading vehicle...</p></div>;
  if (!vehicle) return <div className={styles.container}><p>Vehicle not found.</p></div>;

  return (
    <div className={styles.container} onPaste={handlePaste}>
      <div className={editStyles.topBar}>
        <Link href="/dealer/vehicles" className={editStyles.backLink}>← Back to My Vehicles</Link>
        <h1 className={styles.title}>Edit Vehicle</h1>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={editStyles.success}>✓ Vehicle updated! Redirecting...</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Basic Details */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Basic Details</h2>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Brand</label>
              <input required name="brand" value={formData.brand} onChange={handleChange} className={styles.input} placeholder="e.g. Toyota" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Model</label>
              <input required name="model" value={formData.model} onChange={handleChange} className={styles.input} placeholder="e.g. Camry" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Year</label>
              <input required type="number" name="year" value={formData.year} onChange={handleChange} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Registration Number</label>
              <input name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className={styles.input} placeholder="Optional" />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Specifications</h2>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Fuel Type</label>
              <select name="fuelType" value={formData.fuelType} onChange={handleChange} className={styles.select}>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Transmission</label>
              <select name="transmission" value={formData.transmission} onChange={handleChange} className={styles.select}>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ gridColumn: "span 2" }}>
              <label className={styles.label}>Pickup Location</label>
              <input required name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} className={styles.input} placeholder="Full address" />
            </div>
          </div>
        </div>

        {/* Listing & Pricing */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Listing & Pricing</h2>
          <div className={styles.formGroup}>
            <label className={styles.label}>Listing Type</label>
            <select name="listingType" value={formData.listingType} onChange={handleChange} className={styles.select}>
              <option value={ListingType.RENT}>For Rent</option>
              <option value={ListingType.SALE}>For Sale</option>
              <option value={ListingType.BOTH}>Both (Rent & Sale)</option>
            </select>
          </div>
          <div className={styles.grid2}>
            {(formData.listingType === ListingType.RENT || formData.listingType === ListingType.BOTH) && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Daily Rental Price (FCFA)</label>
                <input required type="number" name="dailyRentalPrice" value={formData.dailyRentalPrice} onChange={handleChange} className={styles.input} placeholder="0" />
              </div>
            )}
            {(formData.listingType === ListingType.SALE || formData.listingType === ListingType.BOTH) && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Sale Price (FCFA)</label>
                <input required type="number" name="salePrice" value={formData.salePrice} onChange={handleChange} className={styles.input} placeholder="0" />
              </div>
            )}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Availability</label>
            <select name="isAvailable" value={formData.isAvailable} onChange={handleChange} className={styles.select}>
              <option value="true">Available</option>
              <option value="false">Not Available</option>
            </select>
          </div>
        </div>

        {/* Images */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Vehicle Images</h2>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className={editStyles.existingImagesSection}>
              <p className={editStyles.existingLabel}>Current Images <span>(click × to remove)</span></p>
              <div className={styles.fileList}>
                {existingImages.map((img) => (
                  <div key={img.id} className={styles.filePreview}>
                    <img src={img.url} alt="Vehicle" />
                    <button type="button" className={styles.removeFileBtn} onClick={() => removeExistingImage(img.id)}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New image uploads */}
          <div className={styles.formGroup} style={{ marginTop: "1rem" }}>
            <p className={editStyles.existingLabel}>Add New Images <span>(replaces all existing if uploaded)</span></p>
            <div
              className={styles.dropzone}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <p className={styles.dropzoneText}>Drag & drop, paste, or click to add images</p>
              <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className={styles.fileInput} />
            </div>
            {newFiles.length > 0 && (
              <div className={styles.fileList}>
                {newFiles.map((file, index) => (
                  <div key={index} className={styles.filePreview}>
                    <img src={URL.createObjectURL(file)} alt="Preview" />
                    <button type="button" className={styles.removeFileBtn} onClick={() => removeNewFile(index)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
