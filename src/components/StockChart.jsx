import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

function StockChart({ stockData }) {
  const data = {
    labels: ['200-Day Avg', '50-Day Avg', 'Current'],
    datasets: [
      {
        label: `${stockData.symbol} Price Trend`,
        data: [stockData.avg200, stockData.avg50, stockData.ltp],
        borderColor: "#3b82f6",
        backgroundColor: "#93c5fd",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="mt-4">
      <Line data={data} />
    </div>
  );
}

export default StockChart;
