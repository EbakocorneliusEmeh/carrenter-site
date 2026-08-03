"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import type { MonthlyRevenueChart } from "@/services/analytics.service";
import styles from "./RevenueChart.module.css";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Props {
  data: MonthlyRevenueChart;
}

export default function RevenueChart({ data }: Props) {
  const safeData = data?.values ?? [];
  const safeLabels = data?.labels ?? [];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!safeData.length) return;

    // Destroy previous instance to avoid canvas reuse errors
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const maxVal = Math.max(...safeData, 1);

    const chartData: ChartData<"bar"> = {
      labels: safeLabels,
      datasets: [
        {
          label: "Revenue (FCFA)",
          data: safeData,
          backgroundColor: safeData.map((val) =>
            val === maxVal
              ? "rgba(22, 163, 74, 0.9)"   // highlight the highest bar green
              : "rgba(22, 163, 74, 0.45)"
          ),
          borderColor: safeData.map((val) =>
            val === maxVal ? "#15803d" : "#16a34a"
          ),
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };

    const options: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0f172a",
          titleColor: "#94a3b8",
          bodyColor: "#f1f5f9",
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) =>
              `  ${(ctx.parsed.y as number).toLocaleString()} FCFA`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#64748b", font: { size: 12 } },
          border: { display: false },
        },
        y: {
          grid: { color: "rgba(226,232,240,0.6)" },
          ticks: {
            color: "#94a3b8",
            font: { size: 11 },
            callback: (val) => `${Number(val).toLocaleString()}`,
          },
          border: { display: false },
          beginAtZero: true,
        },
      },
    };

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: chartData,
      options,
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [data, safeData, safeLabels]);

  const totalRevenue = safeData.reduce((a, b) => a + b, 0);
  const peakMonth = safeLabels[safeData.indexOf(Math.max(...safeData, 0))];
  const peakValue = safeData.length ? Math.max(...safeData) : 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Revenue Overview</h2>
          <p className={styles.subtitle}>Last 6 months · Completed bookings only</p>
        </div>
        <div className={styles.summaryPills}>
          <div className={styles.pill}>
            <span className={styles.pillLabel}>Total</span>
            <span className={styles.pillValue}>{totalRevenue.toLocaleString()} FCFA</span>
          </div>
          {peakValue > 0 && (
            <div className={`${styles.pill} ${styles.pillGreen}`}>
              <span className={styles.pillLabel}>Peak</span>
              <span className={styles.pillValue}>{peakMonth} · {peakValue.toLocaleString()} FCFA</span>
            </div>
          )}
        </div>
      </div>

      {totalRevenue === 0 ? (
        <div className={styles.emptyChart}>
          <span className={styles.emptyEmoji}>📊</span>
          <p>No completed bookings yet.</p>
          <small>Revenue will appear here once bookings are marked as completed.</small>
        </div>
      ) : (
        <div className={styles.canvasWrap}>
          <canvas ref={canvasRef} />
        </div>
      )}
    </div>
  );
}
