import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  PackageCheck,
  Printer,
  AlertTriangle,
  Package,
  MapPin,
  ClipboardList,
  BarChart2,
} from "lucide-react";
import Table from "../../components/dashboard/Table";
import { formatCurrency } from "../../../utils/formatters/formatCurrency";

// Tipos para envíos
interface ShippingItem {
  id: string;
  orderId: string;
  orderNumber: string;
  date: string;
  customer: {
    id: number;
    name: string;
    email: string;
  };
  trackingNumber?: string;
  status: "pending" | "ready_to_ship" | "in_transit" | "delivered" | "failed" | "returned";
  carrier?: string;
  estimatedDelivery?: string;
  shippingAddress: string;
  shippingMethod: string;
  weight: number;
  shippingCost: number;
  lastUpdate?: string;
  history?: {
    date: string;
    status: string;
    location?: string;
    description: string;
  }[];
}

// Datos simulados de envíos
const mockShippingItems: ShippingItem[] = [
  {
    id: "1",
    orderId: "1",
    orderNumber: "ORD-20231105-001",
    date: "2023-11-05T14:30:00Z",
    customer: {
      id: 101,
      name: "Juan Pérez",
      email: "juan.perez@example.com",
    },
    trackingNumber: "ESP10045789632",
    status: "in_transit",
    carrier: "Correos Express",
    estimatedDelivery: "2023-11-08",
    shippingAddress: "Calle Principal 123, Madrid, España",
    shippingMethod: "Estándar",
    weight: 1.5,
    shippingCost: 7.99,
    lastUpdate: "2023-11-06T09:15:00Z",
    history: [
      {
        date: "2023-11-05T16:45:00Z",
        status: "ready_to_ship",
        description: "Paquete preparado y etiquetado"
      },
      {
        date: "2023-11-06T09:15:00Z",
        status: "in_transit",
        location: "Centro de distribución Madrid",
        description: "Paquete recibido en centro de distribución"
      }
    ]
  },
  {
    id: "2",
    orderId: "2",
    orderNumber: "ORD-20231104-002",
    date: "2023-11-04T10:15:00Z",
    customer: {
      id: 102,
      name: "María García",
      email: "maria.garcia@example.com",
    },
    status: "pending",
    shippingAddress: "Avenida Central 45, Barcelona, España",
    shippingMethod: "Estándar",
    weight: 2.3,
    shippingCost: 8.50,
  },
  {
    id: "3",
    orderId: "3",
    orderNumber: "ORD-20231103-003",
    date: "2023-11-03T16:45:00Z",
    customer: {
      id: 103,
      name: "Carlos Rodríguez",
      email: "carlos.rodriguez@example.com",
    },
    trackingNumber: "ESP10045789633",
    status: "delivered",
    carrier: "Correos Express",
    estimatedDelivery: "2023-11-06",
    shippingAddress: "Plaza Mayor 8, Valencia, España",
    shippingMethod: "Express",
    weight: 0.8,
    shippingCost: 12.99,
    lastUpdate: "2023-11-06T14:25:00Z",
    history: [
      {
        date: "2023-11-03T18:30:00Z",
        status: "ready_to_ship",
        description: "Paquete preparado y etiquetado"
      },
      {
        date: "2023-11-04T09:45:00Z",
        status: "in_transit",
        location: "Centro de distribución Valencia",
        description: "Paquete recibido en centro de distribución"
      },
      {
        date: "2023-11-05T16:20:00Z",
        status: "in_transit",
        location: "En ruta para entrega",
        description: "Paquete en vehículo de reparto"
      },
      {
        date: "2023-11-06T14:25:00Z",
        status: "delivered",
        location: "Valencia",
        description: "Paquete entregado al destinatario"
      }
    ]
  },
  {
    id: "4",
    orderId: "4",
    orderNumber: "ORD-20231102-004",
    date: "2023-11-02T09:20:00Z",
    customer: {
      id: 104,
      name: "Ana Martínez",
      email: "ana.martinez@example.com",
    },
    trackingNumber: "ESP10045789634",
    status: "delivered",
    carrier: "SEUR",
    estimatedDelivery: "2023-11-05",
    shippingAddress: "Calle Secundaria 78, Sevilla, España",
    shippingMethod: "Prioritario",
    weight: 3.2,
    shippingCost: 14.50,
    lastUpdate: "2023-11-05T11:30:00Z",
    history: [
      {
        date: "2023-11-02T14:15:00Z",
        status: "ready_to_ship",
        description: "Paquete preparado y etiquetado"
      },
      {
        date: "2023-11-03T10:20:00Z",
        status: "in_transit",
        location: "Centro de distribución Madrid",
        description: "Paquete recibido en centro de distribución"
      },
      {
        date: "2023-11-04T16:45:00Z",
        status: "in_transit",
        location: "Centro de distribución Sevilla",
        description: "Paquete en centro local de distribución"
      },
      {
        date: "2023-11-05T09:30:00Z",
        status: "in_transit",
        location: "En ruta para entrega",
        description: "Paquete en vehículo de reparto"
      },
      {
        date: "2023-11-05T11:30:00Z",
        status: "delivered",
        location: "Sevilla",
        description: "Paquete entregado al destinatario"
      }
    ]
  },
  {
    id: "5",
    orderId: "7",
    orderNumber: "ORD-20231030-007",
    date: "2023-10-30T11:45:00Z",
    customer: {
      id: 107,
      name: "Roberto Fernández",
      email: "roberto.fernandez@example.com",
    },
    trackingNumber: "ESP10045789635",
    status: "ready_to_ship",
    carrier: "MRW",
    estimatedDelivery: "2023-11-08",
    shippingAddress: "Avenida Central 23, Bilbao, España",
    shippingMethod: "Estándar",
    weight: 1.1,
    shippingCost: 6.99,
    lastUpdate: "2023-11-06T15:40:00Z",
    history: [
      {
        date: "2023-11-06T15:40:00Z",
        status: "ready_to_ship",
        description: "Paquete preparado y etiquetado"
      }
    ]
  },
  {
    id: "6",
    orderId: "8",
    orderNumber: "ORD-20231029-008",
    date: "2023-10-29T13:20:00Z",
    customer: {
      id: 108,
      name: "Lucía Díaz",
      email: "lucia.diaz@example.com",
    },
    trackingNumber: "ESP10045789636",
    status: "failed",
    carrier: "SEUR",
    estimatedDelivery: "2023-11-02",
    shippingAddress: "Calle Norte 56, Barcelona, España",
    shippingMethod: "Express",
    weight: 0.5,
    shippingCost: 9.99,
    lastUpdate: "2023-11-02T14:10:00Z",
    history: [
      {
        date: "2023-10-29T16:45:00Z",
        status: "ready_to_ship",
        description: "Paquete preparado y etiquetado"
      },
      {
        date: "2023-10-30T09:30:00Z",
        status: "in_transit",
        location: "Centro de distribución Barcelona",
        description: "Paquete recibido en centro de distribución"
      },
      {
        date: "2023-11-01T11:20:00Z",
        status: "in_transit",
        location: "En ruta para entrega",
        description: "Paquete en vehículo de reparto"
      },
      {
        date: "2023-11-01T14:45:00Z",
        status: "in_transit",
        location: "Barcelona",
        description: "Intento de entrega fallido - Destinatario ausente"
      },
      {
        date: "2023-11-02T12:30:00Z",
        status: "in_transit",
        location: "En ruta para entrega",
        description: "Segundo intento de entrega"
      },
      {
        date: "2023-11-02T14:10:00Z",
        status: "failed",
        location: "Barcelona",
        description: "Entrega fallida - Paquete retornando al remitente"
      }
    ]
  },
  {
    id: "7",
    orderId: "9",
    orderNumber: "ORD-20231028-009",
    date: "2023-10-28T10:05:00Z",
    customer: {
      id: 109,
      name: "Miguel Torres",
      email: "miguel.torres@example.com",
    },
    trackingNumber: "ESP10045789637",
    status: "returned",
    carrier: "Correos Express",
    estimatedDelivery: "2023-11-01",
    shippingAddress: "Avenida Sur 34, Madrid, España",
    shippingMethod: "Estándar",
    weight: 1.8,
    shippingCost: 7.50,
    lastUpdate: "2023-11-03T11:25:00Z",
    history: [
      {
        date: "2023-10-28T13:45:00Z",
        status: "ready_to_ship",
        description: "Paquete preparado y etiquetado"
      },
      {
        date: "2023-10-29T09:30:00Z",
        status: "in_transit",
        location: "Centro de distribución Madrid",
        description: "Paquete recibido en centro de distribución"
      },
      {
        date: "2023-10-31T11:20:00Z",
        status: "in_transit",
        location: "En ruta para entrega",
        description: "Paquete en vehículo de reparto"
      },
      {
        date: "2023-10-31T14:45:00Z",
        status: "in_transit",
        location: "Madrid",
        description: "Intento de entrega fallido - Dirección incorrecta"
      },
      {
        date: "2023-11-01T12:30:00Z",
        status: "in_transit",
        location: "En ruta para entrega",
        description: "Segundo intento de entrega"
      },
      {
        date: "2023-11-01T15:10:00Z",
        status: "failed",
        location: "Madrid",
        description: "Entrega fallida - Dirección incorrecta"
      },
      {
        date: "2023-11-03T11:25:00Z",
        status: "returned",
        location: "Centro de distribución Madrid",
        description: "Paquete devuelto al remitente"
      }
    ]
  }
];

const SellerShippingPage: React.FC = () => {
  const [shippingItems, setShippingItems] = useState<ShippingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [carrierFilter, setCarrierFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Cargar datos de envíos
  useEffect(() => {
    const fetchShippingItems = () => {
      setLoading(true);
      // Simulación de llamada a API
      setTimeout(() => {
        setShippingItems(mockShippingItems);
        setPagination({
          currentPage: 1,
          totalPages: Math.ceil(mockShippingItems.length / 10),
          totalItems: mockShippingItems.length,
          itemsPerPage: 10,
        });
        setLoading(false);
      }, 600);
    };

    fetchShippingItems();
  }, []);

  // Filtramos los envíos
  const filteredShippingItems = shippingItems.filter((item) => {
    // Filtrar por estado
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    // Filtrar por transportista
    const matchesCarrier = 
      carrierFilter === "all" || 
      (item.carrier && item.carrier.toLowerCase().includes(carrierFilter.toLowerCase()));

    // Filtrar por fecha (simplificado)
    const matchesDate = dateFilter === "all"; // Por ahora ignoramos el filtro de fecha

    // Filtrar por término de búsqueda
    const matchesSearch =
      searchTerm === "" ||
      item.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.trackingNumber && item.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.shippingAddress.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesCarrier && matchesDate && matchesSearch;
  });

  // Manejar cambio de estado de envío
  const updateShippingStatus = (shippingId: string, newStatus: ShippingItem["status"]) => {
    setShippingItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === shippingId) {
          const now = new Date().toISOString();
          const newHistory = item.history ? [...item.history] : [];
          newHistory.push({
            date: now,
            status: newStatus,
            description: `Estado actualizado a ${newStatus}`
          });
          
          return { 
            ...item, 
            status: newStatus,
            lastUpdate: now,
            history: newHistory
          };
        }
        return item;
      })
    );
  };

  // Asignar número de seguimiento
  const assignTrackingNumber = (shippingId: string) => {
    // En una app real, esto sería una llamada a la API
    const generateTrackingNumber = () => {
      return `ESP${Math.floor(10000000000 + Math.random() * 90000000000)}`;
    };

    setShippingItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === shippingId) {
          const trackingNumber = generateTrackingNumber();
          const now = new Date().toISOString();
          const newHistory = item.history ? [...item.history] : [];
          
          // Solo añadimos un evento de "listo para enviar" si estaba pendiente
          if (item.status === "pending") {
            newHistory.push({
              date: now,
              status: "ready_to_ship",
              description: "Paquete preparado y etiquetado"
            });
          }
          
          return { 
            ...item, 
            trackingNumber,
            status: item.status === "pending" ? "ready_to_ship" : item.status,
            lastUpdate: now,
            history: newHistory
          };
        }
        return item;
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

  // Etiqueta de estado para mostrar
  const getStatusLabel = (status: ShippingItem["status"]): { text: string; className: string } => {
    switch (status) {
      case "pending":
        return {
          text: "Pendiente",
          className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        };
      case "ready_to_ship":
        return {
          text: "Listo para enviar",
          className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        };
      case "in_transit":
        return {
          text: "En tránsito",
          className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
        };
      case "delivered":
        return {
          text: "Entregado",
          className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        };
      case "failed":
        return {
          text: "Fallido",
          className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        };
      case "returned":
        return {
          text: "Devuelto",
          className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
        };
      default:
        return {
          text: "Desconocido",
          className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
        };
    }
  };

  // Definir las columnas de la tabla
  const columns = [
    {
      key: "orderNumber",
      header: "Nº Pedido",
      sortable: true,
      render: (item: ShippingItem) => (
        <Link
          to={`/seller/orders/${item.orderId}`}
          className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
        >
          {item.orderNumber}
        </Link>
      ),
    },
    {
      key: "trackingNumber",
      header: "Nº Seguimiento",
      sortable: true,
      render: (item: ShippingItem) => (
        <div>
          {item.trackingNumber ? (
            <div className="flex items-center">
              <span className="font-mono text-sm">{item.trackingNumber}</span>
              {item.carrier && (
                <a
                  href="#"
                  className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  title={`Rastrear con ${item.carrier}`}
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Redirigiendo al sitio de ${item.carrier} para rastrear ${item.trackingNumber}`);
                  }}
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-sm">No asignado</span>
          )}
        </div>
      ),
    },
    {
      key: "date",
      header: "Fecha de Pedido",
      sortable: true,
      render: (item: ShippingItem) => {
        const date = new Date(item.date);
        return (
          <span className="text-sm">
            {date.toLocaleDateString("es-ES")}
          </span>
        );
      },
    },
    {
      key: "customer",
      header: "Cliente",
      sortable: true,
      render: (item: ShippingItem) => (
        <div>
          <div className="font-medium text-sm">{item.customer.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
            {item.shippingAddress}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (item: ShippingItem) => {
        const status = getStatusLabel(item.status);
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}
          >
            {status.text}
          </span>
        );
      },
    },
    {
      key: "carrier",
      header: "Transportista",
      sortable: true,
      render: (item: ShippingItem) => (
        <span>
          {item.carrier || "No asignado"}
        </span>
      ),
    },
    {
      key: "estimatedDelivery",
      header: "Entrega Estimada",
      sortable: true,
      render: (item: ShippingItem) => (
        <span>
          {item.estimatedDelivery 
            ? new Date(item.estimatedDelivery).toLocaleDateString("es-ES") 
            : "No disponible"
          }
        </span>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (item: ShippingItem) => (
        <div className="flex justify-end space-x-2">
          {/* Ver detalles del envío */}
          <Link
            to={`/seller/shipping/${item.id}`}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded-md dark:text-blue-400 dark:hover:bg-blue-900"
            title="Ver detalles"
          >
            <ClipboardList size={18} />
          </Link>

          {/* Asignar número de seguimiento - solo para pendientes */}
          {item.status === "pending" && (
            <button
              onClick={() => assignTrackingNumber(item.id)}
              className="p-1 text-green-600 hover:bg-green-100 rounded-md dark:text-green-400 dark:hover:bg-green-900"
              title="Asignar número de seguimiento"
            >
              <Package size={18} />
            </button>
          )}

          {/* Marcar como enviado - solo para listos para enviar */}
          {item.status === "ready_to_ship" && item.trackingNumber && (
            <button
              onClick={() => updateShippingStatus(item.id, "in_transit")}
              className="p-1 text-indigo-600 hover:bg-indigo-100 rounded-md dark:text-indigo-400 dark:hover:bg-indigo-900"
              title="Marcar como enviado"
            >
              <Truck size={18} />
            </button>
          )}

          {/* Imprimir etiqueta - solo para pedidos con número de seguimiento */}
          {item.trackingNumber && item.status !== "delivered" && item.status !== "returned" && (
            <button
              onClick={() => alert(`Imprimiendo etiqueta para ${item.trackingNumber}`)}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded-md dark:text-gray-400 dark:hover:bg-gray-800"
              title="Imprimir etiqueta"
            >
              <Printer size={18} />
            </button>
          )}

          {/* Marcar como entregado - solo para envíos en tránsito */}
          {item.status === "in_transit" && (
            <button
              onClick={() => updateShippingStatus(item.id, "delivered")}
              className="p-1 text-green-600 hover:bg-green-100 rounded-md dark:text-green-400 dark:hover:bg-green-900"
              title="Marcar como entregado"
            >
              <PackageCheck size={18} />
            </button>
          )}

          {/* Marcar como fallido - para envíos pendientes, listos o en tránsito */}
          {(item.status === "ready_to_ship" || item.status === "in_transit") && (
            <button
              onClick={() => updateShippingStatus(item.id, "failed")}
              className="p-1 text-red-600 hover:bg-red-100 rounded-md dark:text-red-400 dark:hover:bg-red-900"
              title="Marcar como fallido"
            >
              <AlertTriangle size={18} />
            </button>
          )}
        </div>
      ),
    },
  ];

  // Estadísticas de envíos
  const shippingStats = {
    pending: shippingItems.filter(item => item.status === "pending").length,
    readyToShip: shippingItems.filter(item => item.status === "ready_to_ship").length,
    inTransit: shippingItems.filter(item => item.status === "in_transit").length,
    delivered: shippingItems.filter(item => item.status === "delivered").length,
    failed: shippingItems.filter(item => item.status === "failed").length,
    returned: shippingItems.filter(item => item.status === "returned").length,
    totalShippingCost: shippingItems.reduce((sum, item) => sum + item.shippingCost, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Envíos
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
              placeholder="Buscar por número de pedido, seguimiento, cliente..."
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
              <option value="ready_to_ship">Listos para enviar</option>
              <option value="in_transit">En tránsito</option>
              <option value="delivered">Entregados</option>
              <option value="failed">Fallidos</option>
              <option value="returned">Devueltos</option>
            </select>
          </div>

          {/* Filtro de Transportista */}
          <div className="flex items-center space-x-2">
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              value={carrierFilter}
              onChange={(e) => setCarrierFilter(e.target.value)}
            >
              <option value="all">Todos los transportistas</option>
              <option value="correos">Correos Express</option>
              <option value="seur">SEUR</option>
              <option value="mrw">MRW</option>
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
              setCarrierFilter("all");
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 col-span-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pendientes</h3>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {shippingStats.pending}
              </p>
            </div>
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
              <Package className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 col-span-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Listos</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {shippingStats.readyToShip}
              </p>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 col-span-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">En Tránsito</h3>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {shippingStats.inTransit}
              </p>
            </div>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
              <Truck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 col-span-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Entregados</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {shippingStats.delivered}
              </p>
            </div>
            <div className="p-2 bg-green-50 dark:bg-green-900 rounded-lg">
              <PackageCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 col-span-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fallidos</h3>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {shippingStats.failed}
              </p>
            </div>
            <div className="p-2 bg-red-50 dark:bg-red-900 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 col-span-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Devueltos</h3>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {shippingStats.returned}
              </p>
            </div>
            <div className="p-2 bg-orange-50 dark:bg-orange-900 rounded-lg">
              <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 col-span-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Coste Envíos</h3>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {formatCurrency(shippingStats.totalShippingCost)}
              </p>
            </div>
            <div className="p-2 bg-primary-50 dark:bg-primary-900 rounded-lg">
              <BarChart2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Envíos */}
      <Table
        data={filteredShippingItems}
        columns={columns}
        searchFields={["orderNumber", "trackingNumber", "customer.name", "shippingAddress"]}
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
    </div>
  );
};

export default SellerShippingPage;