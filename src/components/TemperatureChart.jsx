import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

export default function TemperatureChart({ hourlyData, nowTimeIndex }) {
  const chartData = useMemo(() => {
    if (!hourlyData || nowTimeIndex === undefined) return null;

    const labels = [];
    const temps = [];

    for (let i = 0; i <= 24; i+=3) { // Plot every 3 hours for 24h
        const idx = nowTimeIndex + i;
        if (idx >= hourlyData.time.length) break;
        
        const t = new Date(hourlyData.time[idx]);
        labels.push(t.getHours() + ':00');
        temps.push(hourlyData.temperature_2m[idx]);
    }

    return {
        labels,
        datasets: [
            {
                label: 'Temperatura (°C)',
                data: temps,
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#38bdf8',
                pointRadius: 4,
                fill: true,
                tension: 0.4
            }
        ]
    };
  }, [hourlyData, nowTimeIndex]);

  const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
          legend: { display: false },
          tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              titleColor: '#fff',
              bodyColor: '#fff',
              displayColors: false,
              callbacks: {
                  label: function(context) {
                      return context.parsed.y + '°C';
                  }
              }
          }
      },
      scales: {
          y: {
              grid: { color: 'rgba(255,255,255,0.1)' },
              ticks: { color: 'rgba(255,255,255,0.7)', callback: val => val + '°' }
          },
          x: {
              grid: { display: false },
              ticks: { color: 'rgba(255,255,255,0.7)' }
          }
      }
  };

  if (!chartData) return null;

  return (
      <div className="chart-section glass-card">
          <h3 className="section-title">Temperatura (24 horas)</h3>
          <div className="chart-container">
              <Line data={chartData} options={options} />
          </div>
      </div>
  );
}
