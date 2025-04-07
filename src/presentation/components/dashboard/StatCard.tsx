import type { FC } from "react";

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
  valueColor: string;
  descriptionColor: string;
  iconColor: string;
}

const StatCard: FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  bgColor,
  textColor,
  valueColor,
  descriptionColor,
  iconColor,
}) => {
  return (
    <div className={`${bgColor} rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-medium ${textColor}`}>{title}</h3>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      <p className={`text-sm ${descriptionColor}`}>{description}</p>
    </div>
  );
};

export default StatCard;
