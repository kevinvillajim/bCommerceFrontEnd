import React, {useState, useEffect} from "react";
import Table from "../../components/dashboard/Table";
import {
	Truck,
	Package,
	MapPin,
	User,
	ShoppingBag,
	Calendar,
	Eye,
	RefreshCw,
	Filter,
	Clock,
	CheckCircle,
	XCircle,
	AlertTriangle,
	ArrowRight,
	Share2,
	BarChart2,
} from "lucide-react";
import {Link} from "react-router-dom";

// Interfaz para el modelo de datos de envío
interface Shipping {
	id: number;
	trackingNumber: string;
	orderId: number;
	orderNumber: string;
	userId: number;
	customerName: string;
	status: ShippingStatus;
	carrier: string;
	estimatedDeliveryDate?: string;
	shippedDate?: string;
	deliveredDate?: string;
	address: {
		street: string;
		city: string;
		state: string;
		country: string;
		postalCode: string;
		phone: string;
	};
	weight?: number;
	dimensions?: string;
	trackingHistory: TrackingEvent[];
	createdAt: string;
	updatedAt: string;
}

// Estados posibles de un envío
type ShippingStatus =
	| "pending"
	| "processing"
	| "ready_to_ship"
	| "shipped"
	| "in_transit"
	| "out_for_delivery"
	| "delivered"
	| "failed_delivery"
	| "returned"
	| "cancelled";

// Eventos de seguimiento
interface TrackingEvent {
	id: number;
	status: string;
	location: string;
	timestamp: string;
	description: string;
}

// Datos simulados para envíos
const mockShippings: Shipping[] = [
	{
		id: 1,
		trackingNumber: "BCM-TRK-12345678",
		orderId: 1,
		orderNumber: "ORD-2023-001",
		userId: 101,
		customerName: "Juan Pérez",
		status: "delivered",
		carrier: "MRW",
		estimatedDeliveryDate: "2023-11-03T15:00:00Z",
		shippedDate: "2023-11-01T16:30:00Z",
		deliveredDate: "2023-11-03T10:15:00Z",
		address: {
			street: "Calle Principal 123",
			city: "Madrid",
			state: "Madrid",
			country: "España",
			postalCode: "28001",
			phone: "+34612345678",
		},
		weight: 3.2,
		dimensions: "40x30x15 cm",
		trackingHistory: [
			{
				id: 101,
				status: "processed",
				location: "Centro logístico Madrid",
				timestamp: "2023-11-01T14:30:00Z",
				description: "Paquete procesado en el centro logístico",
			},
			{
				id: 102,
				status: "shipped",
				location: "Centro logístico Madrid",
				timestamp: "2023-11-01T16:30:00Z",
				description: "Paquete enviado",
			},
			{
				id: 103,
				status: "in_transit",
				location: "Centro de distribución Madrid",
				timestamp: "2023-11-02T09:45:00Z",
				description: "Paquete en tránsito",
			},
			{
				id: 104,
				status: "out_for_delivery",
				location: "Centro de distribución local Madrid",
				timestamp: "2023-11-03T08:20:00Z",
				description: "Paquete en reparto",
			},
			{
				id: 105,
				status: "delivered",
				location: "Madrid",
				timestamp: "2023-11-03T10:15:00Z",
				description: "Paquete entregado",
			},
		],
		createdAt: "2023-11-01T14:30:00Z",
		updatedAt: "2023-11-03T10:15:00Z",
	},
	{
		id: 2,
		trackingNumber: "BCM-TRK-23456789",
		orderId: 2,
		orderNumber: "ORD-2023-002",
		userId: 102,
		customerName: "María Rodríguez",
		status: "in_transit",
		carrier: "SEUR",
		estimatedDeliveryDate: "2023-11-06T17:00:00Z",
		shippedDate: "2023-11-04T15:20:00Z",
		deliveredDate: undefined,
		address: {
			street: "Avenida Central 456",
			city: "Barcelona",
			state: "Cataluña",
			country: "España",
			postalCode: "08001",
			phone: "+34698765432",
		},
		weight: 1.5,
		dimensions: "25x20x10 cm",
		trackingHistory: [
			{
				id: 201,
				status: "processed",
				location: "Centro logístico Barcelona",
				timestamp: "2023-11-04T13:10:00Z",
				description: "Paquete procesado en el centro logístico",
			},
			{
				id: 202,
				status: "shipped",
				location: "Centro logístico Barcelona",
				timestamp: "2023-11-04T15:20:00Z",
				description: "Paquete enviado",
			},
			{
				id: 203,
				status: "in_transit",
				location: "Centro de distribución regional",
				timestamp: "2023-11-05T08:45:00Z",
				description: "Paquete en tránsito",
			},
		],
		createdAt: "2023-11-04T13:10:00Z",
		updatedAt: "2023-11-05T08:45:00Z",
	},
	{
		id: 3,
		trackingNumber: "BCM-TRK-34567890",
		orderId: 3,
		orderNumber: "ORD-2023-003",
		userId: 103,
		customerName: "Carlos Sánchez",
		status: "processing",
		carrier: "Correos Express",
		estimatedDeliveryDate: "2023-11-07T14:00:00Z",
		shippedDate: undefined,
		deliveredDate: undefined,
		address: {
			street: "Plaza Mayor 789",
			city: "Valencia",
			state: "Comunidad Valenciana",
			country: "España",
			postalCode: "46001",
			phone: "+34623456789",
		},
		weight: 0.8,
		dimensions: "15x10x5 cm",
		trackingHistory: [
			{
				id: 301,
				status: "order_received",
				location: "Sistema",
				timestamp: "2023-11-03T16:20:00Z",
				description: "Pedido recibido",
			},
			{
				id: 302,
				status: "processing",
				location: "Centro logístico Valencia",
				timestamp: "2023-11-04T10:30:00Z",
				description: "Pedido en preparación",
			},
		],
		createdAt: "2023-11-03T16:20:00Z",
		updatedAt: "2023-11-04T10:30:00Z",
	},
	{
		id: 4,
		trackingNumber: "BCM-TRK-45678901",
		orderId: 4,
		orderNumber: "ORD-2023-004",
		userId: 104,
		customerName: "Ana Martínez",
		status: "cancelled",
		carrier: "MRW",
		estimatedDeliveryDate: undefined,
		shippedDate: undefined,
		deliveredDate: undefined,
		address: {
			street: "Calle Secundaria 321",
			city: "Sevilla",
			state: "Andalucía",
			country: "España",
			postalCode: "41001",
			phone: "+34634567890",
		},
		weight: 2.3,
		dimensions: "30x25x15 cm",
		trackingHistory: [
			{
				id: 401,
				status: "order_received",
				location: "Sistema",
				timestamp: "2023-11-04T11:10:00Z",
				description: "Pedido recibido",
			},
			{
				id: 402,
				status: "processing",
				location: "Centro logístico Sevilla",
				timestamp: "2023-11-04T14:20:00Z",
				description: "Pedido en preparación",
			},
			{
				id: 403,
				status: "cancelled",
				location: "Sistema",
				timestamp: "2023-11-05T09:30:00Z",
				description: "Pedido cancelado",
			},
		],
		createdAt: "2023-11-04T11:10:00Z",
		updatedAt: "2023-11-05T09:30:00Z",
	},
	{
		id: 5,
		trackingNumber: "BCM-TRK-56789012",
		orderId: 6,
		orderNumber: "ORD-2023-006",
		userId: 106,
		customerName: "Lucía Fernández",
		status: "delivered",
		carrier: "DHL",
		estimatedDeliveryDate: "2023-11-02T16:00:00Z",
		shippedDate: "2023-10-30T13:15:00Z",
		deliveredDate: "2023-11-02T13:40:00Z",
		address: {
			street: "Calle Nueva 654",
			city: "Zaragoza",
			state: "Aragón",
			country: "España",
			postalCode: "50001",
			phone: "+34656789012",
		},
		weight: 1.2,
		dimensions: "20x15x10 cm",
		trackingHistory: [
			{
				id: 501,
				status: "processed",
				location: "Centro logístico Zaragoza",
				timestamp: "2023-10-30T11:30:00Z",
				description: "Paquete procesado en el centro logístico",
			},
			{
				id: 502,
				status: "shipped",
				location: "Centro logístico Zaragoza",
				timestamp: "2023-10-30T13:15:00Z",
				description: "Paquete enviado",
			},
			{
				id: 503,
				status: "in_transit",
				location: "Centro de distribución regional",
				timestamp: "2023-10-31T09:20:00Z",
				description: "Paquete en tránsito",
			},
			{
				id: 504,
				status: "in_transit",
				location: "Centro de distribución local Zaragoza",
				timestamp: "2023-11-01T14:45:00Z",
				description: "Paquete en centro local",
			},
			{
				id: 505,
				status: "out_for_delivery",
				location: "Zaragoza",
				timestamp: "2023-11-02T09:10:00Z",
				description: "Paquete en reparto",
			},
			{
				id: 506,
				status: "delivered",
				location: "Zaragoza",
				timestamp: "2023-11-02T13:40:00Z",
				description: "Paquete entregado",
			},
		],
		createdAt: "2023-10-30T11:30:00Z",
		updatedAt: "2023-11-02T13:40:00Z",
	},
	{
		id: 6,
		trackingNumber: "BCM-TRK-67890123",
		orderId: 7,
		orderNumber: "ORD-2023-007",
		userId: 107,
		customerName: "David López",
		status: "ready_to_ship",
		carrier: "SEUR",
		estimatedDeliveryDate: "2023-11-08T17:00:00Z",
		shippedDate: undefined,
		deliveredDate: undefined,
		address: {
			street: "Recogida en tienda",
			city: "Málaga",
			state: "Andalucía",
			country: "España",
			postalCode: "29001",
			phone: "+34667890123",
		},
		weight: 0.5,
		dimensions: "12x8x3 cm",
		trackingHistory: [
			{
				id: 601,
				status: "order_received",
				location: "Sistema",
				timestamp: "2023-11-01T17:15:00Z",
				description: "Pedido recibido",
			},
			{
				id: 602,
				status: "processing",
				location: "Centro logístico Málaga",
				timestamp: "2023-11-02T10:45:00Z",
				description: "Pedido en preparación",
			},
			{
				id: 603,
				status: "ready_to_ship",
				location: "Centro logístico Málaga",
				timestamp: "2023-11-03T15:50:00Z",
				description: "Pedido listo para enviar",
			},
		],
		createdAt: "2023-11-01T17:15:00Z",
		updatedAt: "2023-11-03T15:50:00Z",
	},
	{
		id: 7,
		trackingNumber: "BCM-TRK-78901234",
		orderId: 8,
		orderNumber: "ORD-2023-008",
		userId: 108,
		customerName: "Elena Gómez",
		status: "processing",
		carrier: "Correos Express",
		estimatedDeliveryDate: "2023-11-09T14:00:00Z",
		shippedDate: undefined,
		deliveredDate: undefined,
		address: {
			street: "Avenida del Mar 321",
			city: "Alicante",
			state: "Comunidad Valenciana",
			country: "España",
			postalCode: "03001",
			phone: "+34678901234",
		},
		weight: 1.8,
		dimensions: "25x20x15 cm",
		trackingHistory: [
			{
				id: 701,
				status: "order_received",
				location: "Sistema",
				timestamp: "2023-11-05T12:30:00Z",
				description: "Pedido recibido",
			},
			{
				id: 702,
				status: "processing",
				location: "Centro logístico Alicante",
				timestamp: "2023-11-05T15:45:00Z",
				description: "Pedido en preparación",
			},
		],
		createdAt: "2023-11-05T12:30:00Z",
		updatedAt: "2023-11-05T15:45:00Z",
	},
	{
		id: 8,
		trackingNumber: "BCM-TRK-89012345",
		orderId: 9,
		orderNumber: "ORD-2023-009",
		userId: 109,
		customerName: "Miguel Torres",
		status: "returned",
		carrier: "DHL",
		estimatedDeliveryDate: "2023-10-31T16:00:00Z",
		shippedDate: "2023-10-29T11:30:00Z",
		deliveredDate: "2023-10-31T13:15:00Z",
		address: {
			street: "Plaza Central 456",
			city: "Murcia",
			state: "Región de Murcia",
			country: "España",
			postalCode: "30001",
			phone: "+34689012345",
		},
		weight: 1.1,
		dimensions: "18x15x10 cm",
		trackingHistory: [
			{
				id: 801,
				status: "processed",
				location: "Centro logístico Murcia",
				timestamp: "2023-10-29T09:20:00Z",
				description: "Paquete procesado en el centro logístico",
			},
			{
				id: 802,
				status: "shipped",
				location: "Centro logístico Murcia",
				timestamp: "2023-10-29T11:30:00Z",
				description: "Paquete enviado",
			},
			{
				id: 803,
				status: "in_transit",
				location: "Centro de distribución regional",
				timestamp: "2023-10-30T10:15:00Z",
				description: "Paquete en tránsito",
			},
			{
				id: 804,
				status: "out_for_delivery",
				location: "Murcia",
				timestamp: "2023-10-31T08:45:00Z",
				description: "Paquete en reparto",
			},
			{
				id: 805,
				status: "delivered",
				location: "Murcia",
				timestamp: "2023-10-31T13:15:00Z",
				description: "Paquete entregado",
			},
			{
				id: 806,
				status: "return_requested",
				location: "Murcia",
				timestamp: "2023-11-02T16:30:00Z",
				description: "Solicitud de devolución",
			},
			{
				id: 807,
				status: "return_in_transit",
				location: "Murcia",
				timestamp: "2023-11-03T11:45:00Z",
				description: "Paquete en devolución recogido",
			},
			{
				id: 808,
				status: "returned",
				location: "Centro logístico Murcia",
				timestamp: "2023-11-04T16:45:00Z",
				description: "Paquete devuelto al almacén",
			},
		],
		createdAt: "2023-10-28T09:20:00Z",
		updatedAt: "2023-11-04T16:45:00Z",
	},
	{
		id: 9,
		trackingNumber: "BCM-TRK-90123456",
		orderId: 10,
		orderNumber: "ORD-2023-010",
		userId: 110,
		customerName: "Carmen Navarro",
		status: "delivered",
		carrier: "MRW",
		estimatedDeliveryDate: "2023-10-28T15:00:00Z",
		shippedDate: "2023-10-26T14:20:00Z",
		deliveredDate: "2023-10-28T11:15:00Z",
		address: {
			street: "Calle Mayor 789",
			city: "Las Palmas",
			state: "Canarias",
			country: "España",
			postalCode: "35001",
			phone: "+34690123456",
		},
		weight: 2.5,
		dimensions: "30x25x15 cm",
		trackingHistory: [
			{
				id: 901,
				status: "processed",
				location: "Centro logístico Las Palmas",
				timestamp: "2023-10-26T12:30:00Z",
				description: "Paquete procesado en el centro logístico",
			},
			{
				id: 902,
				status: "shipped",
				location: "Centro logístico Las Palmas",
				timestamp: "2023-10-26T14:20:00Z",
				description: "Paquete enviado",
			},
			{
				id: 903,
				status: "in_transit",
				location: "Centro de distribución regional",
				timestamp: "2023-10-27T10:45:00Z",
				description: "Paquete en tránsito",
			},
			{
				id: 904,
				status: "out_for_delivery",
				location: "Las Palmas",
				timestamp: "2023-10-28T08:30:00Z",
				description: "Paquete en reparto",
			},
			{
				id: 905,
				status: "delivered",
				location: "Las Palmas",
				timestamp: "2023-10-28T11:15:00Z",
				description: "Paquete entregado",
			},
		],
		createdAt: "2023-10-26T12:30:00Z",
		updatedAt: "2023-10-28T11:15:00Z",
	},
	{
		id: 10,
		trackingNumber: "BCM-TRK-01234567",
		orderId: 5,
		orderNumber: "ORD-2023-005",
		userId: 105,
		customerName: "Javier García",
		status: "failed_delivery",
		carrier: "SEUR",
		estimatedDeliveryDate: "2023-11-07T16:00:00Z",
		shippedDate: "2023-11-05T16:30:00Z",
		deliveredDate: undefined,
		address: {
			street: "Avenida Principal 987",
			city: "Bilbao",
			state: "País Vasco",
			country: "España",
			postalCode: "48001",
			phone: "+34645678901",
		},
		weight: 3.5,
		dimensions: "40x30x20 cm",
		trackingHistory: [
			{
				id: 1001,
				status: "processed",
				location: "Centro logístico Bilbao",
				timestamp: "2023-11-05T14:45:00Z",
				description: "Paquete procesado en el centro logístico",
			},
			{
				id: 1002,
				status: "shipped",
				location: "Centro logístico Bilbao",
				timestamp: "2023-11-05T16:30:00Z",
				description: "Paquete enviado",
			},
			{
				id: 1003,
				status: "in_transit",
				location: "Centro de distribución regional",
				timestamp: "2023-11-06T09:15:00Z",
				description: "Paquete en tránsito",
			},
			{
				id: 1004,
				status: "out_for_delivery",
				location: "Bilbao",
				timestamp: "2023-11-07T08:30:00Z",
				description: "Paquete en reparto",
			},
			{
				id: 1005,
				status: "failed_delivery",
				location: "Bilbao",
				timestamp: "2023-11-07T14:45:00Z",
				description: "Intento de entrega fallido. Destinatario ausente.",
			},
		],
		createdAt: "2023-11-05T14:45:00Z",
		updatedAt: "2023-11-07T14:45:00Z",
	},
];

// Mapeo de estado para los envíos
const shippingStatusMap: Record<
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
		label: "En preparación",
		color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
		icon: <Package className="w-3 h-3 mr-1" />,
	},
	ready_to_ship: {
		label: "Listo para enviar",
		color:
			"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
		icon: <Package className="w-3 h-3 mr-1" />,
	},
	shipped: {
		label: "Enviado",
		color:
			"bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
		icon: <Truck className="w-3 h-3 mr-1" />,
	},
	in_transit: {
		label: "En tránsito",
		color:
			"bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
		icon: <Truck className="w-3 h-3 mr-1" />,
	},
	out_for_delivery: {
		label: "En reparto",
		color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
		icon: <Truck className="w-3 h-3 mr-1" />,
	},
	delivered: {
		label: "Entregado",
		color:
			"bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
		icon: <CheckCircle className="w-3 h-3 mr-1" />,
	},
	failed_delivery: {
		label: "Entrega fallida",
		color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
		icon: <AlertTriangle className="w-3 h-3 mr-1" />,
	},
	returned: {
		label: "Devuelto",
		color:
			"bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
		icon: <ArrowRight className="w-3 h-3 mr-1 transform rotate-180" />,
	},
	cancelled: {
		label: "Cancelado",
		color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
		icon: <XCircle className="w-3 h-3 mr-1" />,
	},
};

// Carriers disponibles
const carriers = [
	{id: "MRW", name: "MRW"},
	{id: "SEUR", name: "SEUR"},
	{id: "Correos Express", name: "Correos Express"},
	{id: "DHL", name: "DHL"},
	{id: "FedEx", name: "FedEx"},
	{id: "UPS", name: "UPS"},
	{id: "GLS", name: "GLS"},
];

const AdminShippingPage: React.FC = () => {
	const [shippings, setShippings] = useState<Shipping[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [carrierFilter, setCarrierFilter] = useState<string>("all");
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
	const [selectedShipping, setSelectedShipping] = useState<Shipping | null>(
		null
	);
	const [showTrackingModal, setShowTrackingModal] = useState(false);

	// Cargar datos de envíos
	useEffect(() => {
		const fetchShippings = () => {
			setLoading(true);
			// Simulación de llamada a API
			setTimeout(() => {
				setShippings(mockShippings);
				setPagination({
					currentPage: 1,
					totalPages: 1,
					totalItems: mockShippings.length,
					itemsPerPage: 10,
				});
				setLoading(false);
			}, 500);
		};

		fetchShippings();
	}, []);

	// Filtrar envíos
	const filteredShippings = shippings.filter((shipping) => {
		// Filtro por estado
		const matchesStatus =
			statusFilter === "all" || shipping.status === statusFilter;

		// Filtro por transportista
		const matchesCarrier =
			carrierFilter === "all" || shipping.carrier === carrierFilter;

		// Filtro por rango de fechas (usamos createdAt)
		let matchesDateRange = true;
		if (dateRangeFilter.from) {
			const shippingDate = new Date(shipping.createdAt || "");
			const fromDate = new Date(dateRangeFilter.from);
			matchesDateRange = shippingDate >= fromDate;
		}
		if (dateRangeFilter.to && matchesDateRange) {
			const shippingDate = new Date(shipping.createdAt || "");
			const toDate = new Date(dateRangeFilter.to);
			// Ajustar a final del día
			toDate.setHours(23, 59, 59, 999);
			matchesDateRange = shippingDate <= toDate;
		}

		return matchesStatus && matchesCarrier && matchesDateRange;
	});

	// Obtener siguiente estado del envío
	const getNextStatus = (currentStatus: ShippingStatus): ShippingStatus => {
		const statusFlow: Record<ShippingStatus, ShippingStatus> = {
			pending: "processing",
			processing: "ready_to_ship",
			ready_to_ship: "shipped",
			shipped: "in_transit",
			in_transit: "out_for_delivery",
			out_for_delivery: "delivered",
			delivered: "delivered", // Final state
			failed_delivery: "out_for_delivery", // Retry delivery
			returned: "returned", // Final state
			cancelled: "cancelled", // Final state
		};

		return statusFlow[currentStatus] || currentStatus;
	};

	// Actualizar estado del envío
	const updateShippingStatus = (
		shippingId: number,
		newStatus: ShippingStatus
	) => {
		setShippings((prevShippings) =>
			prevShippings.map((shipping) => {
				if (shipping.id === shippingId) {
					const now = new Date().toISOString();
					const updatedShipping = {
						...shipping,
						status: newStatus,
						updatedAt: now,
					};

					// Actualizar fechas específicas según el estado
					if (newStatus === "shipped" && !updatedShipping.shippedDate) {
						updatedShipping.shippedDate = now;
					} else if (
						newStatus === "delivered" &&
						!updatedShipping.deliveredDate
					) {
						updatedShipping.deliveredDate = now;
					}

					// Añadir nuevo evento de seguimiento
					const newEvent: TrackingEvent = {
						id:
							shipping.trackingHistory.length > 0
								? Math.max(...shipping.trackingHistory.map((e) => e.id)) + 1
								: 1,
						status: newStatus,
						location: "Centro logístico",
						timestamp: now,
						description: `Estado actualizado a: ${shippingStatusMap[newStatus]?.label || newStatus}`,
					};

					updatedShipping.trackingHistory = [
						...shipping.trackingHistory,
						newEvent,
					];

					return updatedShipping;
				}
				return shipping;
			})
		);
	};

	// Avanzar al siguiente estado
	const advanceShippingStatus = (
		shippingId: number,
		currentStatus: ShippingStatus
	) => {
		const nextStatus = getNextStatus(currentStatus);
		if (nextStatus !== currentStatus) {
			updateShippingStatus(shippingId, nextStatus);
		}
	};

	// Abrir modal de seguimiento
	const openTrackingModal = (shipping: Shipping) => {
		setSelectedShipping(shipping);
		setShowTrackingModal(true);
	};

	// Cerrar modal de seguimiento
	const closeTrackingModal = () => {
		setSelectedShipping(null);
		setShowTrackingModal(false);
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

	// Simular envío de notificación de seguimiento
	const sendTrackingNotification = (trackingNumber: string) => {
		alert(
			`Se ha enviado la notificación de seguimiento para el envío ${trackingNumber}`
		);
	};

	// Definir columnas de la tabla
	const columns = [
		{
			key: "tracking",
			header: "Seguimiento",
			sortable: true,
			render: (shipping: Shipping) => (
				<div className="flex items-center">
					<div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center">
						<Truck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
					</div>
					<div className="ml-4">
						<div className="text-sm font-medium text-gray-900 dark:text-white">
							{shipping.trackingNumber}
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
							<Calendar className="w-3 h-3 mr-1" />
							{formatDate(shipping.createdAt)}
						</div>
					</div>
				</div>
			),
		},
		{
			key: "order",
			header: "Pedido",
			sortable: true,
			render: (shipping: Shipping) => (
				<div className="flex items-center">
					<ShoppingBag className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
					<Link
						to={`/admin/orders/${shipping.orderId}`}
						className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
					>
						{shipping.orderNumber}
					</Link>
				</div>
			),
		},
		{
			key: "customer",
			header: "Cliente",
			sortable: true,
			render: (shipping: Shipping) => (
				<div className="flex items-center">
					<div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
						<User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
					</div>
					<div className="ml-3">
						<div className="text-sm font-medium text-gray-900 dark:text-white">
							{shipping.customerName}
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-400">
							ID: {shipping.userId}
						</div>
					</div>
				</div>
			),
		},
		{
			key: "address",
			header: "Dirección",
			render: (shipping: Shipping) => (
				<div className="flex items-start">
					<MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1 mt-0.5 flex-shrink-0" />
					<div className="text-xs text-gray-600 dark:text-gray-400">
						<div>{shipping.address.street}</div>
						<div>
							{shipping.address.city}, {shipping.address.state}
						</div>
						<div>
							{shipping.address.postalCode}, {shipping.address.country}
						</div>
					</div>
				</div>
			),
		},
		{
			key: "carrier",
			header: "Transportista",
			sortable: true,
			render: (shipping: Shipping) => (
				<div className="text-sm font-medium">{shipping.carrier}</div>
			),
		},
		{
			key: "status",
			header: "Estado",
			sortable: true,
			render: (shipping: Shipping) => {
				const status = shippingStatusMap[shipping.status] || {
					label: shipping.status,
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
			key: "dates",
			header: "Fechas clave",
			render: (shipping: Shipping) => (
				<div className="text-xs text-gray-600 dark:text-gray-400">
					{shipping.shippedDate && (
						<div className="mb-1">
							<span className="font-medium">Envío:</span>{" "}
							{formatDate(shipping.shippedDate)}
						</div>
					)}
					{shipping.estimatedDeliveryDate && (
						<div className="mb-1">
							<span className="font-medium">Est. entrega:</span>{" "}
							{formatDate(shipping.estimatedDeliveryDate)}
						</div>
					)}
					{shipping.deliveredDate && (
						<div>
							<span className="font-medium">Entregado:</span>{" "}
							{formatDate(shipping.deliveredDate)}
						</div>
					)}
				</div>
			),
		},
		{
			key: "actions",
			header: "Acciones",
			render: (shipping: Shipping) => {
				const canAdvance = [
					"pending",
					"processing",
					"ready_to_ship",
					"shipped",
					"in_transit",
					"out_for_delivery",
					"failed_delivery",
				].includes(shipping.status);

				return (
					<div className="flex justify-end space-x-2">
						{/* Ver detalles */}
						<button
							onClick={() => openTrackingModal(shipping)}
							className="p-1 text-blue-600 hover:bg-blue-100 rounded-md dark:text-blue-400 dark:hover:bg-blue-900"
							title="Ver seguimiento"
						>
							<Eye size={18} />
						</button>

						{/* Ver pedido */}
						<Link
							to={`/admin/orders/${shipping.orderId}`}
							className="p-1 text-purple-600 hover:bg-purple-100 rounded-md dark:text-purple-400 dark:hover:bg-purple-900"
							title="Ver pedido"
						>
							<ShoppingBag size={18} />
						</Link>

						{/* Enviar notificación */}
						<button
							onClick={() => sendTrackingNotification(shipping.trackingNumber)}
							className="p-1 text-indigo-600 hover:bg-indigo-100 rounded-md dark:text-indigo-400 dark:hover:bg-indigo-900"
							title="Enviar notificación"
						>
							<Share2 size={18} />
						</button>

						{/* Avanzar estado */}
						{canAdvance && (
							<button
								onClick={() =>
									advanceShippingStatus(shipping.id, shipping.status)
								}
								className="p-1 text-green-600 hover:bg-green-100 rounded-md dark:text-green-400 dark:hover:bg-green-900"
								title={`Avanzar a ${shippingStatusMap[getNextStatus(shipping.status)]?.label || "siguiente estado"}`}
							>
								<ArrowRight size={18} />
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
					Gestión de Envíos
				</h1>
				<div className="flex space-x-2">
					<Link
						to="/admin/shipping/dashboard"
						className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
					>
						<BarChart2 size={18} className="inline mr-2" />
						Dashboard Envíos
					</Link>
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
							Estado del envío
						</label>
						<div className="flex items-center">
							<Filter className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
							<select
								className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value)}
							>
								<option value="all">Todos los Estados</option>
								{Object.entries(shippingStatusMap).map(([key, {label}]) => (
									<option key={key} value={key}>
										{label}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Filtro de Transportista */}
					<div className="flex flex-col space-y-1">
						<label className="text-sm text-gray-600 dark:text-gray-400">
							Transportista
						</label>
						<select
							className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={carrierFilter}
							onChange={(e) => setCarrierFilter(e.target.value)}
						>
							<option value="all">Todos los Transportistas</option>
							{carriers.map((carrier) => (
								<option key={carrier.id} value={carrier.id}>
									{carrier.name}
								</option>
							))}
						</select>
					</div>

					{/* Filtro de Rango de Fechas */}
					<div className="flex flex-col space-y-1 lg:col-span-2">
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

			{/* Tabla de Envíos */}
			<Table
				data={filteredShippings}
				columns={columns}
				searchFields={["trackingNumber", "orderNumber", "customerName"]}
				loading={loading}
				emptyMessage="No se encontraron envíos"
				pagination={{
					currentPage: pagination.currentPage,
					totalPages: pagination.totalPages,
					totalItems: pagination.totalItems,
					itemsPerPage: pagination.itemsPerPage,
					onPageChange: handlePageChange,
				}}
			/>

			{/* Modal de Seguimiento */}
			{showTrackingModal && selectedShipping && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-bold text-gray-900 dark:text-white">
									Seguimiento de Envío: {selectedShipping.trackingNumber}
								</h2>
								<button
									onClick={closeTrackingModal}
									className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
								>
									<XCircle size={24} />
								</button>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
								{/* Información del envío */}
								<div>
									<h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
										Información del envío
									</h3>
									<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
										<div className="grid grid-cols-2 gap-4">
											<div>
												<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
													Pedido
												</p>
												<p className="text-white text-sm font-medium">
													{selectedShipping.orderNumber}
												</p>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
													Transportista
												</p>
												<p className="text-white text-sm font-medium">
													{selectedShipping.carrier}
												</p>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
													Estado
												</p>
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${shippingStatusMap[selectedShipping.status]?.color}`}
												>
													{shippingStatusMap[selectedShipping.status]?.icon}
													{shippingStatusMap[selectedShipping.status]?.label ||
														selectedShipping.status}
												</span>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
													Fecha de creación
												</p>
												<p className="text-white text-sm font-medium">
													{formatDate(selectedShipping.createdAt)}
												</p>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
													Peso
												</p>
												<p className="text-white text-sm font-medium">
													{selectedShipping.weight || "N/A"} kg
												</p>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
													Dimensiones
												</p>
												<p className="text-white text-sm font-medium">
													{selectedShipping.dimensions || "N/A"}
												</p>
											</div>
										</div>
									</div>
								</div>

								{/* Dirección de entrega */}
								<div>
									<h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
										Dirección de entrega
									</h3>
									<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
										<p className="text-white text-sm font-medium mb-1">
											{selectedShipping.customerName}
										</p>
										<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
											{selectedShipping.address.street}
										</p>
										<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
											{selectedShipping.address.city},{" "}
											{selectedShipping.address.state}
										</p>
										<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
											{selectedShipping.address.postalCode},{" "}
											{selectedShipping.address.country}
										</p>
										<p className="text-sm text-gray-600 dark:text-gray-400">
											Teléfono: {selectedShipping.address.phone}
										</p>
									</div>
								</div>
							</div>

							{/* Historial de seguimiento */}
							<div>
								<h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
									Historial de seguimiento
								</h3>
								<div className="relative">
									<div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700"></div>
									<ul className="space-y-4">
										{[...selectedShipping.trackingHistory]
											.reverse()
											.map((event) => (
												<li key={event.id} className="relative pl-12">
													<div className="absolute left-4 w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400 ring-4 ring-white dark:ring-gray-800 z-10"></div>
													<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
														<div className="flex justify-between items-start mb-1">
															<p className="text-sm font-medium text-gray-900 dark:text-white">
																{event.status === "shipped" && (
																	<Truck className="inline w-4 h-4 mr-1" />
																)}
																{event.status === "delivered" && (
																	<CheckCircle className="inline w-4 h-4 mr-1" />
																)}
																{event.status === "failed_delivery" && (
																	<AlertTriangle className="inline w-4 h-4 mr-1" />
																)}
																{event.description}
															</p>
															<p className="text-xs text-gray-500 dark:text-gray-400">
																{formatDate(event.timestamp)}
															</p>
														</div>
														<p className="text-sm text-gray-600 dark:text-gray-400">
															Ubicación: {event.location}
														</p>
													</div>
												</li>
											))}
									</ul>
								</div>
							</div>

							{/* Botones de acción */}
							<div className="mt-6 flex justify-end space-x-4">
								<button
									onClick={() =>
										sendTrackingNotification(selectedShipping.trackingNumber)
									}
									className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
								>
									<Share2 size={18} className="inline mr-2" />
									Enviar notificación
								</button>
								<button
									onClick={closeTrackingModal}
									className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
								>
									Cerrar
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminShippingPage;
