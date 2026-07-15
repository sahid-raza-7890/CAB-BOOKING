import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function RevenueChart({ rides }) {
  // --- 1. PROCESS REVENUE BY DAY ---
  const completedRides = rides.filter(ride => ride.status === 'Completed');
  const revenueByDay = {};

  completedRides.forEach(ride => {
    const date = ride.createdAt ? new Date(ride.createdAt) : new Date();
    const dateKey = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    revenueByDay[dateKey] = (revenueByDay[dateKey] || 0) + (ride.fare || 0);
  });

  // Extract labels and data sorted by date
  const sortedDates = Object.keys(revenueByDay).sort((a, b) => new Date(a) - new Date(b));
  const revenueData = sortedDates.map(date => revenueByDay[date]);

  // If no data, show some default placeholders
  const barChartData = {
    labels: sortedDates.length > 0 ? sortedDates : ['No Data'],
    datasets: [
      {
        label: 'Daily Revenue (₹)',
        data: revenueData.length > 0 ? revenueData : [0],
        backgroundColor: 'rgba(40, 167, 69, 0.75)', // Elegant green matching var(--primary-accent)
        borderColor: 'rgba(40, 167, 69, 1)',
        borderWidth: 1.5,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(40, 167, 69, 0.95)',
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--text-main)',
          font: { weight: 'bold' }
        }
      },
      title: {
        display: true,
        text: 'Revenue Earnings Trend',
        color: 'var(--text-main)',
        font: { size: 16, weight: 'bold' }
      },
    },
    scales: {
      x: {
        grid: { color: 'var(--card-border)' },
        ticks: { color: 'var(--text-muted)' }
      },
      y: {
        grid: { color: 'var(--card-border)' },
        ticks: { color: 'var(--text-muted)' },
        beginAtZero: true
      }
    }
  };

  // --- 2. PROCESS RIDE STATUS DISTRIBUTION ---
  const statusCounts = {
    Pending: 0,
    Accepted: 0,
    Completed: 0,
    Cancelled: 0
  };

  rides.forEach(ride => {
    const status = ride.status || 'Pending';
    if (statusCounts[status] !== undefined) {
      statusCounts[status] += 1;
    } else {
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    }
  });

  const doughnutData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: [
          '#f59e0b', // Pending - Amber
          '#0ea5e9', // Accepted - Blue
          '#28a745', // Completed - Green
          '#dc3545', // Cancelled - Red
        ],
        borderColor: 'var(--card-bg)',
        borderWidth: 2,
        hoverOffset: 10
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'var(--text-main)',
          boxWidth: 15,
          padding: 15
        }
      },
      title: {
        display: true,
        text: 'Ride Status Distribution',
        color: 'var(--text-main)',
        font: { size: 16, weight: 'bold' }
      },
    },
  };

  const chartContainerStyle = {
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    minHeight: '320px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative'
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
      gap: '24px',
      marginBottom: '30px',
      width: '100%'
    }}>
      {/* 📈 BAR CHART */}
      <div style={chartContainerStyle}>
        <div style={{ height: '280px' }}>
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>

      {/* 🍩 DOUGHNUT CHART */}
      <div style={chartContainerStyle}>
        <div style={{ height: '280px' }}>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  );
}

export default RevenueChart;
