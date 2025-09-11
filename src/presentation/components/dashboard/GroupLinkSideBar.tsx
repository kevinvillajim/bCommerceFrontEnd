import LinkSidebar from "./LinkSideBar";

interface LinkItem {
	path: string;
	label: string;
	icon?: React.ReactNode;
	isNotificated?: boolean;
	notificationCount?: number;
}

interface GroupLinkSidebarProps{
    links: LinkItem[];
    title: string;
}



const GroupLinkSidebar: React.FC<GroupLinkSidebarProps> = ({links, title}) => {
    return (
			<div className="space-y-2">
				<h3 className="px-3 text-xs font-semibold text-gray-400 uppercase">
					{title}
				</h3>

				{links.map((link, key) => (
					<LinkSidebar
						key={key}
						path={link.path}
						label={link.label}
						icon={link.icon}
                        isNotificated={link.isNotificated}
                        notificationCount={link.notificationCount}
					/>
				))}
			</div>
		);
};

export default GroupLinkSidebar

