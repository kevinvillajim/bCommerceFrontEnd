// src/presentation/pages/admin/AdminRatingsPage.tsx
import React from "react";
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
  Clock,
  Flag,
  BarChart2,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Rating } from "../../../core/domain/entities/Rating";
import StatCardList from "../../components/dashboard/StatCardList";
import useAdminRatings from "../../hooks/useAdminRatings";

// Mapeo de estado para las valoraciones
const ratingStatusMap: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="w-3 h-3 mr-1" />,
  },
  approved: {
    label: "Aprobada",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="w-3 h-3 mr-1" />,
  },
  rejected: {
    label: "Rechazada",
    color: "bg-red-100 text-red-800",
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
    color: "bg-blue-100 text-blue-800",
    icon: <Package className="w-3 h-3 mr-1" />,
  },
  seller: {
    label: "Vendedor",
    color: "bg-purple-100 text-purple-800",
    icon: <Store className="w-3 h-3 mr-1" />,
  },
  user: {
    label: "Usuario",
    color: "bg-orange-100 text-orange-800",
    icon: <User className="w-3 h-3 mr-1" />,
  },
};

const AdminRatingsPage: React.FC = () => {
  const {
    // Estado
    ratings,
    loading,
    error,
    stats,
    statsLoading,
    statusFilter,
    typeFilter,
    ratingFilter,
    dateRangeFilter,
    pagination,
    selectedRating,
    showRatingModal,
    moderationNote,
    
    // Funciones de acción
    setStatusFilter,
    setTypeFilter,
    setRatingFilter,
    setDateRangeFilter,
    handlePageChange,
    openRatingModal,
    closeRatingModal,
    setModerationNote,
    approveRating,
    rejectRating,
    flagRating,
    refreshData
  } = useAdminRatings();

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }
      
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit", 
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "Error en fecha";
    }
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
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}</span>
      </div>
    );
  };

  const columns = [
		{
			key: "user",
			header: "Usuario",
			sortable: true,
			render: (rating: Rating) => (
				<div className="flex items-center">
					<div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
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
							<User className="h-4 w-4 text-gray-500" />
						)}
					</div>
					<div className="ml-3">
						<div className="text-sm font-medium text-gray-900">
							{rating.user?.name || `Usuario #${rating.userId}`}
						</div>
						<div className="text-xs text-gray-500">
							ID: {rating.userId}
							{rating.isVerifiedPurchase && (
								<span className="ml-2 text-green-600">
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
			key: "type",
			header: "Tipo",
			sortable: true,
			render: (rating: Rating) => {
				const type = ratingTypeMap[rating.type] || {
					label: rating.type,
					color:
						"bg-gray-100 text-gray-800",
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
				<div className="text-sm font-medium text-gray-900 line-clamp-2">
					{rating.title || "Sin título"}
				</div>
			),
		},
		{
			key: "date",
			header: "Fecha",
			sortable: true,
			render: (rating: Rating) => {
				// Manejar diferentes formatos de fecha del backend
				const createdDate = rating.createdAt || (rating as any).created_at;
				const updatedDate = rating.updatedAt || (rating as any).updated_at;
				
				return (
					<div className="text-xs text-gray-500">
						<div>Creado: {formatDate(createdDate)}</div>
						{updatedDate && updatedDate !== createdDate && (
							<div>Actualizado: {formatDate(updatedDate)}</div>
						)}
					</div>
				);
			},
		},
		{
			key: "status",
			header: "Estado",
			sortable: true,
			render: (rating: Rating) => {
				const status = ratingStatusMap[rating.status] || {
					label: rating.status,
					color:
						"bg-gray-100 text-gray-800",
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
						className="p-1 text-blue-600 hover:bg-blue-100 rounded-md"
						title="Ver detalles"
					>
						<Eye size={18} />
					</button>
					{rating.status === "pending" && (
						<>
							<button
								onClick={async () => {
									if (!rating.id) {
										alert("ID de valoración no válido");
										return;
									}
									const success = await approveRating(rating.id);
									if (success) {
										console.log("Valoración aprobada exitosamente");
									}
								}}
								className="p-1 text-green-600 hover:bg-green-100 rounded-md"
								title="Aprobar valoración"
							>
								<CheckCircle size={18} />
							</button>
							<button
								onClick={async () => {
									if (!rating.id) {
										alert("ID de valoración no válido");
										return;
									}
									// Abrir el modal para que el usuario pueda ingresar una nota antes de rechazar
									openRatingModal(rating);
								}}
								className="p-1 text-red-600 hover:bg-red-100 rounded-md"
								title="Rechazar valoración"
							>
								<XCircle size={18} />
							</button>
						</>
					)}
					<button
						onClick={async () => {
							if (!rating.id) {
								alert("ID de valoración no válido");
								return;
							}
							const success = await flagRating(
								rating.id,
								rating.status === "flagged"
									? "Desmarcada por administrador"
									: "Marcada para revisión por administrador"
							);
							if (success) {
								console.log("Estado de flag actualizado exitosamente");
							}
						}}
						className={`p-1 ${
							rating.status === "flagged"
								? "text-green-600 hover:bg-green-100"
								: "text-orange-600 hover:bg-orange-100"
						} rounded-md`}
						title={
							rating.status === "flagged"
								? "Desmarcar valoración"
								: "Reportar valoración"
						}
					>
						{rating.status === "flagged" ? (
							<CheckCircle size={18} /> // Icono para desmarcar
						) : (
							<Flag size={18} /> // Icono para marcar
						)}
					</button>
				</div>
			),
		},
	];

  const statsItemsRating = [
    {
      title: "Total",
      value: stats.total,
      description: "Valoraciones y reseñas",
      icon: Star,
      bgColor: "bg-blue-50/20",
      textColor: "text-blue-800",
      valueColor: "text-blue-900 ",
      descriptionColor: "text-blue-700",
      iconColor: "text-blue-600",
    },
    {
      title: "Pendientes",
      value: stats.pending,
      description: "Esperando moderación",
      icon: Clock,
      bgColor: "bg-yellow-50/20",
      textColor: "text-yellow-800",
      valueColor: "text-yellow-900",
      descriptionColor: "text-yellow-700",
      iconColor: "text-yellow-6000",
    },
    {
      title: "Aprobadas",
      value: stats.approved,
      description: "Publicadas",
      icon: CheckCircle,
      bgColor: "bg-green-50/20",
      textColor: "text-green-800",
      valueColor: "text-green-900",
      descriptionColor: "text-green-700",
      iconColor: "text-green-600",
    },
    {
      title: "Rechazadas",
      value: stats.rejected,
      description: "Ocultadas del público",
      icon: XCircle,
      bgColor: "bg-red-50/20",
      textColor: "text-red-800",
      valueColor: "text-red-900",
      descriptionColor: "text-red-700",
      iconColor: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
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
            <RefreshCw size={18} className={`inline mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* ✅ ELIMINADA la sección duplicada de líneas 413-457 */}

      {/* Panel de estadísticas */}
      {statsLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Cargando estadísticas...</span>
          </div>
        </div>
      ) : (
        <StatCardList items={statsItemsRating}/>
      )}
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Todos los Tipos</option>
              <option value="product">Producto</option>
              <option value="seller">Vendedor</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            <Calendar className="h-5 w-5 text-gray-500" />
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={dateRangeFilter.from}
              onChange={(e) =>
                setDateRangeFilter({ ...dateRangeFilter, from: e.target.value })
              }
              placeholder="Desde"
            />
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
        data={ratings}
        columns={columns}
        searchFields={["title", "comment"]}
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
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Detalles de Valoración
              </h3>
              <button
                onClick={closeRatingModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              {/* Información de Usuario */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Usuario
                </h4>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
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
                      <User className="h-6 w-6 text-gray-500" />
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {selectedRating.user?.name || `Usuario #${selectedRating.userId}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {selectedRating.userId}
                      {selectedRating.isVerifiedPurchase && (
                        <span className="ml-2 text-green-600">
                          ✓ Compra verificada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de la Valoración */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Valoración
                </h4>
                <div className="flex items-center mb-2">
                  {renderStars(selectedRating.rating)}
                </div>
                <div className="text-gray-900 mb-2">
                  <span className="font-medium">Título:</span> {selectedRating.title}
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-gray-800 mb-2 whitespace-pre-wrap">
                  {selectedRating.comment}
                </div>
                <div className="text-sm text-gray-500">
                  <div>Creado: {formatDate(selectedRating.createdAt || (selectedRating as any).created_at)}</div>
                  {((selectedRating.updatedAt || (selectedRating as any).updated_at) && 
                    (selectedRating.updatedAt || (selectedRating as any).updated_at) !== (selectedRating.createdAt || (selectedRating as any).created_at)) && (
                    <div>Actualizado: {formatDate(selectedRating.updatedAt || (selectedRating as any).updated_at)}</div>
                  )}
                </div>
              </div>

              {/* Estado Actual */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Estado Actual
                </h4>
                <div className="flex items-center">
                  {(() => {
                    const status = ratingStatusMap[selectedRating.status] || {
                      label: selectedRating.status,
                      color:
                        "bg-gray-100 text-gray-800",
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
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Moderación
                  </h4>
                  <div className="mb-4">
                    <label
                      htmlFor="moderationNote"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nota de Moderación (obligatoria para rechazar)
                    </label>
                    <textarea
                      id="moderationNote"
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Razón del rechazo o notas adicionales..."
                      value={moderationNote}
                      onChange={(e) => setModerationNote(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={async () => {
                        if (!selectedRating.id) {
                          alert("ID de valoración no válido");
                          return;
                        }
                        const success = await approveRating(selectedRating.id);
                        if (success) {
                          console.log("Valoración aprobada desde modal");
                        }
                      }}
                      className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={18} className="mr-2" />
                      Aprobar
                    </button>
                    <button
                      onClick={async () => {
                        if (!selectedRating.id) {
                          alert("ID de valoración no válido");
                          return;
                        }
                        if (!moderationNote.trim()) {
                          alert("Es necesario agregar una nota de moderación para rechazar");
                          return;
                        }
                        const success = await rejectRating(selectedRating.id);
                        if (success) {
                          console.log("Valoración rechazada desde modal");
                        }
                      }}
                      className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      disabled={!moderationNote.trim()}
                    >
                      <XCircle size={18} className="mr-2" />
                      Rechazar
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRatingsPage;