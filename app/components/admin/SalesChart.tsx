import { useState } from "react";
import { ChevronDown } from "lucide-react";

// Données de démonstration
const baseChartData = [
  { date: "01/12", revenus: 45000, couts: 28000 },
  { date: "02/12", revenus: 52000, couts: 31000 },
  { date: "03/12", revenus: 48000, couts: 29000 },
  { date: "04/12", revenus: 61000, couts: 35000 },
  { date: "05/12", revenus: 55000, couts: 33000 },
  { date: "06/12", revenus: 67000, couts: 38000 },
  { date: "07/12", revenus: 72000, couts: 41000 },
  { date: "08/12", revenus: 58000, couts: 34000 },
  { date: "09/12", revenus: 63000, couts: 36000 },
  { date: "10/12", revenus: 69000, couts: 39000 },
  { date: "11/12", revenus: 75000, couts: 42000 },
  { date: "12/12", revenus: 71000, couts: 40000 },
  { date: "13/12", revenus: 78000, couts: 44000 },
  { date: "14/12", revenus: 82000, couts: 46000 },
];

export default function SalesChart() {
  const [timeRange, setTimeRange] = useState("14-days");

  const getFilteredData = () => {
    switch (timeRange) {
      case "7-days":
        return baseChartData.slice(-7);
      case "30-days":
        return [...baseChartData, ...baseChartData.slice(0, 16)].slice(-30);
      default:
        return baseChartData;
    }
  };

  const chartData = getFilteredData();

  const chartWidth = 700;
  const chartHeight = 300;

  const allValues = chartData.flatMap((d) => [d.revenus, d.couts]);
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);
  const padding = (maxValue - minValue) * 0.1;
  const chartMax = maxValue + padding;
  const chartMin = Math.max(0, minValue - padding);

  const getX = (i: number) => (i / (chartData.length - 1)) * chartWidth;
  const getY = (val: number) =>
    chartHeight - ((val - chartMin) / (chartMax - chartMin)) * chartHeight;

  const revenusPoints = chartData.map((d, i) => `${getX(i)},${getY(d.revenus)}`).join(" ");
  const coutsPoints = chartData.map((d, i) => `${getX(i)},${getY(d.couts)}`).join(" ");

  const formatValue = (val: number) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val);

  const handleExport = () => {
    const header = "Date,Revenus,Coûts\n";
    const rows = chartData.map((d) => `${d.date},${d.revenus},${d.couts}`).join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ventes-${timeRange}.csv`;
    link.click();
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Performance des Ventes
        </h3>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleExport}
            className="flex items-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Exporter CSV
            <ChevronDown className="w-4 h-4 ml-2" />
          </button>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <option value="7-days">7 derniers jours</option>
            <option value="14-days">14 derniers jours</option>
            <option value="30-days">30 derniers jours</option>
          </select>
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-gray-800 rounded-full" />
          Revenus
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-gray-300 rounded-full" />
          Coûts
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 relative pl-10 pr-2">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
          {/* Grille horizontale */}
          {[0.25, 0.5, 0.75, 1].map((p, i) => (
            <line
              key={i}
              x1="0"
              y1={chartHeight * p}
              x2={chartWidth}
              y2={chartHeight * p}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}

          {/* Grille verticale */}
          {chartData.map((_, i) => {
            if (i % 2 === 0) {
              return (
                <line
                  key={i}
                  x1={getX(i)}
                  y1={0}
                  x2={getX(i)}
                  y2={chartHeight}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
              );
            }
            return null;
          })}

          {/* Lignes */}
          <polyline fill="none" stroke="#d1d5db" strokeWidth="2" points={coutsPoints} />
          <polyline fill="none" stroke="#1f2937" strokeWidth="2" points={revenusPoints} />

          {/* Points */}
          {chartData.map((d, i) => (
            <circle
              key={`revenus-${i}`}
              cx={getX(i)}
              cy={getY(d.revenus)}
              r="4"
              fill="#1f2937"
              stroke="white"
              strokeWidth="1"
            />
          ))}
          {chartData.map((d, i) => (
            <circle
              key={`couts-${i}`}
              cx={getX(i)}
              cy={getY(d.couts)}
              r="4"
              fill="#d1d5db"
              stroke="white"
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* Labels Y (bien positionnés) */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          {[chartMax, chartMax * 0.75, chartMax * 0.5, chartMax * 0.25, chartMin].map((v, i) => (
            <div key={i} className="h-full flex items-center">
              <span>{formatValue(Math.round(v))}</span>
            </div>
          ))}
        </div>

        {/* Labels X */}
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-500 px-2">
          {chartData.map((d, i) =>
            i % Math.ceil(chartData.length / 5) === 0 || i === chartData.length - 1 ? (
              <span key={i} className="text-[10px]">
                {d.date}
              </span>
            ) : (
              <span key={i} className="text-[10px] opacity-0">
                {d.date}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
