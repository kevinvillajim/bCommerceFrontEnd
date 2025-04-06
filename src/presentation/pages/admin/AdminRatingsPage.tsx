import React, { useState, useEffect } from "react";
import Table from "../../components/dashboard/Table";
import {
  Star,
  User,
  Package,
  Store,
  Calendar,
  Eye,
  RefreshCw,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Clock,
  Flag,
  BarChart2,
  Edit
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Rating } from "../../../core/domain/entities/Rating";

// Datos simulados para valoraciones y reseñas
const mockRatings: Rating[] = [
  {
    id: 1,
    userId: 101,
    productId: 1,
    sellerId: 1,
    orderId: 1,
    rating: 5,
    title: "Excelente producto, muy satisfecho",
    comment: "El producto superó mis expectativas. La calidad de los materiales es excepcional y el rendimiento es increíble. Totalmente recomendado para cualquiera que busque un equipo confiable.",
    status: "approved",
    type: "product",
    createdAt: "2023-11-03T15:30:00Z",
    updatedAt: "2023-11-04T09:20:00Z",
    user: {
      id: 101,
      name: "Juan Pérez",
      avatar: "avatar1.jpg"
    },
    isVerifiedPurchase: true
  },
  {
    id: 2,
    userId: 102,
    productId: 2,
    sellerId: 2,
    orderId: 2,
    rating: 4,
    title: "Buen producto pero podría mejorar",
    comment: "En general estoy satisfecho con el producto. El diseño es atractivo y funciona bien, pero hay algunos detalles que podrían mejorarse. La batería dura menos de lo esperado.",
    status: "approved",
    type: "product",
    createdAt: "2023-11-02T10:15:00Z",
    updatedAt: "2023-11-02T14:45:00Z",
    user: {
      id: 102,
      name: "María Rodríguez",
      avatar: "avatar2.jpg"
    },
    isVerifiedPurchase: true
  },
  {
    id: 3,
    userId: 103,
    productId: 3,
    sellerId: 3,
    orderId: 3,
    rating: 5,
    title: "¡Increíble calidad de sonido!",
    comment: "Estos auriculares ofrecen una calidad de sonido excepcional. La cancelación de ruido funciona perfectamente y la duración de la batería es impresionante. Sin duda los recomendaría.",
    status: "approved",
    type: "product",
    createdAt: "2023-11-01T16:40:00Z",
    updatedAt: "2023-11-01T16:40:00Z",
    user: {
      id: 103,
      name: "Carlos Sánchez",
      avatar: "avatar3.jpg"
    },
    isVerifiedPurchase: true
  },
  {
    id: 4,
    userId: 104,
    productId: 4,
    sellerId: 2,
    orderId: 4,
    rating: 2,
    title: "No cumple con lo esperado",
    comment: "La calidad del producto no corresponde con lo mostrado en las imágenes. Los materiales parecen baratos y el rendimiento es deficiente. No lo recomendaría.",
    status: "pending",
    type: "product",
    createdAt: "2023-11-04T11:10:00Z",
    updatedAt: "2023-11-04T11:10:00Z",
    user: {
      id: 104,
      name: "Ana Martínez",
      avatar: "avatar4.jpg"
    },
    isVerifiedPurchase: true
  },
  {
    id: 5,
    userId: 105,
    sellerId: 1,
    productId: 6,
    orderId: 5,
    rating: 5,
    title: "Excelente servicio y atención",
    comment: "Muy satisfecho con la atención recibida. El vendedor fue muy profesional y respondió rápidamente a todas mis consultas. El envío fue rápido y el producto llegó en perfectas condiciones.",
    status: "approved",
    type: "seller",
    createdAt: "2023-11-05T14:50:00Z",
    updatedAt: "2023-11-05T18:20:00Z",
    user: {
      id: 105,
      name: "Javier García",
      avatar: "avatar5.jpg"
    },
    isVerifiedPurchase: true
  },
  {
    id: 6,
    userId: 106,
    sellerId: 2,
    productId: 6,
    orderId: 6,
    rating: 4,
    title: "Buen servicio pero envío lento",
    comment: "El vendedor fue amable y el producto coincide con la descripción, pero el envío tardó más de lo esperado. En general, una buena experiencia de compra.",
    status: "approved",
    type: "seller",
    createdAt: "2023-10-30T10:25:00Z",
    updatedAt: "2023-10-30T15:40:00Z",
    user: {
      id: 106,
      name: "Lucía Fernández",
      avatar: "avatar6.jpg"
    },
    isVerifiedPurchase: true
  },
  {
    id: 7,
    userId: 107,
    productId: 10,
    sellerId: 6,
    orderId: 7,
    rating: 3,
    title: "Producto aceptable para el precio",
    comment: "Para el precio que tiene, es un producto aceptable. No es excepcional pero cumple con lo básico. El diseño es bonito pero la durabilidad es cuestionable.",
    status: "pending",
    type: "product",
    createdAt: "2023-11-01T17:15:00Z",
    updatedAt: "2023-11-01T17:15:00Z",
    user: {
      id: 107,
      name: "David López",
      avatar: "avatar7.jpg"
    },
    isVerifiedPurchase: true
  },
  {
    id: 8,
    userId: 108,
    productId: 6,
    sellerId: 6,
    orderId: 8,
    rating: 1,
    title: "Pésima experiencia con este producto",
    comment: "Totalmente decepcionado con este producto. No funciona como se describe y la calidad es horrible. Además, el servicio al cliente no fue de ayuda cuando intenté resolver el problema.",
    status: "rejected",
    type: "product",
    createdAt: "2023-11-05T12:30:00Z",
    updatedAt: "2023-11-06T09:15:00Z",
    user: {
      id: 108,
      name: "Elena Gómez",
      avatar: "avatar8.jpg"
    },
    isVerifiedPurchase: true
  },
  {
    id: 9,
    userId: 109,
    productId: 7,
    sellerId: 5,
    orderId: 9,
    rating: 5,
    title: "¡Producto perfecto!",
    comment: "Esta impresora es exactamente lo que necesitaba. Fácil de configurar, excelente calidad de impresión y el Wi-Fi funciona perfectamente. ¡Muy feliz con mi compra!",
    status: "pending",
    type: "product",
    createdAt: "2023-10-28T09:20:00Z",
    updatedAt: "2023-10-28T09:20:00Z",
    user: {
      id: 109,
      name: "Miguel Torres",
      avatar: "avatar9.jpg"
    },
    isVerifiedPurchase: true
  },
  {
    id: 10,
    userId: 110,
    sellerId: 2,
    productId: 5,
    orderId: 10,
    rating: 1,
    title: "Pésimo servicio, no lo recomiendo",
    comment: "El vendedor fue muy poco profesional. No respondió a mis mensajes y el paquete llegó dañado. Muy decepcionado con todo el proceso de compra.",
    status: "pending",
    type: "seller",
    createdAt: "2023-10-25T15:40:00Z",
    updatedAt: "2023-10-25T15:40:00Z",
    user: {
      id: 110,
      name: "Carmen Navarro",
      avatar: "avatar10.jpg"
    },
    isVerifiedPurchase: true
  },
  {
    id: 11,
    userId: 111,
    productId: 9,
    sellerId: 5,
    orderId: 11,
    rating: 4,
    title: "Muy buen ratón para gaming",
    comment: "El ratón es cómodo y responde muy bien. Los botones programables son útiles y la calidad de construcción es excelente. Solo le quito una estrella porque el software podría ser más intuitivo.",
    status: "approved",
    type: "product",
    createdAt: "2023-11-03T12:20:00Z",
    updatedAt: "2023-11-03T16:45:00Z",
    user: {
      id: 111,
      name: "Pedro Morales",
      avatar: "avatar11.jpg"
    },
    isVerifiedPurchase: true
  },
  {
    id: 12,
    userId: 112,
    productId: 2,
    sellerId: 4,
    orderId: 12,
    rating: 3,
    title: "HORRIBLE EXPERIENCIA, EVITEN ESTE PRODUCTO A TODA COSTA!!!",
    comment: "Este producto es una completa ESTAFA. El fabricante miente descaradamente sobre sus características. La pantalla es de pésima calidad y el rendimiento es HORRIBLE. No pierdan su dinero en esta basura. Además, la atención al cliente es inexistente cuando intenté reclamar. TODOS DEBERÍAN SABER LA VERDAD SOBRE ESTE PRODUCTO!!!!",
    status: "rejected",
    type: "product",
    createdAt: "2023-10-29T14:35:00Z",
    updatedAt: "2023-10-30T10:15:00Z",
    user: {
      id: 112,
      name: "Roberto Jiménez",
      avatar: "avatar12.jpg"
    },
    isVerifiedPurchase: false
  }
];

// Mapeo de estado para las valoraciones
const ratingStatusMap: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pendiente",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    icon: <Clock className="w-3 h-3 mr-1" />,
  },
  approved: {
    label: "Aprobada",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    icon: <CheckCircle className="w-3 h-3 mr-1" />,
  },
  rejected: {
    label: "Rechazada",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    icon: <XCircle className="w-3 h-3 mr-1" />,
  },
};

// Mapeo de tipo de valoración
const ratingTypeMap: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  product: {
    label: "Producto",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    icon: <Package className="w-3 h-3 mr-1" />,
  },
  seller: {
    label: "Vendedor",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    icon: <Store className="w-3 h-3 mr-1" />,
  },
  user: {
    label: "Usuario",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    icon: <User className="w-3 h-3 mr-1" />,
  },
};

const AdminRatingsPage: React.FC = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
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
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [moderationNote, setModerationNote] = useState("");

  // Cargar datos de valoraciones
  useEffect(() => {
    const fetchRatings = () => {
      setLoading(true);
      // Simulación de llamada a API
      setTimeout(() => {
        setRatings(mockRatings);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: mockRatings.length,
          itemsPerPage: 10,
        });
        setLoading(false);
      }, 500);
    };

    fetchRatings();
  }, []);

  // Filtrar valoraciones
  const filteredRatings = ratings.filter((rating) => {
    // Filtro por estado
    const matchesStatus = statusFilter === "all" || rating.status === statusFilter;

    // Filtro por tipo
    const matchesType = typeFilter === "all" || rating.type === typeFilter;

    // Filtro por puntuación
    const matchesRating = ratingFilter === null || rating.rating === ratingFilter;

    // Filtro por rango de fechas
    let matchesDateRange = true;
    if (dateRangeFilter.from) {
      const ratingDate = new Date(rating.createdAt || "");
      const fromDate = new Date(dateRangeFilter.from);
      matchesDateRange = ratingDate >= fromDate;
    }
    if (dateRangeFilter.to && matchesDateRange) {
      const ratingDate = new Date(rating.createdAt || "");
      const toDate = new Date(dateRangeFilter.to);
      toDate.setHours(23, 59, 59, 999);
      matchesDateRange = ratingDate <= toDate;
    }

    return matchesStatus && matchesType && matchesRating && matchesDateRange;
  });

  // Funciones para el modal de valoración
  const openRatingModal = (rating: Rating) => {
    setSelectedRating(rating);
    setModerationNote("");
    setShowRatingModal(true);
  };

  const closeRatingModal = () => {
    setSelectedRating(null);
    setShowRatingModal(false);
    setModerationNote("");
  };

  const approveRating = (ratingId: number) => {
    if (selectedRating) {
      closeRatingModal();
    }
    setRatings((prevRatings) =>
      prevRatings.map((rating) =>
        rating.id === ratingId
          ? { ...rating, status: "approved", updatedAt: new Date().toISOString() }
          : rating
      )
    );
  };

  const rejectRating = (ratingId: number) => {
    if (selectedRating) {
      if (!moderationNote) {
        alert("Por favor, proporciona una nota de moderación para explicar el rechazo.");
        return;
      }
      closeRatingModal();
    }
    setRatings((prevRatings) =>
      prevRatings.map((rating) =>
        rating.id === ratingId
          ? { ...rating, status: "rejected", updatedAt: new Date().toISOString() }
          : rating
      )
    );
  };

  const reportRating = (ratingId: number) => {
    alert(`La valoración #${ratingId} ha sido reportada para revisión.`);
  };

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

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating
                ? "text-yellow-500 fill-current"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}</span>
      </div>
    );
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    // Aquí iría la lógica para obtener la nueva página de datos en una app real.
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const columns = [
    {
      key: "user",
      header: "Usuario",
      sortable: true,
      render: (rating: Rating) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            {rating.user?.avatar ? (
              <img
                src={`/images/avatars/${rating.user.avatar}`}
                alt={rating.user?.name}
                className="h-8 w-8 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/40?text=User";
                }}
              />
            ) : (
              <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {rating.user?.name || `Usuario #${rating.userId}`}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              ID: {rating.userId}
              {rating.isVerifiedPurchase && (
                <span className="ml-2 text-green-600 dark:text-green-400">
                  ✓ Compra verificada
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "ratingScore",
      header: "Valoración",
      sortable: true,
      render: (rating: Rating) => renderStars(rating.rating),
    },
    {
      key: "item",
      header: "Elemento",
      sortable: true,
      render: (rating: Rating) => {
        if (rating.type === "product" && rating.productId) {
          return (
            <Link
              to={`/admin/products/${rating.productId}`}
              className="flex items-center text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
            >
              <Package className="h-4 w-4 mr-1" />
              Producto #{rating.productId}
            </Link>
          );
        } else if (rating.type === "seller" && rating.sellerId) {
          return (
            <Link
              to={`/admin/sellers/${rating.sellerId}`}
              className="flex items-center text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
            >
              <Store className="h-4 w-4 mr-1" />
              Vendedor #{rating.sellerId}
            </Link>
          );
        } else {
          return (
            <span className="text-gray-500 dark:text-gray-400">
              No especificado
            </span>
          );
        }
      },
    },
    {
      key: "type",
      header: "Tipo",
      sortable: true,
      render: (rating: Rating) => {
        const type = ratingTypeMap[rating.type] || {
          label: rating.type,
          color:
            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
          icon: <AlertTriangle className="w-3 h-3 mr-1" />,
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${type.color}`}
          >
            {type.icon}
            {type.label}
          </span>
        );
      },
    },
    {
      key: "title",
      header: "Título",
      sortable: true,
      render: (rating: Rating) => (
        <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
          {rating.title || "Sin título"}
        </div>
      ),
    },
    {
      key: "date",
      header: "Fecha",
      sortable: true,
      render: (rating: Rating) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Creado: {formatDate(rating.createdAt)}
          {rating.updatedAt !== rating.createdAt && (
            <div>Actualizado: {formatDate(rating.updatedAt)}</div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (rating: Rating) => {
        const status = ratingStatusMap[rating.status] || {
          label: rating.status,
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
      key: "actions",
      header: "Acciones",
      render: (rating: Rating) => (
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => openRatingModal(rating)}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded-md dark:text-blue-400 dark:hover:bg-blue-900"
            title="Ver detalles"
          >
            <Eye size={18} />
          </button>
          {rating.status === "pending" && (
            <>
              <button
                onClick={() => approveRating(rating.id || 0)}
                className="p-1 text-green-600 hover:bg-green-100 rounded-md dark:text-green-400 dark:hover:bg-green-900"
                title="Aprobar valoración"
              >
                <CheckCircle size={18} />
              </button>
              <button
                onClick={() => rejectRating(rating.id || 0)}
                className="p-1 text-red-600 hover:bg-red-100 rounded-md dark:text-red-400 dark:hover:bg-red-900"
                title="Rechazar valoración"
              >
                <XCircle size={18} />
              </button>
            </>
          )}
          <button
            onClick={() => reportRating(rating.id || 0)}
            className="p-1 text-orange-600 hover:bg-orange-100 rounded-md dark:text-orange-400 dark:hover:bg-orange-900"
            title="Reportar valoración"
          >
            <Flag size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Valoraciones y Reseñas
        </h1>
        <div className="flex space-x-2">
          <Link
            to="/admin/ratings/dashboard"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <BarChart2 size={18} className="inline mr-2" />
            Estadísticas
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

      {/* Panel de estadísticas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">
                Total
              </h3>
              <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {ratings.length}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Valoraciones y reseñas
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
                Pendientes
              </h3>
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
              {ratings.filter((r) => r.status === "pending").length}
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Esperando moderación
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-green-800 dark:text-green-200">
                Aprobadas
              </h3>
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {ratings.filter((r) => r.status === "approved").length}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Publicadas
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                Rechazadas
              </h3>
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-900 dark:text-red-100">
              {ratings.filter((r) => r.status === "rejected").length}
            </p>
            <p className="text-red-700 dark:text-red-300">
              Ocultadas del público
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los Estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Todos los Tipos</option>
              <option value="product">Producto</option>
              <option value="seller">Vendedor</option>
              <option value="user">Usuario</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              value={ratingFilter !== null ? ratingFilter.toString() : "all"}
              onChange={(e) =>
                setRatingFilter(e.target.value === "all" ? null : parseInt(e.target.value))
              }
            >
              <option value="all">Todas las Puntuaciones</option>
              <option value="5">5 Estrellas</option>
              <option value="4">4 Estrellas</option>
              <option value="3">3 Estrellas</option>
              <option value="2">2 Estrellas</option>
              <option value="1">1 Estrella</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <input
              type="date"
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              value={dateRangeFilter.from}
              onChange={(e) =>
                setDateRangeFilter({ ...dateRangeFilter, from: e.target.value })
              }
              placeholder="Desde"
            />
            <input
              type="date"
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              value={dateRangeFilter.to}
              onChange={(e) =>
                setDateRangeFilter({ ...dateRangeFilter, to: e.target.value })
              }
              placeholder="Hasta"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Valoraciones */}
      <Table
        data={filteredRatings}
        columns={columns}
        searchFields={["title", "comment", "user.name"]}
        loading={loading}
        emptyMessage="No se encontraron valoraciones"
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
          itemsPerPage: pagination.itemsPerPage,
          onPageChange: handlePageChange,
        }}
      />

      {/* Modal de Detalle de Valoración */}
      {showRatingModal && selectedRating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Detalles de Valoración
              </h3>
              <button
                onClick={closeRatingModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              {/* Información de Usuario */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Usuario
                </h4>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {selectedRating.user?.avatar ? (
                      <img
                        src={`/images/avatars/${selectedRating.user.avatar}`}
                        alt={selectedRating.user?.name}
                        className="h-10 w-10 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/40?text=User";
                        }}
                      />
                    ) : (
                      <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedRating.user?.name || `Usuario #${selectedRating.userId}`}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {selectedRating.userId}
                      {selectedRating.isVerifiedPurchase && (
                        <span className="ml-2 text-green-600 dark:text-green-400">
                          ✓ Compra verificada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de la Valoración */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Valoración
                </h4>
                <div className="flex items-center mb-2">
                  {renderStars(selectedRating.rating)}
                </div>
                <div className="text-gray-900 dark:text-white mb-2">
                  <span className="font-medium">Título:</span> {selectedRating.title}
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-800 dark:text-gray-200 mb-2 whitespace-pre-wrap">
                  {selectedRating.comment}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <div>Creado: {formatDate(selectedRating.createdAt)}</div>
                  {selectedRating.updatedAt !== selectedRating.createdAt && (
                    <div>Actualizado: {formatDate(selectedRating.updatedAt)}</div>
                  )}
                </div>
              </div>

              {/* Estado Actual */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Estado Actual
                </h4>
                <div className="flex items-center">
                  {(() => {
                    const status = ratingStatusMap[selectedRating.status] || {
                      label: selectedRating.status,
                      color:
                        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
                      icon: <AlertTriangle className="w-4 h-4 mr-1" />,
                    };
                    return (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
                      >
                        {status.icon}
                        {status.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Acciones de Moderación */}
              {selectedRating.status === "pending" && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Moderación
                  </h4>
                  <div className="mb-4">
                    <label
                      htmlFor="moderationNote"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Nota de Moderación (obligatoria para rechazar)
                    </label>
                    <textarea
                      id="moderationNote"
                      rows={3}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Razón del rechazo o notas adicionales..."
                      value={moderationNote}
                      onChange={(e) => setModerationNote(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => approveRating(selectedRating.id || 0)}
                      className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={18} className="mr-2" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => rejectRating(selectedRating.id || 0)}
                      className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle size={18} className="mr-2" />
                      Rechazar
                    </button>
                  </div>
                </div>
              )}

              {/* Enlace al Elemento Valorado */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Enlaces Rápidos
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRating.productId && (
                    <Link
                      to={`/admin/products/${selectedRating.productId}`}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm"
                    >
                      <Package className="w-4 h-4 mr-1" />
                      Ver Producto
                    </Link>
                  )}
                  {selectedRating.sellerId && (
                    <Link
                      to={`/admin/sellers/${selectedRating.sellerId}`}
                      className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-sm"
                    >
                      <Store className="w-4 h-4 mr-1" />
                      Ver Vendedor
                    </Link>
                  )}
                  {selectedRating.orderId && (
                    <Link
                      to={`/admin/orders/${selectedRating.orderId}`}
                      className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full text-sm"
                    >
                      <Package className="w-4 h-4 mr-1" />
                      Ver Orden
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRatingsPage;