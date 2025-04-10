import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { FC } from "react";

interface CardPendingProps {
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
  title: string;
  color?: boolean;
  description: string;
  linkText: string;
  linkTo: string;
}

const PendingCard: FC<CardPendingProps> = ({
  icon: Icon,
  iconBgColor,
  iconColor,
  title,
  color = false,
  description,
  linkText,
  linkTo,
}) => {
  return (
		<div
			className={`${color ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"} p-4 rounded-lg flex items-start`}
		>
			<div className={`p-2 rounded-lg mr-3 ${iconBgColor}`}>
				<Icon className={`w-5 h-5 ${iconColor}`} />
			</div>
			<div>
				<h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
				<p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
					{description}
				</p>
				<Link
					to={linkTo}
					className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline inline-flex items-center"
				>
					{linkText} <ChevronRight size={16} />
				</Link>
			</div>
		</div>
	);
};

export default PendingCard;
