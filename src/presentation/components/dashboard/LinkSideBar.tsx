import { Link, useLocation } from "react-router-dom";
import {Package} from "lucide-react";


interface LinkSidebarProps {
    path: string;
    label: string;
    icon?: React.ReactNode;
    isNotificated?: boolean;
    notificationCount?: number;
}

const LinkSidebar: React.FC<LinkSidebarProps> = ({path, label, icon, isNotificated, notificationCount}) => {
    
    const location = useLocation();

    const isActive = (path: string) => {
			return location.pathname.startsWith(path);
    };
    
	return (
		<Link
			to={path}
			className={`flex items-center px-3 py-2 rounded-md gap-3 ${
				isActive(path)
					? "bg-gray-900 text-white"
					: "text-gray-300 hover:bg-gray-950 hover:text-white"
			}`}
		>
			<div className="flex items-center">
				{icon || <Package className="w-5 h-5 mr-3" />}
				{label}
			</div>
			{isNotificated && (
				<span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
					{notificationCount ?? "!"}
				</span>
			)}
		</Link>
	);
};

export default LinkSidebar;
