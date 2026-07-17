"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createVehicle } from "@/services/vehicles.service";
import { ListingType } from "@/types/vehicle.types";
import styles from "./page.module.css";

export default function NewVehiclePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files) {
      const pastedFiles = Array.from(e.clipboardData.files).filter(f => f.type.startsWith('image/'));
      if (pastedFiles.length > 0) {
        setFiles(prev => [...prev, ...pastedFiles]);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (droppedFiles.length > 0) {
        setFiles(prev => [...prev, ...droppedFiles]);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      setFiles(prev => [...prev, ...selectedFiles]);
    }
    // Reset input so the same file can be selected again if removed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = new FormData();
      payload.append("name", `${formData.brand} ${formData.model}`);
      payload.append("brand", formData.brand);
      payload.append("model", formData.model);
      payload.append("year", formData.year.toString());
      if (formData.registrationNumber) payload.append("registrationNumber", formData.registrationNumber);
      payload.append("fuelType", formData.fuelType);
      payload.append("transmission", formData.transmission);
      payload.append("listingType", formData.listingType);
      if (formData.dailyRentalPrice) payload.append("dailyRentalPrice", formData.dailyRentalPrice);
      if (formData.salePrice) payload.append("salePrice", formData.salePrice);
      payload.append("pickupLocation", formData.pickupLocation);
      payload.append("isAvailable", "true");
      
      files.forEach((file) => {
        payload.append("images", file);
      });

      await createVehicle(payload);
      router.push("/dealer/vehicles");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create vehicle listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container} onPaste={handlePaste}>
      <h1 className={styles.title}>Add New Vehicle</h1>
      
      {error && <div className={styles.error}>{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
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
            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label className={styles.label}>Pickup Location</label>
              <input required name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} className={styles.input} placeholder="Full address" />
            </div>
          </div>
        </div>

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
                <label className={styles.label}>Daily Rental Price ($)</label>
                <input required type="number" name="dailyRentalPrice" value={formData.dailyRentalPrice} onChange={handleChange} className={styles.input} placeholder="0.00" />
              </div>
            )}
            
            {(formData.listingType === ListingType.SALE || formData.listingType === ListingType.BOTH) && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Sale Price ($)</label>
                <input required type="number" name="salePrice" value={formData.salePrice} onChange={handleChange} className={styles.input} placeholder="0.00" />
              </div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Media (Upload Images)</h2>
          <div className={styles.formGroup}>
            <div 
              className={styles.dropzone}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <p className={styles.dropzoneText}>Drag & drop images here, paste from clipboard, or click to select files</p>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className={styles.fileInput} 
              />
            </div>
            
            {files.length > 0 && (
              <div className={styles.fileList}>
                {files.map((file, index) => (
                  <div key={index} className={styles.filePreview}>
                    <img src={URL.createObjectURL(file)} alt="Preview" />
                    <button type="button" className={styles.removeFileBtn} onClick={() => removeFile(index)}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? "Creating..." : "Create Vehicle Listing"}
        </button>
      </form>
    </div>
  );
}
