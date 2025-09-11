import React from "react";
import DashboardCard from "./DashboardCard";
import type { DashboardCardProps } from "./DashboardCard";

interface DashboardCardListProps {
  cards: DashboardCardProps[];
}

const DashboardCardList: React.FC<DashboardCardListProps> = ({ cards }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <DashboardCard key={index} {...card} />
      ))}
    </div>
  );
};

export default DashboardCardList;
