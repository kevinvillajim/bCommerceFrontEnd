// src/presentation/pages/admin/AdminShippingPage.tsx
import React from "react";
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
import { Link } from "react-router-dom";
import useAdminShipping from "../../hooks/useAdminShipping";

// Mapeo de estado para los envíos
const shippingStatusMap: Record<
	string,
	{
		label: string;
		color: string;
		icon: React.ReactNode;
	}
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
  const {
    adminShippings,
    selectedAdminShipping,
    loading,
    error,
    showTrackingModal,
    statusFilter,
    carrierFilter,
    dateRangeFilter,
    pagination,
    setStatusFilter,
    setCarrierFilter,
    setDateRangeFilter,
    setShowTrackingModal,
    fetchAdminShippingDetail,
    updateAdminShippingStatus,
    advanceAdminShippingStatus,
    sendAdminTrackingNotification,
    handleAdminPageChange,
    refreshAdminData,
  } = useAdminShipping();

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

  // Abrir modal de seguimiento
  const openTrackingModal = (shipping: any) => {
    fetchAdminShippingDetail(shipping);
  };

  // Cerrar modal de seguimiento
  const closeTrackingModal = () => {
    setShowTrackingModal(false);
  };

  // Obtener siguiente estado del envío
  const getNextStatus = (currentStatus: string): string => {
    const statusFlow: Record<string, string> = {
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

  // Definir columnas de la tabla
  const columns = [
    {
      key: "tracking",
      header: "Seguimiento",
      sortable: true,
      render: (shipping: any) => (
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
      render: (shipping: any) => (
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
      render: (shipping: any) => (
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
      render: (shipping: any) => (
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
      render: (shipping: any) => (
        <div className="text-sm font-medium">{shipping.carrier}</div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (shipping: any) => {
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
      render: (shipping: any) => (
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
      render: (shipping: any) => {
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
              onClick={() => sendAdminTrackingNotification(shipping.id)}
              className="p-1 text-indigo-600 hover:bg-indigo-100 rounded-md dark:text-indigo-400 dark:hover:bg-indigo-900"
              title="Enviar notificación"
            >
              <Share2 size={18} />
            </button>

            {/* Avanzar estado */}
            {canAdvance && (
              <button
                onClick={() =>
                  advanceAdminShippingStatus(shipping.id, shipping.status)
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
            onClick={refreshAdminData}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <RefreshCw size={18} className="inline mr-2" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Mostrar mensaje de error si existe */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

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
        data={adminShippings}
        columns={columns}
        searchFields={["trackingNumber", "orderNumber", "customerName"]}
        loading={loading}
        emptyMessage="No se encontraron envíos"
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
          itemsPerPage: pagination.itemsPerPage,
          onPageChange: handleAdminPageChange,
        }}
      />

      {/* Modal de Seguimiento */}
      {showTrackingModal && selectedAdminShipping && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Seguimiento de Envío: {selectedAdminShipping.trackingNumber}
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
                          {selectedAdminShipping.orderNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Transportista
                        </p>
                        <p className="text-white text-sm font-medium">
                          {selectedAdminShipping.carrier}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Estado
                        </p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${shippingStatusMap[selectedAdminShipping.status]?.color}`}
                        >
                          {shippingStatusMap[selectedAdminShipping.status]?.icon}
                          {shippingStatusMap[selectedAdminShipping.status]?.label ||
                            selectedAdminShipping.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Fecha de creación
                        </p>
                        <p className="text-white text-sm font-medium">
                          {formatDate(selectedAdminShipping.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Peso
                        </p>
                        <p className="text-white text-sm font-medium">
                          {selectedAdminShipping.weight || "N/A"} kg
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Dimensiones
                        </p>
                        <p className="text-white text-sm font-medium">
                          {selectedAdminShipping.dimensions || "N/A"}
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
                      {selectedAdminShipping.customerName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {selectedAdminShipping.address.street}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {selectedAdminShipping.address.city},{" "}
                      {selectedAdminShipping.address.state}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {selectedAdminShipping.address.postalCode},{" "}
                      {selectedAdminShipping.address.country}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Teléfono: {selectedAdminShipping.address.phone}
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
                    {[...selectedAdminShipping.trackingHistory]
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
                    sendAdminTrackingNotification(selectedAdminShipping.id)
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