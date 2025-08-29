import { ChevronRight } from "lucide-react";

interface CategoryData {
  category_name: string;
  total_sales: number;
  product_count: number;
  percentage: number;
}

interface TopCategoriesProps {
  data: CategoryData[];
}

export default function TopCategories({ data }: TopCategoriesProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Top Catégories</h3>
        </div>
        <div className="flex items-center justify-center h-32 text-gray-500">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  // Couleurs pour le graphique en secteurs
  const colors = ["#1f2937", "#4b5563", "#6b7280", "#9ca3af", "#d1d5db"];
  
  // Ajouter les couleurs aux données
  const categoriesWithColors = data.slice(0, 5).map((category, index) => ({
    ...category,
    color: colors[index % colors.length]
  }));

  const total = categoriesWithColors.reduce((sum, cat) => sum + cat.total_sales, 0);

  // Génère la string pour conic-gradient
  const generateGradient = () => {
    let start = 0;
    return categoriesWithColors
      .map((cat) => {
        const end = start + cat.percentage * 3.6;
        const segment = `${cat.color} ${start}deg ${end}deg`;
        start = end;
        return segment;
      })
      .join(", ");
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
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
                {formatValue(total)}
              </div>
              <div className="text-xs text-gray-500">FCFA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {categoriesWithColors.map((category, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: category.color }}
              />
              <div className="flex flex-col">
                <span className="text-sm text-gray-700">{category.category_name}</span>
                <span className="text-xs text-gray-500">{category.product_count} produits</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="text-right mr-2">
                <div className="text-sm font-medium text-gray-900">
                  {formatValue(category.total_sales)}
                </div>
                <div className="text-xs text-gray-500">
                  {category.percentage.toFixed(1)}%
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}