import React, {useState, useMemo} from "react";
import {User, Package, Store, Circle, Search, Filter, MessageSquare, Archive, Clock} from "lucide-react";
import type {Chat} from "../../../core/domain/entities/Chat";
import {formatDistanceToNow} from "date-fns";
import {es} from "date-fns/locale";

interface ChatListProps {
	chats: Chat[];
	selectedChatId?: number;
	onSelectChat: (chat: Chat) => void;
	loading: boolean;
	searchTerm: string;
	onSearchChange: (value: string) => void;
	statusFilter: string;
	onStatusFilterChange: (value: string) => void;
	unreadFilter: boolean;
	onUnreadFilterChange: (value: boolean) => void;
	isSeller?: boolean;
	// Nueva prop para tabs
	showTabs?: boolean;
}

const ChatList: React.FC<ChatListProps> = ({
	chats,
	selectedChatId,
	onSelectChat,
	loading,
	searchTerm,
	onSearchChange,
	statusFilter,
	onStatusFilterChange,
	unreadFilter,
	onUnreadFilterChange,
	isSeller = false,
	showTabs = true,
}) => {
	// Estado local para la pestaña activa
	const [activeTab, setActiveTab] = useState<string>('active');

	// Contar chats por estado
	const chatCounts = useMemo(() => {
		const counts = {
			active: 0,
			closed: 0,
			archived: 0,
			all: chats.length
		};

		chats.forEach(chat => {
			if (chat.status === 'active') counts.active++;
			else if (chat.status === 'closed') counts.closed++;
			else if (chat.status === 'archived') counts.archived++;
		});

		return counts;
	}, [chats]);

	// Pestañas disponibles
	const tabs = [
		{ id: 'active', label: 'Activos', icon: MessageSquare, count: chatCounts.active },
		{ id: 'closed', label: 'Cerrados', icon: Clock, count: chatCounts.closed },
		{ id: 'archived', label: 'Archivados', icon: Archive, count: chatCounts.archived },
	];

	// Filtrar chats por pestaña activa
	const chatsByTab = chats.filter(chat => {
		if (activeTab === 'all') return true;
		return chat.status === activeTab;
	});

	// Aplicar filtros adicionales a los chats filtrados por tab
	const filteredChats = chatsByTab.filter((chat) => {
		// Filtro por estado (solo si showTabs es false)
		const matchesStatus = showTabs || statusFilter === "all" || chat.status === statusFilter;

		// Filtro por mensajes no leídos
		const matchesUnread = unreadFilter ? chat.unreadCount > 0 : true;

		// Búsqueda por nombre de vendedor o producto
		const matchesSearch =
			searchTerm === "" ||
			(chat.product?.name &&
				chat.product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(isSeller 
				? chat.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
				: chat.seller?.storeName?.toLowerCase().includes(searchTerm.toLowerCase()));

		return matchesStatus && matchesUnread && matchesSearch;
	});

	// Formatear fecha relativa
	const formatDate = (dateString: string | undefined) => {
		if (!dateString) return "fecha desconocida";

		try {
			return formatDistanceToNow(new Date(dateString), {
				addSuffix: true,
				locale: es,
			});
		} catch (error) {
			return "fecha desconocida";
		}
	};

	// Obtener el nombre y avatar del interlocutor según el rol
	const getChatParticipant = (chat: Chat) => {
		if (isSeller) {
			return {
				name: chat.user?.name || `Cliente #${chat.userId}`,
				avatar: chat.user?.avatar,
				id: chat.userId,
				icon: <User className="h-6 w-6 text-gray-500" />,
			};
		} else {
			return {
				name: chat.seller?.storeName || `Vendedor #${chat.sellerId}`,
				avatar: chat.seller?.avatar,
				id: chat.sellerId,
				icon: <Store className="h-6 w-6 text-gray-500" />,
			};
		}
	};

	return (
		<div className="flex flex-col h-full bg-white">
			{/* Pestañas - Solo mostrar si showTabs es true */}
			{showTabs && (
				<div className="border-b border-gray-200 bg-gray-50">
					<div className="flex">
						{tabs.map((tab) => {
							const Icon = tab.icon;
							const isActive = activeTab === tab.id;
							return (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
										isActive
											? 'text-primary-600 border-primary-500 bg-white'
											: 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
									}`}
								>
									<Icon className={`h-4 w-4 mr-2 ${
										isActive ? 'text-primary-500' : 'text-gray-400'
									}`} />
									{tab.label}
									{tab.count > 0 && (
										<span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
											isActive
												? 'bg-primary-100 text-primary-600'
												: 'bg-gray-200 text-gray-600'
										}`}>
											{tab.count}
										</span>
									)}
								</button>
							);
						})}
					</div>
				</div>
			)}

			{/* Filtros y búsqueda - Diseño mejorado */}
			<div className="p-4 bg-white border-b border-gray-100">
				{/* Barra de búsqueda */}
				<div className="relative mb-3">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
					<input
						type="text"
						placeholder="Buscar conversaciones..."
						className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
						value={searchTerm}
						onChange={(e) => onSearchChange(e.target.value)}
					/>
				</div>

				{/* Filtros adicionales */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						{!showTabs && (
							<div className="flex items-center space-x-2">
								<Filter className="h-4 w-4 text-gray-500" />
								<select
									className="border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
									value={statusFilter}
									onChange={(e) => onStatusFilterChange(e.target.value)}
								>
									<option value="all">Todos los estados</option>
									<option value="active">Activos</option>
									<option value="closed">Cerrados</option>
									<option value="archived">Archivados</option>
								</select>
							</div>
						)}
					</div>

					{/* Filtro de no leídos */}
					<div className="flex items-center">
						<label className="flex items-center cursor-pointer">
							<input
								type="checkbox"
								className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
								checked={unreadFilter}
								onChange={(e) => onUnreadFilterChange(e.target.checked)}
							/>
							<span className="ml-2 text-sm text-gray-700">Solo no leídos</span>
						</label>
					</div>
				</div>
			</div>

			{/* Lista de conversaciones - Diseño mejorado */}
			<div className="flex-1 overflow-y-auto">
				{loading ? (
					<div className="flex justify-center items-center h-full">
						<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
					</div>
				) : filteredChats.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full p-8 text-center">
						<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
							{isSeller ? (
								<User className="h-8 w-8 text-gray-400" />
							) : (
								<Store className="h-8 w-8 text-gray-400" />
							)}
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							No hay conversaciones
						</h3>
						<p className="text-gray-500 max-w-sm">
							{searchTerm || statusFilter !== "all" || unreadFilter
								? "No se encontraron resultados con los filtros actuales"
								: isSeller
									? "Cuando los clientes inicien conversaciones, aparecerán aquí"
									: "Inicia una conversación con un vendedor desde la página de un producto"}
						</p>
					</div>
				) : (
					<div className="divide-y divide-gray-100">
						{filteredChats.map((chat) => {
							const participant = getChatParticipant(chat);
							const chatId = chat.id || 0;

							return (
								<div
									key={`chat-${chatId}`}
									className={`p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 border-l-4 group ${
										selectedChatId === chatId
											? "bg-primary-50 border-l-primary-500 shadow-sm"
											: "border-l-transparent hover:border-l-primary-200"
									}`}
									onClick={() => onSelectChat(chat)}
								>
									<div className="flex items-start">
										{/* Avatar mejorado */}
										<div className="flex-shrink-0 mr-3 relative">
											{participant.avatar ? (
												<img
													src={participant.avatar}
													alt={participant.name}
													className="h-12 w-12 rounded-full border-2 border-white shadow-sm group-hover:shadow-md transition-shadow"
													onError={(e) => {
														const target = e.target as HTMLImageElement;
														target.onerror = null;
														target.src = "https://via.placeholder.com/48?text=U";
													}}
												/>
											) : (
												<div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-white shadow-sm group-hover:shadow-md transition-shadow">
													{participant.icon}
												</div>
											)}
										</div>

										{/* Contenido del chat */}
										<div className="flex-1 min-w-0">
											<div className="flex justify-between items-start mb-2">
												<h3 className={`text-sm font-medium truncate pr-2 transition-colors ${
													selectedChatId === chatId ? 'text-primary-700' : 'text-gray-900 group-hover:text-primary-600'
												}`}>
													{participant.name}
												</h3>
												<div className="flex items-center space-x-2 flex-shrink-0">
													<span className="text-xs text-gray-500">
														{formatDate(chat.updatedAt)}
													</span>
													{/* Indicador de no leídos - CORREGIDO: solo mostrar si > 0 */}
													{chat.unreadCount > 0 && (
														<span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary-600 text-white text-xs font-medium animate-pulse">
															{chat.unreadCount > 99 ? '99+' : chat.unreadCount}
														</span>
													)}
												</div>
											</div>
											
											{/* Información del producto */}
											<div className="flex items-center text-xs text-gray-500 mb-2">
												<Package className="h-3 w-3 mr-1 flex-shrink-0" />
												<span className="truncate">
													{chat.product?.name || `Producto #${chat.productId}`}
												</span>
											</div>
											
											{/* Estado y último mensaje */}
											<div className="flex items-center justify-between">
												<div className="flex items-center min-w-0 flex-1">
													<span
														className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mr-2 flex-shrink-0 ${
															chat.status === "active"
																? "bg-green-100 text-green-800"
																: chat.status === "closed"
																	? "bg-blue-100 text-blue-800"
																	: "bg-gray-100 text-gray-800"
														}`}
													>
														<Circle
															className="w-1.5 h-1.5 mr-1"
															fill="currentColor"
														/>
														{chat.status === "active"
															? "Activo"
															: chat.status === "closed"
																? "Cerrado"
																: "Archivado"}
													</span>
												</div>
											</div>
											
											{/* Último mensaje */}
											<div className="mt-1">
												<p className="text-sm text-gray-600 truncate">
													{chat.lastMessage?.content || "Sin mensajes"}
												</p>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Contador de resultados */}
			{filteredChats.length > 5 && (
				<div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
					<span className="text-xs text-gray-500">
						{filteredChats.length} conversación{filteredChats.length !== 1 ? 'es' : ''}
						{showTabs && activeTab !== 'all' && ` ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}`}
					</span>
				</div>
			)}
		</div>
	);
};

export default ChatList;
