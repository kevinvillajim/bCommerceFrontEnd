import {SellerStatCard} from "./SellerStatCard";

interface StatItem {
	label: string;
	value: string | number;
	icon: React.ReactNode;
	color: string;
}

interface SellerStatCardListProps {
	items: StatItem[];
}

export const SellerStatCardList = ({items}: SellerStatCardListProps) => {
	return (<>
			{items.map((item, index) => (
				<SellerStatCard
					key={index}
					label={item.label}
					value={item.value}
					icon={item.icon}
					color={item.color}
				/>
			))}</>
	);
};

export default SellerStatCardList