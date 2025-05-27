import React from "react";
import type { ReactNode } from "react";
import {NavLink, useLocation} from "react-router-dom";
import {X} from "lucide-react";

interface SidebarLinkProps {
	path: string;
	label: string;
	icon?: ReactNode;
	isNotificated?: boolean;
	notificationCount?: number;
}

interface SidebarGroupProps {
	title: string;
	links: SidebarLinkProps[];
}

interface SidebarTitleProps {
	title: string;
	icon: ReactNode;
}

interface SidebarProps {
	/**
	 * Grupos de enlaces para el sidebar
	 */
	groups: SidebarGroupProps[];

	/**
	 * Título e icono del sidebar
	 */
	title: SidebarTitleProps;

	/**
	 * Estado de apertura del sidebar (para móvil)
	 */
	isOpen?: boolean;

	/**
	 * Función para cambiar el estado de apertura del sidebar
	 */
	toggleSidebar?: () => void;
}

/**
 * Componente de enlace individual para el sidebar
 */
const SidebarLink: React.FC<SidebarLinkProps> = ({
	path,
	label,
	icon,
	isNotificated,
	notificationCount,
}) => {
	return (
		<NavLink
			to={path}
			className={({isActive}) =>
				`flex items-center px-4 py-2 mt-2 text-sm transition-colors duration-200 rounded-lg ${
					isActive
						? "bg-primary-100 text-primary-700"
						: "text-gray-600 hover:bg-gray-200"
				}`
			}
		>
			{icon}
			<span className="mx-1">{label}</span>
			{isNotificated && notificationCount && notificationCount > 0 && (
				<span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-500 rounded-full">
					{notificationCount}
				</span>
			)}
		</NavLink>
	);
};

/**
 * Componente de barra lateral para dashboards
 */
const Sidebar: React.FC<SidebarProps> = ({
	groups,
	title,
	isOpen = true,
	toggleSidebar = () => {},
}) => {
	const location = useLocation();

	return (
		<aside
			className={`bg-white fixed md:static inset-y-0 left-0 z-30 w-64 transition-transform duration-300 transform ${
				isOpen ? "translate-x-0" : "-translate-x-full"
			} md:translate-x-0 overflow-y-auto`}
		>
			{/* Header del Sidebar */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
				<div className="flex items-center">
					{title.icon}
					<h2 className="text-lg font-semibold text-gray-900 ml-2">
						{title.title}
					</h2>
				</div>
				<button
					onClick={toggleSidebar}
					className="p-1 rounded-md text-gray-500 md:hidden hover:text-gray-900 hover:bg-gray-100"
				>
					<X size={20} />
				</button>
			</div>

			{/* Contenido del Sidebar */}
			<div className="p-4">
				{groups.map((group, index) => (
					<div key={index} className="mb-6">
						<h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
							{group.title}
						</h3>
						<div className="mt-2">
							{group.links.map((link, linkIndex) => (
								<SidebarLink key={linkIndex} {...link} />
							))}
						</div>
					</div>
				))}
			</div>
		</aside>
	);
};

export default Sidebar;
