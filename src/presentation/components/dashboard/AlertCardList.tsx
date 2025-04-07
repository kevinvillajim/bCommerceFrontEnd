import type { FC } from "react";
import AlertCard from "./AlertCard";

interface AlertCardItem {
  icon?: React.ElementType;
  borderColor: string;
  bgColor: string;
  iconColor: string;
  title: string;
  description: string;
  linkText: string;
  linkTo: string;
  textColor: string;
  hoverTextColor: string;
}

interface AlertCardListProps {
  items: AlertCardItem[];
}

const AlertCardList: FC<AlertCardListProps> = ({ items }) => {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <AlertCard key={index} {...item} />
      ))}
    </div>
  );
};

export default AlertCardList;
