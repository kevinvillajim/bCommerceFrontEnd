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
				return "bg-blue-50 text-blue-700 border-blue-200";
			case "green":
				return "bg-green-50 text-green-700 border-green-200";
			case "indigo":
				return "bg-indigo-50 text-indigo-700 border-indigo-200";
			case "red":
				return "bg-red-50 text-red-700 border-red-200";
			case "yellow":
				return "bg-yellow-50 text-yellow-700 border-yellow-200";
			case "purple":
				return "bg-purple-50 text-purple-700 border-purple-200";
			default:
				return "bg-gray-50 text-gray-700 border-gray-200";
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
