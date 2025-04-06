import { useState, type ReactNode } from "react";
import GroupLinkSidebar from "./GroupLinkSideBar";
import {
	X,
} from "lucide-react";
import { Link } from "react-router-dom";

interface SidebarProps {
	groups: {
		title: string;
		links: {
			path: string;
			label: string;
			icon?: React.ReactNode;
			isNotificated?: boolean;
			notificationCount?: number;
		}[];
    }[];
    title: {
        title: string;
        icon: ReactNode;
    }
}

const Sidebar: React.FC<SidebarProps> = ({groups, title}) => {
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

     const toggleSidebar = () => {
				setIsSidebarOpen(!isSidebarOpen);
			};

    return (
			<aside
				className={`bg-primary-900 dark:bg-primary-950 text-white w-64 transition-all duration-300 ease-in-out ${
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				} fixed md:relative inset-y-0 left-0 z-30 flex flex-col`}
			>
				{/* Logo and brand */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
					<Link to="/admin/dashboard" className="flex items-center space-x-2">
						{title.icon}
						<span className="text-xl font-bold">
							{title.title}
						</span>
					</Link>
					<button
						className="md:hidden text-gray-400 hover:text-white"
						onClick={toggleSidebar}
					>
						<X size={20} />
					</button>
				</div>

				{/* Navigation links */}
				<nav className="flex-1 px-4 py-6 overflow-y-auto">
                <div className="space-y-8">
                    {groups.map((group, key) => (
                            <GroupLinkSidebar key={key} title={group.title} links={group.links}/>
                        ))}
					</div>
				</nav>
			</aside>
		);
}

export default Sidebar