import React, {useState, useEffect} from "react";
import type {ReactNode} from "react";
import {Shield, AlertTriangle} from "lucide-react";
import {DashboardProvider} from "../components/dashboard/DashboardContext";
import BaseDashboardLayout from "../components/dashboard/BaseDashboardLayout";
import adminGroups from "./groups/adminGroups";
import type {Notification, PendingActions} from "../components/dashboard";

/**
 * Componente de Layout para el Panel de Administración
 */
const AdminLayout: React.FC = () => {
	const [pendingActions, setPendingActions] = useState<PendingActions>({
		ratings: 0,
		feedback: 0,
		sellerRequests: 0,
	});

	const [notifications, setNotifications] = useState<Notification[]>([]);

	// Títulos dinámicos basados en rutas
	const pageTitles: {[key: string]: string} = {
		"/admin/dashboard": "Dashboard",
		"/admin/users": "Gestión de Usuarios",
		"/admin/sellers": "Gestión de Vendedores",
		"/admin/products": "Gestión de Productos",
		"/admin/categories": "Gestión de Categorías",
		"/admin/orders": "Gestión de Pedidos",
		"/admin/ratings": "Moderación de Valoraciones y Reseñas",
		"/admin/feedback": "Gestión de Comentarios",
		"/admin/discounts": "Códigos de Descuento",
		"/admin/invoices": "Facturas",
		"/admin/accounting": "Contabilidad",
		"/admin/settings": "Configuración del Sistema",
		"/admin/logs": "Registro de Errores",
	};

	// Título del sidebar
	const sidebarTitle = {
		title: "Panel de Administración (Admin)",
		icon: <Shield className="w-7 h-7 text-primary-400" />,
	};

	// Obtener acciones pendientes y notificaciones
	useEffect(() => {
		const fetchPendingActions = async () => {
			try {
				// Simulación de llamadas a API
				// En una aplicación real, estas serían llamadas reales a la API
				setPendingActions({
					ratings: Math.floor(Math.random() * 6),
					feedback: Math.floor(Math.random() * 4),
					sellerRequests: Math.floor(Math.random() * 3),
				});

				// Cargar notificaciones de ejemplo
				setNotifications([
					{
						id: "1",
						title: "Nueva solicitud de verificación de vendedor",
						description: 'El vendedor "TechGadgets" necesita aprobación',
						time: "Hace 5 minutos",
						read: false,
						type: "warning",
					},
					{
						id: "2",
						title: "Reseña necesita moderación",
						description:
							'Nueva valoración de 1 estrella para "Auriculares Inalámbricos"',
						time: "Hace 30 minutos",
						read: true,
					},
					{
						id: "3",
						title: "Alerta del sistema",
						description: "Problemas de conectividad con la pasarela de pago",
						time: "Hace 1 hora",
						read: true,
					},
				]);
			} catch (error) {
				console.error("Error al obtener datos:", error);
			}
		};

		fetchPendingActions();
	}, []);

	// Componente de alertas del sistema para mostrar en el header
	const SystemAlertsHeader = (): ReactNode => {
		// Simulación de una alerta a nivel de sistema
		const hasSystemAlert =
			pendingActions.ratings > 3 || pendingActions.feedback > 2;

		if (!hasSystemAlert) return null;

		return (
			<div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2">
				<div className="flex items-center">
					<AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
					<span className="text-sm text-amber-800 dark:text-amber-200">
						Hay acciones pendientes que requieren tu atención en el panel de
						administración.
					</span>
				</div>
			</div>
		);
	};

	return (
		<DashboardProvider initialType="admin" initialPageTitles={pageTitles}>
			<BaseDashboardLayout
				sidebarGroups={adminGroups}
				sidebarTitle={sidebarTitle}
				headerExtras={<SystemAlertsHeader />}
			/>
		</DashboardProvider>
	);
};

export default AdminLayout;
