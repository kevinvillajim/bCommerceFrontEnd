import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

export interface DashboardCardProps {
  title: string;
  value: string | number;
  change: number;
  text?: string | React.ReactNode;
  icon: React.ElementType;
  iconBgColor?: string;
  iconColor?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  change,
  text = null,
  icon: Icon,
  iconBgColor = "bg-gray-100 dark:bg-gray-700",
  iconColor = "text-gray-600 dark:text-gray-300",
}) => {
  const isPositive = change > 0;
  const changeColor = isPositive
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {value}
        </p>
        {change !== 0 && (
          <div className={`flex items-center mt-2 ${changeColor}`}>
            {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            <span className="ml-1 text-sm font-medium">
              {Math.abs(change)}% respecto al mes anterior
            </span>
          </div>
        )}
        {text && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {text}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${iconBgColor}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </div>
  );
};

export default DashboardCard;
