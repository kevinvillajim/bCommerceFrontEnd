import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  Truck,
  Package,
  BarChart2
} from "lucide-react";
import Table from "../../components/dashboard/Table";
import { formatCurrency } from "../../../utils/formatters/formatCurrency";
import {SellerStatCardList} from "../../components/dashboard/SellerStatCardList";

// Tipos para pedidos
interface OrderItem {
  id: number;
  productId: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customer: {
    id: number;
    name: string;
    email: string;
  };
  total: number;
  items: OrderItem[];
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "rejected";
  shippingAddress: string;
  notes?: string;
}

// Datos simulados de pedidos
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-20231105-001",
    date: "2023-11-05T14:30:00Z",
    customer: {
      id: 101,
      name: "Juan Pérez",
      email: "juan.perez@example.com",
    },
    total: 129.99,
    items: [
      {
        id: 1,
        productId: 201,
        name: "Auriculares Bluetooth",
        quantity: 1,
        price: 79.99,
        subtotal: 79.99,
      },
      {
        id: 2,
        productId: 202,
        name: "Cargador USB-C",
        quantity: 2,
        price: 25.00,
        subtotal: 50.00,
      },
    ],
    status: "processing",
    paymentStatus: "paid",
    shippingAddress: "Calle Principal 123, Madrid, España",
  },
  {
    id: "2",
    orderNumber: "ORD-20231104-002",
    date: "2023-11-04T10:15:00Z",
    customer: {
      id: 102,
      name: "María García",
      email: "maria.garcia@example.com",
    },
    total: 249.50,
    items: [
      {
        id: 3,
        productId: 203,
        name: "Smartwatch",
        quantity: 1,
        price: 199.50,
        subtotal: 199.50,
      },
      {
        id: 4,
        productId: 204,
        name: "Protector de pantalla",
        quantity: 2,
        price: 25.00,
        subtotal: 50.00,
      },
    ],
    status: "pending",
    paymentStatus: "pending",
    shippingAddress: "Avenida Central 45, Barcelona, España",
  },
  {
    id: "3",
    orderNumber: "ORD-20231103-003",
    date: "2023-11-03T16:45:00Z",
    customer: {
      id: 103,
      name: "Carlos Rodríguez",
      email: "carlos.rodriguez@example.com",
    },
    total: 89.95,
    items: [
      {
        id: 5,
        productId: 205,
        name: "Funda de móvil",
        quantity: 1,
        price: 19.95,
        subtotal: 19.95,
      },
      {
        id: 6,
        productId: 206,
        name: "Altavoz portátil",
        quantity: 1,
        price: 70.00,
        subtotal: 70.00,
      },
    ],
    status: "shipped",
    paymentStatus: "paid",
    shippingAddress: "Plaza Mayor 8, Valencia, España",
  },
  {
    id: "4",
    orderNumber: "ORD-20231102-004",
    date: "2023-11-02T09:20:00Z",
    customer: {
      id: 104,
      name: "Ana Martínez",
      email: "ana.martinez@example.com",
    },
    total: 349.99,
    items: [
      {
        id: 7,
        productId: 207,
        name: "Tablet Android",
        quantity: 1,
        price: 349.99,
        subtotal: 349.99,
      },
    ],
    status: "delivered",
    paymentStatus: "paid",
    shippingAddress: "Calle Secundaria 78, Sevilla, España",
  },
  {
    id: "5",
    orderNumber: "ORD-20231101-005",
    date: "2023-11-01T13:10:00Z",
    customer: {
      id: 105,
      name: "Pablo López",
      email: "pablo.lopez@example.com",
    },
    total: 45.50,
    items: [
      {
        id: 8,
        productId: 208,
        name: "Soporte para teléfono",
        quantity: 1,
        price: 15.50,
        subtotal: 15.50,
      },
      {
        id: 9,
        productId: 209,
        name: "Cable HDMI",
        quantity: 1,
        price: 30.00,
        subtotal: 30.00,
      },
    ],
    status: "cancelled",
    paymentStatus: "rejected",
    shippingAddress: "Avenida Principal 34, Zaragoza, España",
  },
  {
    id: "6",
    orderNumber: "ORD-20231031-006",
    date: "2023-10-31T17:30:00Z",
    customer: {
      id: 106,
      name: "Elena Sánchez",
      email: "elena.sanchez@example.com",
    },
    total: 199.00,
    items: [
      {
        id: 10,
        productId: 210,
        name: "Impresora láser",
        quantity: 1,
        price: 199.00,
        subtotal: 199.00,
      },
    ],
    status: "delivered",
    paymentStatus: "paid",
    shippingAddress: "Calle Nueva 56, Málaga, España",
  },
  {
    id: "7",
    orderNumber: "ORD-20231030-007",
    date: "2023-10-30T11:45:00Z",
    customer: {
      id: 107,
      name: "Roberto Fernández",
      email: "roberto.fernandez@example.com",
    },
    total: 79.99,
    items: [
      {
        id: 11,
        productId: 211,
        name: "Teclado inalámbrico",
        quantity: 1,
        price: 49.99,
        subtotal: 49.99,
      },
      {
        id: 12,
        productId: 212,
        name: "Ratón óptico",
        quantity: 1,
        price: 30.00,
        subtotal: 30.00,
      },
    ],
    status: "processing",
    paymentStatus: "paid",
    shippingAddress: "Avenida Central 23, Bilbao, España",
  },
];

const SellerOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
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
          totalPages: Math.ceil(mockOrders.length / 10),
          totalItems: mockOrders.length,
          itemsPerPage: 10,
        });
        setLoading(false);
      }, 600);
    };

    fetchOrders();
  }, []);

  // Filtrar pedidos
  const filteredOrders = orders.filter((order) => {
    // Filtrar por estado
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    // Filtrar por estado de pago
    const matchesPayment =
      paymentFilter === "all" || order.paymentStatus === paymentFilter;

    // Filtrar por fecha (simulado, en una app real usaríamos fechas reales)
    const matchesDate = dateFilter === "all"; // Por ahora ignoramos el filtro de fecha

    // Filtrar por término de búsqueda
    const matchesSearch =
      searchTerm === "" ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPayment && matchesDate && matchesSearch;
  });

  // Actualizar estado de un pedido
  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      })
    );
  };

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    // En una app real, aquí obtendríamos los datos para la nueva página
  };

  // Refrescar datos
  const refreshData = () => {
    setLoading(true);
    // Simular recarga de datos
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // Definir las columnas de la tabla
  const columns = [
    {
      key: "orderNumber",
      header: "Número de Pedido",
      sortable: true,
      render: (order: Order) => (
        <Link
          to={`/seller/orders/${order.id}`}
          className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
        >
          {order.orderNumber}
        </Link>
      ),
    },
    {
      key: "date",
      header: "Fecha",
      sortable: true,
      render: (order: Order) => {
        const date = new Date(order.date);
        return (
          <span>
            {date.toLocaleDateString("es-ES")} {date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
          </span>
        );
      },
    },
    {
      key: "customer",
      header: "Cliente",
      sortable: true,
      render: (order: Order) => (
        <div>
          <div className="font-medium">{order.customer.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {order.customer.email}
          </div>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      render: (order: Order) => (
        <span className="font-medium">{formatCurrency(order.total)}</span>
      ),
    },
    {
      key: "items",
      header: "Productos",
      render: (order: Order) => (
        <span className="text-center">{order.items.length}</span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (order: Order) => {
        let statusClass = "";
        let statusText = "";

        switch (order.status) {
          case "pending":
            statusClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            statusText = "Pendiente";
            break;
          case "processing":
            statusClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
            statusText = "En Proceso";
            break;
          case "shipped":
            statusClass = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
            statusText = "Enviado";
            break;
          case "delivered":
            statusClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            statusText = "Entregado";
            break;
          case "cancelled":
            statusClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            statusText = "Cancelado";
            break;
        }

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}
          >
            {statusText}
          </span>
        );
      },
    },
    {
      key: "payment",
      header: "Pago",
      sortable: true,
      render: (order: Order) => {
        let paymentClass = "";
        let paymentText = "";

        switch (order.paymentStatus) {
          case "pending":
            paymentClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            paymentText = "Pendiente";
            break;
          case "paid":
            paymentClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            paymentText = "Pagado";
            break;
          case "rejected":
            paymentClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            paymentText = "Rechazado";
            break;
        }

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentClass}`}
          >
            {paymentText}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Acciones",
      render: (order: Order) => (
        <div className="flex justify-end space-x-2">
          {/* Ver detalles */}
          <Link
            to={`/seller/orders/${order.id}`}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded-md dark:text-blue-400 dark:hover:bg-blue-900"
            title="Ver detalles"
          >
            <Eye size={18} />
          </Link>

          {/* Generar factura */}
          <Link
            to={`/seller/invoices/generate/${order.id}`}
            className="p-1 text-indigo-600 hover:bg-indigo-100 rounded-md dark:text-indigo-400 dark:hover:bg-indigo-900"
            title="Generar factura"
          >
            <FileText size={18} />
          </Link>

          {/* Gestionar envío */}
          <Link
            to={`/seller/shipping/${order.id}`}
            className={`p-1 rounded-md ${
              order.status === "pending" || order.status === "processing"
                ? "text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900"
                : "text-gray-400 cursor-not-allowed"
            }`}
            title={
              order.status === "pending" || order.status === "processing"
                ? "Gestionar envío"
                : "No se puede gestionar el envío en este estado"
            }
          >
            <Truck size={18} />
          </Link>

          {/* Preparar pedido - solo visible para pedidos pendientes */}
          {order.status === "pending" && (
            <button
              onClick={() => updateOrderStatus(order.id, "processing")}
              className="p-1 text-orange-600 hover:bg-orange-100 rounded-md dark:text-orange-400 dark:hover:bg-orange-900"
              title="Preparar pedido"
            >
              <Package size={18} />
            </button>
          )}
        </div>
      ),
    },
  ];

const statsData = [
	{
		label: "Total Pedidos",
		value: orders.length,
		icon: <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
		color: "blue",
	},
	{
		label: "Pendientes",
		value: orders.filter((order) => order.status === "pending").length,
		icon: <Package className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />,
		color: "yellow",
	},
	{
		label: "En Proceso",
		value: orders.filter((order) => order.status === "processing").length,
		icon: <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
		color: "blue",
	},
	{
		label: "Total Ventas",
		value: formatCurrency(orders.reduce((sum, order) => sum + order.total, 0)),
		icon: <BarChart2 className="h-5 w-5 text-green-600 dark:text-green-400" />,
		color: "green",
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

      {/* Panel de filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Buscador */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Buscar por número de pedido, cliente..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {/* Filtro de Estado */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="processing">En Proceso</option>
              <option value="shipped">Enviados</option>
              <option value="delivered">Entregados</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>

          {/* Filtro de Pago */}
          <div className="flex items-center space-x-2">
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">Todos los pagos</option>
              <option value="pending">Pago Pendiente</option>
              <option value="paid">Pagados</option>
              <option value="rejected">Rechazados</option>
            </select>
          </div>

          {/* Filtro de Fecha */}
          <div className="flex items-center space-x-2">
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="custom">Personalizado</option>
            </select>
            {dateFilter === "custom" && (
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
                <span className="text-gray-500 dark:text-gray-400">a</span>
                <input
                  type="date"
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Botón para limpiar filtros */}
          <button
            onClick={() => {
              setStatusFilter("all");
              setPaymentFilter("all");
              setDateFilter("all");
              setSearchTerm("");
            }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
      {/* Estadísticas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SellerStatCardList items={statsData} />
      </div>

      {/* Tabla de Pedidos */}
      <Table
        data={filteredOrders}
        columns={columns}
        searchFields={["orderNumber", "customer.name", "customer.email"]}
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

export default SellerOrdersPage;