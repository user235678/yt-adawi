import { ChevronRight } from "lucide-react";

export default function TopCategories() {
  const categories = [
    { name: "Vêtements Homme", value: 2840, color: "#1f2937", percentage: 45 },
    { name: "Vêtements Femme", value: 1920, color: "#6b7280", percentage: 30 },
    { name: "Montres", value: 1280, color: "#9ca3af", percentage: 20 },
    { name: "Enfants", value: 320, color: "#d1d5db", percentage: 5 },
  ];

  const total = categories.reduce((sum, cat) => sum + cat.value, 0);

  // Génère la string pour conic-gradient
  const generateGradient = () => {
    let start = 0;
    return categories
      .map((cat) => {
        const end = start + cat.percentage * 3.6;
        const segment = `${cat.color} ${start}deg ${end}deg`;
        start = end;
        return segment;
      })
      .join(", ");
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Top Catégories</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Donut Chart */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <div
            className="w-32 h-32 rounded-full"
            style={{
              background: `conic-gradient(${generateGradient()})`,
            }}
          />
          <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {(total / 1000).toFixed(1)}k
              </div>
              <div className="text-xs text-gray-500">FCFA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {categories.map((category, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm text-gray-700">{category.name}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900 mr-2">
                {(category.value / 1000).toFixed(1)}k
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
