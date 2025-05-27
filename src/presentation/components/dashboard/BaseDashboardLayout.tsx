import type { ReactNode } from "react";
import {Outlet} from "react-router-dom";
import Sidebar from "../dashboard/SideBar";
import DashboardHeader from "./DashboardHeader";
import DashboardFooter from "./DashboardFooter";
import {useDashboard} from "./DashboardContext";

interface GroupItem {
	title: string;
	links: {
		path: string;
		label: string;
		icon?: React.ReactNode;
		isNotificated?: boolean;
		notificationCount?: number;
	}[];
}

interface Title {
	title: string;
	icon: React.ReactNode;
}

interface BaseDashboardLayoutProps {
	/**
	 * Grupos de menú para el sidebar
	 */
	sidebarGroups: GroupItem[];

	/**
	 * Título del sidebar
	 */
	sidebarTitle: Title;

	/**
	 * Componentes adicionales para insertar después del header
	 */
	headerExtras?: ReactNode;

	/**
	 * Componentes adicionales para insertar antes del footer
	 */
	footerExtras?: ReactNode;
}

/**
 * Layout base para implementar en AdminLayout, SellerLayout y otros layouts de dashboard
 */
const BaseDashboardLayout: React.FC<BaseDashboardLayoutProps> = ({
	sidebarGroups,
	sidebarTitle,
	headerExtras,
	footerExtras,
}) => {
	const {
		isSidebarOpen,
		toggleSidebar,
		notifications,
		unreadNotificationsCount,
		markAllNotificationsAsRead,
		pendingActions,
		dashboardType,
	} = useDashboard();


	return (
		<div className="flex h-screen bg-gray-100">
			{/* Sidebar */}
			<Sidebar
				groups={sidebarGroups}
				title={sidebarTitle}
				isOpen={isSidebarOpen}
				toggleSidebar={toggleSidebar}
			/>

			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Header */}
				<DashboardHeader
					toggleSidebar={toggleSidebar}
					isAdmin={dashboardType === "admin"}
					unreadNotifications={unreadNotificationsCount}
					notifications={notifications}
					pendingActions={pendingActions}
					onReadAllNotifications={markAllNotificationsAsRead}
				/>

				{/* Header extras - componentes adicionales que pueden ser inyectados */}
				{headerExtras && headerExtras}

				{/* Main Content */}
				<main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
					<Outlet />
				</main>

				{/* Footer extras - componentes adicionales que pueden ser inyectados */}
				{footerExtras && footerExtras}

				{/* Footer */}
				<DashboardFooter type={dashboardType} />
			</div>
		</div>
	);
};

export default BaseDashboardLayout;
