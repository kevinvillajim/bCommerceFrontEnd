// Componentes de dashboard
export {default as Sidebar} from "./SideBar";
export {default as DashboardHeader} from "./DashboardHeader";
export {default as DashboardFooter} from "./DashboardFooter";
export {default as BaseDashboardLayout} from "./BaseDashboardLayout";

// Tipos exportados
export type {Notification, PendingActions} from "./DashboardHeader";

// Constantes y utilidades específicas del dashboard
export const DASHBOARD_TYPES = {
	ADMIN: "admin",
	SELLER: "seller",
	CUSTOMER: "customer",
	PAYMENT: "payment",
} as const;

export type DashboardType =
	(typeof DASHBOARD_TYPES)[keyof typeof DASHBOARD_TYPES];
