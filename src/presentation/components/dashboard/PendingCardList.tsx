import type { FC } from "react";
import CardPending from "./PendingCard";

interface CardPendingItem {
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
  title: string;
  description: string;
  linkText: string;
  linkTo: string;
}

interface CardPendingListProps {
  items: CardPendingItem[];
}

const PendingCardList: FC<CardPendingListProps> = ({ items }) => {
  return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <CardPending key={index} {...item} />
        ))}
      </div>
  );
};

export default PendingCardList;
