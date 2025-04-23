import React from "react";
import type {OrderStatUI} from "../../../core/adapters/OrderServiceAdapter";

export interface StatItem {
	label: string;
	value: string | number;
	icon: React.ReactNode;
	color: "blue" | "green" | "indigo" | "red" | "yellow" | "purple" | "gray";
	isCurrency?: boolean;
}

interface SellerStatCardListProps {
	items: OrderStatUI[];
}

export const SellerStatCardList: React.FC<SellerStatCardListProps> = ({
	items,
}) => {
	const getColorClass = (color: string) => {
		switch (color) {
			case "blue":
				return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
			case "green":
				return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
			case "indigo":
				return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800";
			case "red":
				return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
			case "yellow":
				return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800";
			case "purple":
				return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800";
			default:
				return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";
		}
	};

	return (
		<>
			{items.map((item, index) => (
				<div
					key={index}
					className={`rounded-lg border p-4 ${getColorClass(item.color)}`}
				>
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium">{item.label}</h3>
						{item.icon || null}
					</div>
					<p className="mt-2 text-2xl font-bold">{item.value}</p>
				</div>
			))}
		</>
	);
};

export default SellerStatCardList;
