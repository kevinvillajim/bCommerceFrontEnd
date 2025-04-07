import type { FC } from "react";
import StatCard from "./StatCard";

interface StatCardItem {
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

interface StatCardListProps {
  items: StatCardItem[];
}

const StatCardList: FC<StatCardListProps> = ({ items }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <StatCard key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

export default StatCardList;
