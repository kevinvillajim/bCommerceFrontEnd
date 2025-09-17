import {
	BarChart2,
	Plus,
	List,
} from "lucide-react";

interface paymentGroups {
	groups: {
		title: string;
		links: {
			path: string;
			label: string;
			icon?: React.ReactNode;
			isNotificated?: boolean;
			notificationCount?: number;
		}[];
    }[];
    title: {
        title: string;
        icon: React.ReactNode;
    }
}

const paymentGroups = [
	{
		title: "Principal",
		links: [
			{
				path: "/payment/dashboard",
				label: "Dashboard",
				icon: <BarChart2 className="w-5 h-5 mr-3" />,
			},
			{
				path: "/payment/create",
				label: "Crear Link",
				icon: <Plus className="w-5 h-5 mr-3" />,
			},
			{
				path: "/payment/links",
				label: "Mis Links",
				icon: <List className="w-5 h-5 mr-3" />,
			},
		],
	},
];

export default paymentGroups;