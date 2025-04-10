import type {ReactNode} from "react";

interface SellerStatCardProps {
	label: string;
	value: string | number;
	icon: ReactNode;
	color: string; // ej: "yellow", "blue", etc.
}

export const SellerStatCard = ({
	label,
	value,
	icon,
	color,
}: SellerStatCardProps) => {
	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 col-span-1">
			<div className="flex justify-between items-start">
				<div>
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
						{label}
					</h3>
					<p
						className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}
					>
						{value}
					</p>
				</div>
				<div className={`p-2 bg-${color}-50 dark:bg-${color}-900 rounded-lg`}>
					{icon}
				</div>
			</div>
		</div>
	);
};
