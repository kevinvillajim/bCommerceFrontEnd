import {
	BarChart2,
	Package,
	ShoppingBag,
	Truck,
	Star,
	MessageSquare,
	FileText,
	DollarSign,
	User,
} from "lucide-react";

interface sellerGroups {
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
	};
}

const sellerGroups = [
	{
		title: "Principal",
		links: [
			{
				path: "/seller/dashboard",
				label: "Dashboard",
				icon: <BarChart2 className="w-5 h-5 mr-3" />,
			},
		],
	},
	{
		title: "Productos",
		links: [
			{
				path: "/seller/products",
				label: "Todos los Productos",
				icon: <Package className="w-5 h-5 mr-3" />,
			},
			{
				path: "/seller/products/create",
				label: "Añadir Producto",
				icon: <Package className="w-5 h-5 mr-3" />,
			},
		],
	},
	{
		title: "Pedidos",
		links: [
			{
				path: "/seller/orders",
				label: "Pedidos",
				icon: <ShoppingBag className="w-5 h-5 mr-3" />,
				isNotificated: true,
				notificationCount: 1,
			},
			{
				path: "/seller/shipping",
				label: "Envíos",
				icon: <Truck className="w-5 h-5 mr-3" />,
			},
		],
	},
	{
		title: "Clientes",
		links: [
			{
				path: "/seller/ratings",
				label: "Valoraciones y Reseñas",
				icon: <Star className="w-5 h-5 mr-3" />,
			},
			{
				path: "/seller/messages",
				label: "Mensajes",
				icon: <MessageSquare className="w-5 h-5 mr-3" />,
			},
		],
	},
	{
		title: "Finanzas",
		links: [
			{
				path: "/seller/invoices",
				label: "Facturas",
				icon: <FileText className="w-5 h-5 mr-3" />,
			},
			{
				path: "/seller/earnings",
				label: "Ganancias",
				icon: <DollarSign className="w-5 h-5 mr-3" />,
			},
		],
	},
	{
		title: "Cuenta",
		links: [
			{
				path: "/seller/profile",
				label: "Perfil",
				icon: <User className="w-5 h-5 mr-3" />,
			},
		],
	},
];

export default sellerGroups;
