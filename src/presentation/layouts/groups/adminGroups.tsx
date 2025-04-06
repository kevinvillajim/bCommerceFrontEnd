import {
	Users,
	Package,
	ShoppingBag,
	Tag,
	FileText,
	Star,
	Settings,
	BarChart2,
	DollarSign,
	MessageSquare,
	AlertTriangle,
	Truck,
	Briefcase,

} from "lucide-react";

interface adminGroups {
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

const adminGroups = [
	{
		title: "Principal",
		links: [
			{
				path: "/admin/dashboard",
				label: "Dashboard",
				icon: <BarChart2 className="w-5 h-5 mr-3" />,
			},
		],
	},
	{
		title: "Gestión de Usuario",
		links: [
			{
				path: "/admin/users",
				label: "Usuarios",
				icon: <Users className="w-5 h-5 mr-3" />,
			},
			{
				path: "/admin/sellers",
				label: "Vendedores",
				icon: <Briefcase className="w-5 h-5 mr-3" />,
				isNotificated: false,
				notificationCount: 0,
			},
		],
	},
	{
		title: "Productos",
		links: [
			{
				path: "/admin/products",
				label: "Productos",
				icon: <Package className="w-5 h-5 mr-3" />,
			},
			{
				path: "/admin/categories",
				label: "Categorías",
				icon: <Tag className="w-5 h-5 mr-3" />,
			},
		],
	},
	{
		title: "Pedidos",
		links: [
			{
				path: "/admin/orders",
				label: "Pedidos",
				icon: <ShoppingBag className="w-5 h-5 mr-3" />,
			},
			{
				path: "/admin/shipping",
				label: "Envíos",
				icon: <Truck className="w-5 h-5 mr-3" />,
			},
		],
	},
	{
		title: "Contenido",
		links: [
			{
				path: "/admin/ratings",
				label: "Valoraciones y Reseñas",
				icon: <Star className="w-5 h-5 mr-3" />,
				isNotificated: false,
				notificationCount: 10,
			},
			{
				path: "/admin/feedback",
				label: "Feedback y Comentarios",
				icon: <MessageSquare className="w-5 h-5 mr-3" />,
				isNotificated: true,
				notificationCount: 5,
			},
			{
				path: "/admin/discounts",
				label: "Descuentos",
				icon: <DollarSign className="w-5 h-5 mr-3" />,
			},
		],
	},
	{
		title: "Finanzas",
		links: [
			{
				path: "/admin/invoices",
				label: "Facturas",
				icon: <FileText className="w-5 h-5 mr-3" />,
			},
			{
				path: "/admin/accounting",
				label: "Contabilidad",
				icon: <DollarSign className="w-5 h-5 mr-3" />,
			},
		],
	},
	{
		title: "Sistema",
		links: [
			{
				path: "/admin/settings",
				label: "Configuración",
				icon: <Settings className="w-5 h-5 mr-3" />,
			},
			{
				path: "/admin/logs",
				label: "Registros de Errores",
				icon: <AlertTriangle className="w-5 h-5 mr-3" />,
			},
		],
	},
];

export default adminGroups;