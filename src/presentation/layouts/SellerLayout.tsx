import React from "react";
import type { ReactNode } from "react";
import {Package, TrendingUp} from "lucide-react";
import {DashboardProvider} from "../components/dashboard/DashboardContext";
import BaseDashboardLayout from "../components/dashboard/BaseDashboardLayout";
import sellerGroups from "./groups/sellerGroups";

/**
 * Componente de Layout para el Panel del Vendedor
 */
const SellerLayout: React.FC = () => {
	// Títulos dinámicos basados en rutas
	const pageTitles: {[key: string]: string} = {
		"/seller/dashboard": "Dashboard",
		"/seller/products": "Productos",
		"/seller/products/create": "Añadir Nuevo Producto",
		"/seller/orders": "Pedidos",
		"/seller/ratings": "Valoraciones y Reseñas",
		"/seller/messages": "Mensajes",
		"/seller/invoices": "Facturas",
		"/seller/profile": "Mi Perfil",
		"/seller/settings": "Configuración",
		"/seller/shipping": "Envíos",
		"/seller/earnings": "Ganancias",
	};

	// Título del sidebar
	const sidebarTitle = {
		title: "Portal del Vendedor",
		icon: <Package className="w-7 h-7 text-primary-400" />,
	};

	// Componente de analytics rápidos para mostrar después del header
	const SellerQuickStats = (): ReactNode => {
		// Simulamos leer datos de pendingActions del localStorage (en una app real vendría de un context o API)
		const pendingOrders = parseInt(
			localStorage.getItem("sellerPendingOrders") || "0"
		);

		// Solo mostrar si hay ventas recientes o hay pedidos pendientes
		if (pendingOrders === 0) return null;

		return (
			<div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 px-4 py-3 border-b border-primary-100 dark:border-primary-800">
				<div className="flex items-center">
					<TrendingUp className="h-5 w-5 text-primary-500 mr-2" />
					<span className="text-sm text-primary-700 dark:text-primary-300">
						Tienes <strong>{pendingOrders}</strong> pedido
						{pendingOrders !== 1 ? "s" : ""} pendiente
						{pendingOrders !== 1 ? "s" : ""} por procesar. ¡Revísalos pronto!
					</span>
				</div>
			</div>
		);
	};

	return (
		<DashboardProvider initialType="seller" initialPageTitles={pageTitles}>
			<BaseDashboardLayout
				sidebarGroups={sellerGroups}
				sidebarTitle={sidebarTitle}
				headerExtras={<SellerQuickStats />}
			/>
		</DashboardProvider>
	);
};

export default SellerLayout;
