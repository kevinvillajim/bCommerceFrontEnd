import React, { useMemo } from "react";
import type { ReactNode } from "react";
import { Shield, AlertTriangle } from "lucide-react";
import { DashboardProvider } from "../components/dashboard/DashboardContext";
import BaseDashboardLayout from "../components/dashboard/BaseDashboardLayout";
import adminGroups from "./groups/adminGroups";
import { useAdminNotifications } from "../hooks/useAdminNotifications";

/**
 * Componente de Layout para el Panel de Administración
 */
const AdminLayout: React.FC = () => {
	// Hook para obtener contadores de notificaciones automáticas
	const { counts } = useAdminNotifications();

	// Títulos dinámicos basados en rutas
	const pageTitles: {[key: string]: string} = {
		"/admin/dashboard": "Dashboard",
		"/admin/users": "Gestión de Usuarios",
		"/admin/sellers": "Gestión de Vendedores",
		"/admin/solicitudes": "Solicitudes de Vendedor",
		"/admin/products": "Gestión de Productos",
		"/admin/categories": "Gestión de Categorías",
		"/admin/orders": "Gestión de Pedidos",
		"/admin/ratings": "Moderación de Valoraciones y Reseñas",
		"/admin/feedback": "Gestión de Comentarios",
		"/admin/discounts": "Códigos de Descuento",
		"/admin/invoices": "Facturas",
		"/admin/credit-notes": "Notas de Crédito",
		"/admin/accounting": "Contabilidad",
		"/admin/external-payments": "Pagos Externos",
		"/admin/settings": "Configuración del Sistema",
		"/admin/logs": "Registro de Errores",
	};

	// Título del sidebar
	const sidebarTitle = {
		title: "Panel de Administración (Admin)",
		icon: <Shield className="w-7 h-7 text-primary-400" />,
	};

	// Grupos del sidebar con contadores dinámicos
	const dynamicAdminGroups = useMemo(() => {
		return adminGroups.map(group => ({
			...group,
			links: group.links.map(link => {
				let notificationCount = 0;
				
				// Asignar contadores según la ruta
				switch (link.path) {
					case "/admin/users":
						notificationCount = counts.users;
						break;
					case "/admin/sellers":
						notificationCount = counts.sellers;
						break;
					case "/admin/solicitudes":
						notificationCount = counts.solicitudes;
						break;
					case "/admin/orders":
						notificationCount = counts.orders;
						break;
					case "/admin/shipping":
						notificationCount = counts.shipping;
						break;
					case "/admin/ratings":
						notificationCount = counts.ratings;
						break;
					case "/admin/feedback":
						notificationCount = counts.feedback;
						break;
					case "/admin/logs":
						notificationCount = counts.logs;
						break;
					case "/admin/invoices":
						notificationCount = counts.invoices;
						break;
					default:
						notificationCount = (link as any).notificationCount || 0;
				}
				
				return {
					...link,
					notificationCount,
					isNotificated: notificationCount > 0
				};
			})
		}));
	}, [counts]);

	// Componente de alertas del sistema para mostrar en el header
	const SystemAlertsHeader = (): ReactNode => {
		// Calcular total de notificaciones críticas
		const totalCritical = counts.logs + counts.feedback + counts.solicitudes;
		const totalModerate = counts.ratings + counts.orders + counts.invoices;
		const totalNotifications = Object.values(counts).reduce((sum, count) => sum + count, 0);

		if (totalNotifications === 0) return null;

		// Determinar nivel de alerta
		const isHighPriority = totalCritical > 0;
		const alertClass = isHighPriority 
			? "bg-red-50 border-b border-red-200" 
			: "bg-amber-50 border-b border-amber-200";
		const iconClass = isHighPriority ? "text-red-500" : "text-amber-500";
		const textClass = isHighPriority ? "text-red-800" : "text-amber-800";

		return (
			<div className={alertClass + " px-4 py-2"}>
				<div className="flex items-center">
					<AlertTriangle className={`h-5 w-5 ${iconClass} mr-2`} />
					<span className={`text-sm ${textClass}`}>
						{isHighPriority ? (
							<>
								<strong>¡Atención!</strong> Tienes {totalCritical} notificación{totalCritical !== 1 ? 'es' : ''} crítica{totalCritical !== 1 ? 's' : ''} 
								{totalModerate > 0 && ` y ${totalModerate} adicionales`} pendientes.
							</>
						) : (
							<>
								Tienes <strong>{totalNotifications}</strong> notificación{totalNotifications !== 1 ? 'es' : ''} 
								pendiente{totalNotifications !== 1 ? 's' : ''} en el panel de administración.
							</>
						)}
					</span>
				</div>
			</div>
		);
	};

	return (
		<DashboardProvider initialType="admin" initialPageTitles={pageTitles}>
			<BaseDashboardLayout
				sidebarGroups={dynamicAdminGroups}
				sidebarTitle={sidebarTitle}
				headerExtras={<SystemAlertsHeader />}
			/>
		</DashboardProvider>
	);
};

export default AdminLayout;
