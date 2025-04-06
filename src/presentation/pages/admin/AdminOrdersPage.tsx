import React, {useState, useEffect} from "react";
import Table from "../../components/dashboard/Table";
import {
	ShoppingBag,
	User,
	Calendar,
	Truck,
	FileText,
	Eye,
	RefreshCw,
	Filter,
	Clock,
	CheckCircle,
	XCircle,
	RotateCcw,
	Package,
	AlertTriangle,
} from "lucide-react";
import {Link} from "react-router-dom";
import type {Order} from "../../../core/domain/entities/Order";

// Datos simulados para pedidos
const mockOrders: Order[] = [
	{
		id: 1,
		userId: 101,
		sellerId: 1,
		items: [
			{
				id: 1001,
				orderId: 1,
				productId: 1,
				quantity: 2,
				price: 899.99,
				subtotal: 1799.98,
				product: {
					name: "Laptop HP Pavilion",
					image: "laptop-hp.jpg",
					slug: "laptop-hp-pavilion",
				},
			},
			{
				id: 1002,
				orderId: 1,
				productId: 5,
				quantity: 1,
				price: 129.99,
				subtotal: 129.99,
				product: {
					name: "Teclado Mecánico Logitech G Pro",
					image: "teclado-logitech.jpg",
					slug: "teclado-mecanico-logitech-g-pro",
				},
			},
		],
		total: 1929.97,
		status: "completed",
		paymentId: "pay_Hk82nDs921Mna",
		paymentMethod: "credit_card",
		paymentStatus: "paid",
		paymentDetails: {
			cardLastFour: "4242",
			cardBrand: "visa",
		},
		shippingData: {
			address: "Calle Principal 123",
			city: "Madrid",
			state: "Madrid",
			country: "España",
			postalCode: "28001",
			phone: "+34612345678",
			name: "Juan Pérez",
		},
		orderNumber: "ORD-2023-001",
		createdAt: "2023-11-01T14:30:00Z",
		updatedAt: "2023-11-03T10:15:00Z",
	},
	{
		id: 2,
		userId: 102,
		sellerId: 2,
		items: [
			{
				id: 1003,
				orderId: 2,
				productId: 2,
				quantity: 1,
				price: 799.99,
				subtotal: 799.99,
				product: {
					name: "Smartphone Samsung Galaxy S22",
					image: "samsung-s22.jpg",
					slug: "smartphone-samsung-galaxy-s22",
				},
			},
		],
		total: 799.99,
		status: "shipped",
		paymentId: "pay_Jk72nLp821Zna",
		paymentMethod: "paypal",
		paymentStatus: "paid",
		paymentDetails: {
			email: "cliente@example.com",
		},
		shippingData: {
			address: "Avenida Central 456",
			city: "Barcelona",
			state: "Cataluña",
			country: "España",
			postalCode: "08001",
			phone: "+34698765432",
			name: "María Rodríguez",
		},
		orderNumber: "ORD-2023-002",
		createdAt: "2023-11-02T09:45:00Z",
		updatedAt: "2023-11-04T11:20:00Z",
	},
	{
		id: 3,
		userId: 103,
		sellerId: 3,
		items: [
			{
				id: 1004,
				orderId: 3,
				productId: 3,
				quantity: 1,
				price: 349.99,
				subtotal: 349.99,
				product: {
					name: "Audifonos Sony WH-1000XM4",
					image: "sony-headphones.jpg",
					slug: "audifonos-sony-wh-1000xm4",
				},
			},
		],
		total: 349.99,
		status: "processing",
		paymentId: "pay_Lp92nQs721Pna",
		paymentMethod: "credit_card",
		paymentStatus: "paid",
		paymentDetails: {
			cardLastFour: "1234",
			cardBrand: "mastercard",
		},
		shippingData: {
			address: "Plaza Mayor 789",
			city: "Valencia",
			state: "Comunidad Valenciana",
			country: "España",
			postalCode: "46001",
			phone: "+34623456789",
			name: "Carlos Sánchez",
		},
		orderNumber: "ORD-2023-003",
		createdAt: "2023-11-03T16:20:00Z",
		updatedAt: "2023-11-03T16:20:00Z",
	},
	{
		id: 4,
		userId: 104,
		sellerId: 4,
		items: [
			{
				id: 1005,
				orderId: 4,
				productId: 4,
				quantity: 1,
				price: 499.99,
				subtotal: 499.99,
				product: {
					name: "Monitor LG UltraWide",
					image: "lg-monitor.jpg",
					slug: "monitor-lg-ultrawide",
				},
			},
		],
		total: 499.99,
		status: "cancelled",
		paymentId: "pay_Np72nRs621Qna",
		paymentMethod: "credit_card",
		paymentStatus: "refunded",
		paymentDetails: {
			cardLastFour: "5678",
			cardBrand: "visa",
		},
		shippingData: {
			address: "Calle Secundaria 321",
			city: "Sevilla",
			state: "Andalucía",
			country: "España",
			postalCode: "41001",
			phone: "+34634567890",
			name: "Ana Martínez",
		},
		orderNumber: "ORD-2023-004",
		createdAt: "2023-11-04T11:10:00Z",
		updatedAt: "2023-11-05T09:30:00Z",
	},
	{
		id: 5,
		userId: 105,
		sellerId: 1,
		items: [
			{
				id: 1006,
				orderId: 5,
				productId: 8,
				quantity: 1,
				price: 1999.99,
				subtotal: 1999.99,
				product: {
					name: "Cámara Sony Alpha a7 III",
					image: "sony-camera.jpg",
					slug: "camara-sony-alpha-a7-iii",
				},
			},
		],
		total: 1999.99,
		status: "pending",
		paymentId: undefined,
		paymentMethod: "bank_transfer",
		paymentStatus: "pending",
		paymentDetails: {},
		shippingData: {
			address: "Avenida Principal 987",
			city: "Bilbao",
			state: "País Vasco",
			country: "España",
			postalCode: "48001",
			phone: "+34645678901",
			name: "Javier García",
		},
		orderNumber: "ORD-2023-005",
		createdAt: "2023-11-05T14:50:00Z",
		updatedAt: "2023-11-05T14:50:00Z",
	},
	{
		id: 6,
		userId: 106,
		sellerId: 2,
		items: [
			{
				id: 1007,
				orderId: 6,
				productId: 9,
				quantity: 2,
				price: 69.99,
				subtotal: 139.98,
				product: {
					name: "Mouse Gaming Razer DeathAdder",
					image: "razer-mouse.jpg",
					slug: "mouse-gaming-razer-deathadder",
				},
			},
			{
				id: 1008,
				orderId: 6,
				productId: 5,
				quantity: 1,
				price: 129.99,
				subtotal: 129.99,
				product: {
					name: "Teclado Mecánico Logitech G Pro",
					image: "teclado-logitech.jpg",
					slug: "teclado-mecanico-logitech-g-pro",
				},
			},
		],
		total: 269.97,
		status: "delivered",
		paymentId: "pay_Rp52nTs521Sna",
		paymentMethod: "credit_card",
		paymentStatus: "paid",
		paymentDetails: {
			cardLastFour: "9012",
			cardBrand: "amex",
		},
		shippingData: {
			address: "Calle Nueva 654",
			city: "Zaragoza",
			state: "Aragón",
			country: "España",
			postalCode: "50001",
			phone: "+34656789012",
			name: "Lucía Fernández",
		},
		orderNumber: "ORD-2023-006",
		createdAt: "2023-10-30T10:25:00Z",
		updatedAt: "2023-11-02T13:40:00Z",
	},
	{
		id: 7,
		userId: 107,
		sellerId: 3,
		items: [
			{
				id: 1009,
				orderId: 7,
				productId: 10,
				quantity: 1,
				price: 429.99,
				subtotal: 429.99,
				product: {
					name: "Smartwatch Apple Watch Series 8",
					image: "apple-watch.jpg",
					slug: "smartwatch-apple-watch-series-8",
				},
			},
		],
		total: 429.99,
		status: "ready_for_pickup",
		paymentId: "pay_Tp32nUs421Vna",
		paymentMethod: "paypal",
		paymentStatus: "paid",
		paymentDetails: {
			email: "otro@example.com",
		},
		shippingData: {
			address: "Recogida en tienda",
			city: "Málaga",
			state: "Andalucía",
			country: "España",
			postalCode: "29001",
			phone: "+34667890123",
			name: "David López",
		},
		orderNumber: "ORD-2023-007",
		createdAt: "2023-11-01T17:15:00Z",
		updatedAt: "2023-11-03T15:50:00Z",
	},
	{
		id: 8,
		userId: 108,
		sellerId: 5,
		items: [
			{
				id: 1010,
				orderId: 8,
				productId: 6,
				quantity: 1,
				price: 899.99,
				subtotal: 899.99,
				product: {
					name: "Tablet iPad Pro 11",
					image: "ipad-pro.jpg",
					slug: "tablet-ipad-pro-11",
				},
			},
		],
		total: 899.99,
		status: "processing",
		paymentId: "pay_Vp12nWs321Xna",
		paymentMethod: "credit_card",
		paymentStatus: "paid",
		paymentDetails: {
			cardLastFour: "3456",
			cardBrand: "visa",
		},
		shippingData: {
			address: "Avenida del Mar 321",
			city: "Alicante",
			state: "Comunidad Valenciana",
			country: "España",
			postalCode: "03001",
			phone: "+34678901234",
			name: "Elena Gómez",
		},
		orderNumber: "ORD-2023-008",
		createdAt: "2023-11-05T12:30:00Z",
		updatedAt: "2023-11-05T12:30:00Z",
	},
	{
		id: 9,
		userId: 109,
		sellerId: 4,
		items: [
			{
				id: 1011,
				orderId: 9,
				productId: 7,
				quantity: 1,
				price: 179.99,
				subtotal: 179.99,
				product: {
					name: "Impresora Canon PIXMA",
					image: "canon-printer.jpg",
					slug: "impresora-canon-pixma",
				},
			},
		],
		total: 179.99,
		status: "returned",
		paymentId: "pay_Xp92nYs221Zna",
		paymentMethod: "credit_card",
		paymentStatus: "refunded",
		paymentDetails: {
			cardLastFour: "7890",
			cardBrand: "mastercard",
		},
		shippingData: {
			address: "Plaza Central 456",
			city: "Murcia",
			state: "Región de Murcia",
			country: "España",
			postalCode: "30001",
			phone: "+34689012345",
			name: "Miguel Torres",
		},
		orderNumber: "ORD-2023-009",
		createdAt: "2023-10-28T09:20:00Z",
		updatedAt: "2023-11-04T16:45:00Z",
	},
	{
		id: 10,
		userId: 110,
		sellerId: 2,
		items: [
			{
				id: 1012,
				orderId: 10,
				productId: 2,
				quantity: 1,
				price: 799.99,
				subtotal: 799.99,
				product: {
					name: "Smartphone Samsung Galaxy S22",
					image: "samsung-s22.jpg",
					slug: "smartphone-samsung-galaxy-s22",
				},
			},
			{
				id: 1013,
				orderId: 10,
				productId: 3,
				quantity: 1,
				price: 349.99,
				subtotal: 349.99,
				product: {
					name: "Audifonos Sony WH-1000XM4",
					image: "sony-headphones.jpg",
					slug: "audifonos-sony-wh-1000xm4",
				},
			},
		],
		total: 1149.98,
		status: "completed",
		paymentId: "pay_Zp72nAs121Ana",
		paymentMethod: "credit_card",
		paymentStatus: "paid",
		paymentDetails: {
			cardLastFour: "1357",
			cardBrand: "visa",
		},
		shippingData: {
			address: "Calle Mayor 789",
			city: "Las Palmas",
			state: "Canarias",
			country: "España",
			postalCode: "35001",
			phone: "+34690123456",
			name: "Carmen Navarro",
		},
		orderNumber: "ORD-2023-010",
		createdAt: "2023-10-25T15:40:00Z",
		updatedAt: "2023-10-28T11:15:00Z",
	},
];

// Mapeo de estado para los pedidos
const orderStatusMap: Record<
	string,
	{label: string; color: string; icon: React.ReactNode}
> = {
	pending: {
		label: "Pendiente",
		color:
			"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
		icon: <Clock className="w-3 h-3 mr-1" />,
	},
	processing: {
		label: "En proceso",
		color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
		icon: <RefreshCw className="w-3 h-3 mr-1" />,
	},
	shipped: {
		label: "Enviado",
		color:
			"bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
		icon: <Truck className="w-3 h-3 mr-1" />,
	},
	delivered: {
		label: "Entregado",
		color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
		icon: <Package className="w-3 h-3 mr-1" />,
	},
	completed: {
		label: "Completado",
		color:
			"bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
		icon: <CheckCircle className="w-3 h-3 mr-1" />,
	},
	cancelled: {
		label: "Cancelado",
		color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
		icon: <XCircle className="w-3 h-3 mr-1" />,
	},
	returned: {
		label: "Devuelto",
		color:
			"bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
		icon: <RotateCcw className="w-3 h-3 mr-1" />,
	},
	ready_for_pickup: {
		label: "Listo para recoger",
		color:
			"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
		icon: <ShoppingBag className="w-3 h-3 mr-1" />,
	},
};

// Mapeo de estado de pago
const paymentStatusMap: Record<string, {label: string; color: string}> = {
	paid: {
		label: "Pagado",
		color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
	},
	pending: {
		label: "Pendiente",
		color:
			"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
	},
	refunded: {
		label: "Reembolsado",
		color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
	},
	failed: {
		label: "Fallido",
		color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
	},
};

// Mapeo de métodos de pago
const paymentMethodMap: Record<string, string> = {
	credit_card: "Tarjeta de crédito",
	paypal: "PayPal",
	bank_transfer: "Transferencia bancaria",
	cash_on_delivery: "Contra reembolso",
};

const AdminOrdersPage: React.FC = () => {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
	const [sellerFilter, setSellerFilter] = useState<number | null>(null);
	const [dateRangeFilter, setDateRangeFilter] = useState<{
		from: string;
		to: string;
	}>({
		from: "",
		to: "",
	});
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalItems: 0,
		itemsPerPage: 10,
	});

	// Cargar datos de pedidos
	useEffect(() => {
		const fetchOrders = () => {
			setLoading(true);
			// Simulación de llamada a API
			setTimeout(() => {
				setOrders(mockOrders);
				setPagination({
					currentPage: 1,
					totalPages: 1,
					totalItems: mockOrders.length,
					itemsPerPage: 10,
				});
				setLoading(false);
			}, 500);
		};

		fetchOrders();
	}, []);

	// Filtrar pedidos
	const filteredOrders = orders.filter((order) => {
		// Filtro por estado
		const matchesStatus =
			statusFilter === "all" || order.status === statusFilter;

		// Filtro por estado de pago
		const matchesPaymentStatus =
			paymentStatusFilter === "all" ||
			order.paymentStatus === paymentStatusFilter;

		// Filtro por vendedor
		const matchesSeller =
			sellerFilter === null || order.sellerId === sellerFilter;

		// Filtro por rango de fechas
		let matchesDateRange = true;
		if (dateRangeFilter.from) {
			const orderDate = new Date(order.createdAt || "");
			const fromDate = new Date(dateRangeFilter.from);
			matchesDateRange = orderDate >= fromDate;
		}
		if (dateRangeFilter.to && matchesDateRange) {
			const orderDate = new Date(order.createdAt || "");
			const toDate = new Date(dateRangeFilter.to);
			// Ajustar a final del día
			toDate.setHours(23, 59, 59, 999);
			matchesDateRange = orderDate <= toDate;
		}

		return (
			matchesStatus && matchesPaymentStatus && matchesSeller && matchesDateRange
		);
	});

	// Obtener lista de vendedores únicos para filtro
	const uniqueSellers = [...new Set(orders.map((order) => order.sellerId))];

	// Obtener siguiente estado del pedido
	const getNextStatus = (currentStatus: string): string => {
		const statusFlow: Record<string, string> = {
			pending: "processing",
			processing: "shipped",
			shipped: "delivered",
			delivered: "completed",
		};

		return statusFlow[currentStatus] || currentStatus;
	};

	// Actualizar estado del pedido
	const updateOrderStatus = (orderId: number, newStatus: string) => {
		setOrders((prevOrders) =>
			prevOrders.map((order) => {
				if (order.id === orderId) {
					return {
						...order,
						status: newStatus,
						updatedAt: new Date().toISOString(),
					};
				}
				return order;
			})
		);
	};

	// Avanzar al siguiente estado
	const advanceOrderStatus = (orderId: number, currentStatus: string) => {
		const nextStatus = getNextStatus(currentStatus);
		if (nextStatus !== currentStatus) {
			updateOrderStatus(orderId, nextStatus);
		}
	};

	// Cancelar pedido
	const cancelOrder = (orderId: number) => {
		if (window.confirm("¿Estás seguro de que deseas cancelar este pedido?")) {
			updateOrderStatus(orderId, "cancelled");
		}
	};

	// Formatear moneda
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("es-ES", {
			style: "currency",
			currency: "EUR",
			minimumFractionDigits: 2,
		}).format(amount);
	};

	// Formatear fecha
	const formatDate = (dateString: string | undefined) => {
		if (!dateString) return "N/A";

		const date = new Date(dateString);
		return new Intl.DateTimeFormat("es-ES", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	};

	// Manejar cambio de página
	const handlePageChange = (page: number) => {
		setPagination((prev) => ({...prev, currentPage: page}));
		// En una app real, aquí obtendrías los datos para la nueva página
	};

	// Refrescar datos
	const refreshData = () => {
		setLoading(true);
		// Simular recarga de datos
		setTimeout(() => {
			setLoading(false);
		}, 500);
	};

	// Definir columnas de la tabla
	const columns = [
		{
			key: "orderNumber",
			header: "Pedido",
			sortable: true,
			render: (order: Order) => (
				<div className="flex items-center">
					<div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
						<ShoppingBag className="h-6 w-6 text-primary-600 dark:text-primary-400" />
					</div>
					<div className="ml-4">
						<div className="text-sm font-medium text-gray-900 dark:text-white">
							{order.orderNumber}
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
							<Calendar className="w-3 h-3 mr-1" />
							{formatDate(order.createdAt)}
						</div>
					</div>
				</div>
			),
		},
		{
			key: "customer",
			header: "Cliente",
			sortable: true,
			render: (order: Order) => {
				const customerName =
					order.shippingData?.name || `Usuario ${order.userId}`;
				return (
					<div className="flex items-center">
						<div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
							<User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
						</div>
						<div className="ml-3">
							<div className="text-sm font-medium text-gray-900 dark:text-white">
								{customerName}
							</div>
							<div className="text-xs text-gray-500 dark:text-gray-400">
								ID: {order.userId}
							</div>
						</div>
					</div>
				);
			},
		},
		{
			key: "items",
			header: "Productos",
			render: (order: Order) => (
				<div className="text-sm">
					<span className="font-medium">{order.items.length}</span> producto(s)
					{order.items.length > 0 && (
						<div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
							{order.items.slice(0, 2).map((item) => (
								<div key={item.id}>
									{item.quantity}x{" "}
									{item.product?.name || `Producto ${item.productId}`}
								</div>
							))}
							{order.items.length > 2 && (
								<div>+ {order.items.length - 2} más...</div>
							)}
						</div>
					)}
				</div>
			),
		},
		{
			key: "total",
			header: "Total",
			sortable: true,
			render: (order: Order) => (
				<div className="font-medium text-gray-900 dark:text-white">
					{formatCurrency(order.total)}
				</div>
			),
		},
		{
			key: "status",
			header: "Estado",
			sortable: true,
			render: (order: Order) => {
				const status = orderStatusMap[order.status] || {
					label: order.status,
					color:
						"bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
					icon: <AlertTriangle className="w-3 h-3 mr-1" />,
				};

				return (
					<span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
					>
						{status.icon}
						{status.label}
					</span>
				);
			},
		},
		{
			key: "payment",
			header: "Pago",
			sortable: true,
			render: (order: Order) => {
				const paymentMethod =
					paymentMethodMap[order.paymentMethod || ""] || order.paymentMethod;
				const paymentStatus = paymentStatusMap[
					order.paymentStatus || "pending"
				] || {
					label: order.paymentStatus,
					color:
						"bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
				};

				return (
					<div>
						<div className="text-sm text-gray-500 dark:text-gray-400">
							{paymentMethod}
						</div>
						<span
							className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatus.color}`}
						>
							{paymentStatus.label}
						</span>
					</div>
				);
			},
		},
		{
			key: "actions",
			header: "Acciones",
			render: (order: Order) => {
				const canAdvance = [
					"pending",
					"processing",
					"shipped",
					"delivered",
				].includes(order.status);
				const canCancel = ["pending", "processing"].includes(order.status);

				return (
					<div className="flex justify-end space-x-2">
						{/* Ver detalles */}
						<Link
							to={`/admin/orders/${order.id}`}
							className="p-1 text-blue-600 hover:bg-blue-100 rounded-md dark:text-blue-400 dark:hover:bg-blue-900"
							title="Ver detalles del pedido"
						>
							<Eye size={18} />
						</Link>

						{/* Ver factura si está completado */}
						{["completed", "delivered"].includes(order.status) && (
							<Link
								to={`/admin/invoices?orderId=${order.id}`}
								className="p-1 text-indigo-600 hover:bg-indigo-100 rounded-md dark:text-indigo-400 dark:hover:bg-indigo-900"
								title="Ver factura"
							>
								<FileText size={18} />
							</Link>
						)}

						{/* Avanzar estado */}
						{canAdvance && (
							<button
								onClick={() => advanceOrderStatus(order.id || 0, order.status)}
								className="p-1 text-green-600 hover:bg-green-100 rounded-md dark:text-green-400 dark:hover:bg-green-900"
								title={`Avanzar a ${orderStatusMap[getNextStatus(order.status)]?.label || "siguiente estado"}`}
							>
								<CheckCircle size={18} />
							</button>
						)}

						{/* Cancelar pedido */}
						{canCancel && (
							<button
								onClick={() => cancelOrder(order.id || 0)}
								className="p-1 text-red-600 hover:bg-red-100 rounded-md dark:text-red-400 dark:hover:bg-red-900"
								title="Cancelar pedido"
							>
								<XCircle size={18} />
							</button>
						)}
					</div>
				);
			},
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Gestión de Pedidos
				</h1>
				<div className="flex space-x-2">
					<button
						onClick={refreshData}
						className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
					>
						<RefreshCw size={18} className="inline mr-2" />
						Actualizar
					</button>
				</div>
			</div>

			{/* Filtros */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Filtro de Estado */}
					<div className="flex flex-col space-y-1">
						<label className="text-sm text-gray-600 dark:text-gray-400">
							Estado del pedido
						</label>
						<div className="flex items-center">
							<Filter className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
							<select
								className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value)}
							>
								<option value="all">Todos los Estados</option>
								{Object.entries(orderStatusMap).map(([key, {label}]) => (
									<option key={key} value={key}>
										{label}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Filtro de Estado de Pago */}
					<div className="flex flex-col space-y-1">
						<label className="text-sm text-gray-600 dark:text-gray-400">
							Estado de pago
						</label>
						<select
							className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={paymentStatusFilter}
							onChange={(e) => setPaymentStatusFilter(e.target.value)}
						>
							<option value="all">Todos los Estados</option>
							{Object.entries(paymentStatusMap).map(([key, {label}]) => (
								<option key={key} value={key}>
									{label}
								</option>
							))}
						</select>
					</div>

					{/* Filtro de Vendedor */}
					<div className="flex flex-col space-y-1">
						<label className="text-sm text-gray-600 dark:text-gray-400">
							Vendedor
						</label>
						<select
							className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={sellerFilter === null ? "null" : sellerFilter}
							onChange={(e) =>
								setSellerFilter(
									e.target.value === "null" ? null : Number(e.target.value)
								)
							}
						>
							<option value="null">Todos los Vendedores</option>
							{uniqueSellers.map((sellerId) => (
								<option key={sellerId} value={sellerId}>
									Vendedor {sellerId}
								</option>
							))}
						</select>
					</div>

					{/* Filtro de Rango de Fechas */}
					<div className="flex flex-col space-y-1">
						<label className="text-sm text-gray-600 dark:text-gray-400">
							Rango de fechas
						</label>
						<div className="grid grid-cols-2 gap-2">
							<input
								type="date"
								className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
								value={dateRangeFilter.from}
								onChange={(e) =>
									setDateRangeFilter((prev) => ({
										...prev,
										from: e.target.value,
									}))
								}
								placeholder="Desde"
							/>
							<input
								type="date"
								className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
								value={dateRangeFilter.to}
								onChange={(e) =>
									setDateRangeFilter((prev) => ({...prev, to: e.target.value}))
								}
								placeholder="Hasta"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Tabla de Pedidos */}
			<Table
				data={filteredOrders}
				columns={columns}
				searchFields={["orderNumber", "shippingData"]}
				loading={loading}
				emptyMessage="No se encontraron pedidos"
				pagination={{
					currentPage: pagination.currentPage,
					totalPages: pagination.totalPages,
					totalItems: pagination.totalItems,
					itemsPerPage: pagination.itemsPerPage,
					onPageChange: handlePageChange,
				}}
			/>
		</div>
	);
};

export default AdminOrdersPage;
