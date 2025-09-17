import React, { useMemo } from "react";
import type { ReactNode } from "react";
import { CreditCard } from "lucide-react";
import { DashboardProvider } from "../components/dashboard/DashboardContext";
import BaseDashboardLayout from "../components/dashboard/BaseDashboardLayout";
import paymentGroups from "./groups/paymentGroups";

/**
 * Componente de Layout para el Panel de Pagos
 */
const PaymentLayout: React.FC = () => {

	// Títulos dinámicos basados en rutas
	const pageTitles: {[key: string]: string} = {
		"/payment/dashboard": "Dashboard",
		"/payment/create": "Crear Link de Pago",
		"/payment/links": "Mis Links de Pago",
	};

	// Título del sidebar
	const sidebarTitle = {
		title: "Panel de Pagos",
		icon: <CreditCard className="w-7 h-7 text-primary-400" />,
	};

	// Grupos del sidebar simplificados (sin notificaciones complejas)
	const dynamicPaymentGroups = useMemo(() => {
		return paymentGroups.map(group => ({
			...group,
			links: group.links.map(link => ({
				...link,
				notificationCount: 0,
				isNotificated: false
			}))
		}));
	}, []);

	// Componente simplificado para header de pagos
	const PaymentHeader = (): ReactNode => {
		// Panel de pagos no necesita alertas complejas por ahora
		return null;
	};

	return (
		<DashboardProvider initialType="payment" initialPageTitles={pageTitles}>
			<BaseDashboardLayout
				sidebarGroups={dynamicPaymentGroups}
				sidebarTitle={sidebarTitle}
				headerExtras={<PaymentHeader />}
			/>
		</DashboardProvider>
	);
};

export default PaymentLayout;
