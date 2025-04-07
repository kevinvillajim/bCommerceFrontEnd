import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  AlertTriangle,
  Flag,
  Package,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import Table from "../../components/dashboard/Table";
import RatingStars from "../../components/common/RatingStars";

// Tipos para valoraciones
interface Rating {
  id: string;
  productId: number;
  productName: string;
  productImage?: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  orderId?: string;
  isVerifiedPurchase: boolean;
  rating: number;
  title?: string;
  comment?: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  sellerResponse?: {
    text: string;
    date: string;
  };
  reportReason?: string;
  reportDate?: string;
  reportStatus?: "pending" | "approved" | "rejected";
}

// Datos simulados de valoraciones
const mockRatings: Rating[] = [
  {
    id: "1",
    productId: 101,
    productName: "Auriculares Bluetooth",
    productImage: "/images/products/headphones.jpg",
    userId: 201,
    userName: "Juan Pérez",
    userAvatar: "/images/avatars/user1.jpg",
    orderId: "ORD-20231105-001",
    isVerifiedPurchase: true,
    rating: 5,
    title: "¡Excelente producto!",
    comment: "Los auriculares tienen una calidad de sonido impresionante y la batería dura mucho. Totalmente recomendados.",
    date: "2023-11-05T16:30:00Z",
    status: "approved",
    sellerResponse: {
      text: "¡Gracias por tu valoración! Nos alegra que estés disfrutando de nuestros auriculares.",
      date: "2023-11-06T10:15:00Z"
    }
  },
  {
    id: "2",
    productId: 102,
    productName: "Smartwatch Pro",
    productImage: "/images/products/smartwatch.jpg",
    userId: 202,
    userName: "María García",
    orderId: "ORD-20231102-005",
    isVerifiedPurchase: true,
    rating: 2,
    title: "No cumple con las expectativas",
    comment: "La batería dura menos de lo indicado y la aplicación es muy lenta. Decepcionado con la compra.",
    date: "2023-11-03T09:45:00Z",
    status: "approved",
    reportReason: "Valoración injusta, el usuario no siguió las instrucciones de carga",
    reportDate: "2023-11-03T14:20:00Z",
    reportStatus: "pending"
  },
  {
    id: "3",
    productId: 103,
    productName: "Altavoz Portátil",
    productImage: "/images/products/speaker.jpg",
    userId: 203,
    userName: "Carlos Rodríguez",
    userAvatar: "/images/avatars/user3.jpg",
    orderId: "ORD-20231029-008",
    isVerifiedPurchase: true,
    rating: 4,
    title: "Buen producto con pequeños detalles a mejorar",
    comment: "El sonido es muy bueno y la batería dura bastante, pero el botón de encendido es un poco difícil de presionar. En general, estoy satisfecho con la compra.",
    date: "2023-10-31T11:20:00Z",
    status: "approved"
  },
  {
    id: "4",
    productId: 104,
    productName: "Cargador USB-C",
    userId: 204,
    userName: "Ana Martínez",
    orderId: "ORD-20231028-010",
    isVerifiedPurchase: true,
    rating: 5,
    title: "Funciona perfectamente",
    comment: "Carga muy rápido y es compatible con todos mis dispositivos. Lo recomiendo.",
    date: "2023-10-30T16:45:00Z",
    status: "approved",
    sellerResponse: {
      text: "Gracias por tu valoración positiva. Estamos comprometidos con ofrecer productos de calidad.",
      date: "2023-10-31T09:30:00Z"
    }
  },
  {
    id: "5",
    productId: 105,
    productName: "Funda para móvil",
    productImage: "/images/products/phonecase.jpg",
    userId: 205,
    userName: "Pablo López",
    orderId: "ORD-20231025-012",
    isVerifiedPurchase: false,
    rating: 1,
    title: "Mala calidad",
    comment: "Se rompió a los pocos días de uso. No recomiendo este producto.",
    date: "2023-10-28T14:10:00Z",
    status: "rejected",
    reportReason: "No es un comprador verificado y la descripción no coincide con nuestro producto",
    reportDate: "2023-10-28T15:30:00Z",
    reportStatus: "approved"
  },
  {
    id: "6",
    productId: 106,
    productName: "Teclado inalámbrico",
    productImage: "/images/products/keyboard.jpg",
    userId: 206,
    userName: "Elena Sánchez",
    userAvatar: "/images/avatars/user6.jpg",
    orderId: "ORD-20231022-015",
    isVerifiedPurchase: true,
    rating: 4,
    title: "Muy cómodo de usar",
    comment: "Es ligero, las teclas son silenciosas y la batería dura mucho. La única pega es que a veces tarda en conectarse por Bluetooth.",
    date: "2023-10-25T10:05:00Z",
    status: "approved"
  },
  {
    id: "7",
    productId: 101,
    productName: "Auriculares Bluetooth",
    productImage: "/images/products/headphones.jpg",
    userId: 207,
    userName: "Roberto Fernández",
    orderId: "ORD-20231020-018",
    isVerifiedPurchase: true,
    rating: 3,
    title: "Producto correcto pero no excepcional",
    comment: "Los auriculares funcionan bien pero la calidad de sonido no es tan buena como esperaba para su precio. El diseño es cómodo.",
    date: "2023-10-22T17:30:00Z",
    status: "pending"
  },
  {
    id: "8",
    productId: 107,
    productName: "Ratón óptico",
    productImage: "/images/products/mouse.jpg",
    userId: 208,
    userName: "Lucía Díaz",
    userAvatar: "/images/avatars/user8.jpg",
    orderId: "ORD-20231015-020",
    isVerifiedPurchase: true,
    rating: 5,
    title: "Excelente calidad",
    comment: "Muy preciso y cómodo. Los botones tienen buena respuesta y el diseño es elegante. 100% recomendado.",
    date: "2023-10-18T09:15:00Z",
    status: "approved",
    sellerResponse: {
      text: "¡Muchas gracias por tu valoración! Nos alegra saber que estás satisfecha con tu compra.",
      date: "2023-10-18T15:20:00Z"
    }
  },
  {
    id: "9",
    productId: 108,
    productName: "Adaptador HDMI",
    userId: 209,
    userName: "Miguel Torres",
    orderId: "ORD-20231010-023",
    isVerifiedPurchase: true,
    rating: 2,
    title: "No funciona con todos los dispositivos",
    comment: "No es compatible con mi portátil a pesar de que en la descripción dice que sí. La calidad de fabricación es buena, pero no cumple su función principal.",
    date: "2023-10-12T14:40:00Z",
    status: "pending"
  },
  {
    id: "10",
    productId: 109,
    productName: "Cable USB",
    productImage: "/images/products/cable.jpg",
    userId: 210,
    userName: "Carmen González",
    userAvatar: "/images/avatars/user10.jpg",
    orderId: "ORD-20231005-025",
    isVerifiedPurchase: true,
    rating: 4,
    title: "Buena calidad",
    comment: "El cable es resistente y la transferencia de datos es rápida. Buen producto por su precio.",
    date: "2023-10-08T11:25:00Z",
    status: "approved"
  }
];

const SellerRatingsPage: React.FC = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [replyRatingId, setReplyRatingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [reportRatingId, setReportRatingId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Cargar datos de valoraciones
  useEffect(() => {
    const fetchRatings = () => {
      setLoading(true);
      // Simulación de llamada a API
      setTimeout(() => {
        setRatings(mockRatings);
        setPagination({
          currentPage: 1,
          totalPages: Math.ceil(mockRatings.length / 10),
          totalItems: mockRatings.length,
          itemsPerPage: 10,
        });
        setLoading(false);
      }, 600);
    };

    fetchRatings();
  }, []);

  // Filtrar valoraciones
  const filteredRatings = ratings.filter((rating) => {
    // Filtrar por puntuación
    const matchesRating =
      ratingFilter === "all" || Number(ratingFilter) === rating.rating;

    // Filtrar por estado
    const matchesStatus =
      statusFilter === "all" || rating.status === statusFilter;

    // Filtrar por producto
    const matchesProduct =
      productFilter === "all" || String(rating.productId) === productFilter;

    // Filtrar por compra verificada
    const matchesVerified =
      verifiedFilter === "all" ||
      (verifiedFilter === "verified" && rating.isVerifiedPurchase) ||
      (verifiedFilter === "unverified" && !rating.isVerifiedPurchase);

    // Filtrar por término de búsqueda
    const matchesSearch =
      searchTerm === "" ||
      rating.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rating.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rating.title && rating.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rating.comment && rating.comment.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesRating && matchesStatus && matchesProduct && matchesVerified && matchesSearch;
  });

  // Obtener lista única de productos
  const uniqueProducts = Array.from(new Set(ratings.map(r => r.productId)))
    .map(productId => {
      const product = ratings.find(r => r.productId === productId);
      return {
        id: productId,
        name: product ? product.productName : `Producto ${productId}`
      };
    });

  // Calcular estadísticas de valoraciones
  const ratingStats = {
    totalCount: ratings.length,
    averageRating: ratings.length > 0 
      ? Number((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)) 
      : 0,
    distribution: {
      "5": ratings.filter(r => r.rating === 5).length,
      "4": ratings.filter(r => r.rating === 4).length,
      "3": ratings.filter(r => r.rating === 3).length,
      "2": ratings.filter(r => r.rating === 2).length,
      "1": ratings.filter(r => r.rating === 1).length,
    },
    statusCounts: {
      pending: ratings.filter(r => r.status === "pending").length,
      approved: ratings.filter(r => r.status === "approved").length,
      rejected: ratings.filter(r => r.status === "rejected").length,
    },
    reportedCount: ratings.filter(r => r.reportReason).length,
    verifiedPurchaseCount: ratings.filter(r => r.isVerifiedPurchase).length,
    respondedCount: ratings.filter(r => r.sellerResponse).length,
  };

  // Manejar respuesta a valoración
  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyRatingId || !replyText.trim()) return;

    setRatings(prevRatings =>
      prevRatings.map(rating => {
        if (rating.id === replyRatingId) {
          return {
            ...rating,
            sellerResponse: {
              text: replyText.trim(),
              date: new Date().toISOString()
            }
          };
        }
        return rating;
      })
    );

    // Limpiar formulario
    setReplyRatingId(null);
    setReplyText("");
  };

  // Manejar reportar valoración
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportRatingId || !reportReason.trim()) return;

    setRatings(prevRatings =>
      prevRatings.map(rating => {
        if (rating.id === reportRatingId) {
          return {
            ...rating,
            reportReason: reportReason.trim(),
            reportDate: new Date().toISOString(),
            reportStatus: "pending"
          };
        }
        return rating;
      })
    );

    // Limpiar formulario
    setReportRatingId(null);
    setReportReason("");
  };

  // Cancelar respuesta o reporte
  const handleCancelAction = () => {
    setReplyRatingId(null);
    setReplyText("");
    setReportRatingId(null);
    setReportReason("");
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

  // Definir columnas de la tabla
  const columns = [
    {
      key: "product",
      header: "Producto",
      sortable: true,
      render: (rating: Rating) => (
        <div className="flex items-center space-x-3">
          {rating.productImage ? (
            <img 
              src={rating.productImage} 
              alt={rating.productName} 
              className="w-12 h-12 rounded-md object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/100?text=Producto';
              }}
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </div>
          )}
          <div>
            <Link 
              to={`/seller/products/${rating.productId}`} 
              className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              {rating.productName}
            </Link>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              ID: {rating.productId}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Valoración",
      sortable: true,
      render: (rating: Rating) => (
        <div className="flex flex-col items-start space-y-1">
          <RatingStars rating={rating.rating} size={18} />
          <div className="text-sm font-medium">
            {rating.rating}/5
          </div>
        </div>
      ),
    },
    {
      key: "user",
      header: "Cliente",
      sortable: true,
      render: (rating: Rating) => (
        <div className="flex items-center space-x-2">
          {rating.userAvatar ? (
            <img 
              src={rating.userAvatar} 
              alt={rating.userName} 
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/100?text=User';
              }}
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                {rating.userName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <div className="font-medium">{rating.userName}</div>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              {rating.isVerifiedPurchase && (
                <span className="flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle size={12} className="mr-1" />
                  Compra verificada
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "comment",
      header: "Comentario",
      render: (rating: Rating) => (
        <div>
          {rating.title && (
            <div className="font-medium text-gray-900 dark:text-white">
              {rating.title}
            </div>
          )}
          {rating.comment && (
            <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {rating.comment}
            </div>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {new Date(rating.date).toLocaleDateString("es-ES")}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (rating: Rating) => {
        let statusData = {
          icon: Clock,
          colorClass: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
          text: "Pendiente"
        };

        if (rating.status === "approved") {
          statusData = {
            icon: CheckCircle,
            colorClass: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            text: "Aprobada"
          };
        } else if (rating.status === "rejected") {
          statusData = {
            icon: XCircle,
            colorClass: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
            text: "Rechazada"
          };
        }

        return (
          <div className="flex flex-col space-y-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusData.colorClass}`}>
              <statusData.icon size={12} className="mr-1" />
              {statusData.text}
            </span>
            {rating.reportStatus && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                rating.reportStatus === "pending" 
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : rating.reportStatus === "approved"
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
              }`}>
                <Flag size={12} className="mr-1" />
                {rating.reportStatus === "pending" 
                  ? "Reporte pendiente" 
                  : rating.reportStatus === "approved"
                    ? "Reporte aprobado"
                    : "Reporte rechazado"}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "response",
      header: "Respuesta",
      render: (rating: Rating) => (
        <div>
          {rating.sellerResponse ? (
            <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
              <div className="line-clamp-2">{rating.sellerResponse.text}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(rating.sellerResponse.date).toLocaleDateString("es-ES")}
              </div>
            </div>
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Sin respuesta
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (rating: Rating) => (
        <div className="flex justify-end space-x-2">
          {/* Ver detalles */}
          <Link
            to={`/seller/ratings/${rating.id}`}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded-md dark:text-blue-400 dark:hover:bg-blue-900"
            title="Ver detalles"
          >
            <Eye size={18} />
          </Link>

          {/* Responder a valoración */}
          {!rating.sellerResponse && (
            <button
              onClick={() => {
                setReplyRatingId(rating.id);
                setReplyText("");
              }}
              className="p-1 text-green-600 hover:bg-green-100 rounded-md dark:text-green-400 dark:hover:bg-green-900"
              title="Responder a la valoración"
            >
              <MessageSquare size={18} />
            </button>
          )}

          {/* Reportar valoración */}
          {!rating.reportReason && (
            <button
              onClick={() => {
                setReportRatingId(rating.id);
                setReportReason("");
              }}
              className="p-1 text-orange-600 hover:bg-orange-100 rounded-md dark:text-orange-400 dark:hover:bg-orange-900"
              title="Reportar valoración"
            >
              <Flag size={18} />
            </button>
          )}

          {/* Indicador de alerta para valoraciones negativas sin respuesta */}
          {rating.rating <= 2 && !rating.sellerResponse && !rating.reportReason && (
            <span className="p-1 text-red-600 dark:text-red-400" title="Valoración negativa sin respuesta">
              <AlertTriangle size={18} />
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Valoraciones y Reseñas
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
              placeholder="Buscar por producto, cliente, comentario..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {/* Filtro de Puntuación */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="all">Todas las estrellas</option>
              <option value="5">5 estrellas</option>
              <option value="4">4 estrellas</option>
              <option value="3">3 estrellas</option>
              <option value="2">2 estrellas</option>
              <option value="1">1 estrella</option>
            </select>
          </div>

          {/* Filtro de Estado */}
          <div className="flex items-center space-x-2">
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
            </select>
          </div>

          {/* Filtro de Producto */}
          <div className="flex items-center space-x-2">
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
            >
              <option value="all">Todos los productos</option>
              {uniqueProducts.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>

          {/* Filtro de Compra Verificada */}
          <div className="flex items-center space-x-2">
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
            >
              <option value="all">Todas las compras</option>
              <option value="verified">Compras verificadas</option>
              <option value="unverified">Compras no verificadas</option>
            </select>
          </div>

          {/* Botón para limpiar filtros */}
          <button
            onClick={() => {
              setRatingFilter("all");
              setStatusFilter("all");
              setProductFilter("all");
              setVerifiedFilter("all");
              setSearchTerm("");
            }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Estadísticas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 col-span-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Valoración Media</h3>
              <div className="flex items-center mt-1">
                <p className="text-3xl font-bold text-gray-900 dark:text-white mr-2">
                  {ratingStats.averageRating}
                </p>
                <RatingStars rating={ratingStats.averageRating} size={24} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                De {ratingStats.totalCount} valoraciones
              </p>
            </div>
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = ratingStats.distribution[stars as keyof typeof ratingStats.distribution];
              const percentage = ratingStats.totalCount > 0 
                ? Math.round((count / ratingStats.totalCount) * 100) 
                : 0;
              
              return (
                <div key={stars} className="flex items-center text-sm">
                  <div className="w-12 text-gray-600 dark:text-gray-300 flex items-center">
                    {stars} <Star size={12} className="ml-1 text-yellow-500" />
                  </div>
                  <div className="flex-grow mx-3">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-right text-gray-500 dark:text-gray-400">
                    {percentage}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pendientes</h3>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {ratingStats.statusCounts.pending}
              </p>
            </div>
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Aprobadas</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {ratingStats.statusCounts.approved}
              </p>
            </div>
            <div className="p-2 bg-green-50 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Reportadas</h3>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {ratingStats.reportedCount}
              </p>
            </div>
            <div className="p-2 bg-orange-50 dark:bg-orange-900 rounded-lg">
              <Flag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Respondidas</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {ratingStats.respondedCount}
              </p>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Formulario para responder a una valoración */}
      {replyRatingId && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Responder a la valoración
          </h3>
          <form onSubmit={handleReplySubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="reply-text" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Tu respuesta
              </label>
              <textarea
                id="reply-text"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Escribe tu respuesta a esta valoración..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                required
              ></textarea>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Tu respuesta será visible públicamente para todos los usuarios.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelAction}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled={!replyText.trim()}
              >
                Enviar respuesta
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Formulario para reportar una valoración */}
      {reportRatingId && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Reportar valoración
          </h3>
          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="report-reason" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Motivo del reporte
              </label>
              <textarea
                id="report-reason"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe por qué consideras que esta valoración debe ser revisada..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                required
              ></textarea>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Tu reporte será revisado por el equipo de moderación.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelAction}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                disabled={!reportReason.trim()}
              >
                Enviar reporte
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de Valoraciones */}
      <Table
        data={filteredRatings}
        columns={columns}
        searchFields={["productName", "userName", "title", "comment"]}
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
    </div>
  );
};

export default SellerRatingsPage;