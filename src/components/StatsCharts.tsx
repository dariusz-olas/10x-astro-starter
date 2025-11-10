import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ActivityChartData, AccuracyChartData, CardsDistributionData, TagDistributionData } from "../types";

interface StatsChartsProps {
  activityData: ActivityChartData[];
  accuracyData: AccuracyChartData[];
  distributionData: CardsDistributionData[];
  tagData: TagDistributionData[];
}

export default function StatsCharts({ activityData, accuracyData, distributionData, tagData }: StatsChartsProps) {
  // Formatuj datę dla wykresu aktywności (pokazuj tylko dzień i miesiąc)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  // Formatuj dane aktywności z czytelniejszymi datami
  const formattedActivityData = activityData.map((item) => ({
    ...item,
    dateLabel: formatDate(item.date),
  }));

  // Jeśli brak danych, nie pokazuj wykresów
  const hasActivityData = activityData.some((d) => d.reviews > 0);
  const hasAccuracyData = accuracyData.length > 0;
  const hasDistributionData = distributionData.some((d) => d.value > 0);
  const hasTagData = tagData.length > 0;

  if (!hasActivityData && !hasAccuracyData && !hasDistributionData && !hasTagData) {
    return null;
  }

  return (
    <section className="mb-8 space-y-6">
      <h2 className="text-2xl font-semibold text-white mb-4">Wizualizacje</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wykres aktywności */}
        {hasActivityData && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Aktywność w ostatnich 30 dniach</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formattedActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border border-gray-300 rounded shadow">
                          <p className="text-sm font-medium">{payload[0].payload.date}</p>
                          <p className="text-sm text-blue-600">Powtórek: {payload[0].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="reviews" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Wykres poprawności */}
        {hasAccuracyData && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Poprawność w ostatnich sesjach</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="session" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border border-gray-300 rounded shadow">
                          <p className="text-sm font-medium">{payload[0].payload.date}</p>
                          <p className="text-sm text-green-600">Poprawność: {payload[0].value}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Wykres rozkładu fiszek */}
        {hasDistributionData && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Rozkład fiszek</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => (percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : "")}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Wykres tagów */}
        {hasTagData && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Top 5 tagów</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tagData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tag" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}
