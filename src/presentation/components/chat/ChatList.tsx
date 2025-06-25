import React from "react";
import {User, Package, Store, Circle, Search, Filter} from "lucide-react";
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
}) => {
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
			// En este caso, el usuario está viendo sus propios chats con vendedores
			return {
				name: chat.seller?.storeName || `Vendedor #${chat.sellerId}`,
				avatar: chat.seller?.avatar,
				id: chat.sellerId,
				icon: <Store className="h-6 w-6 text-gray-500" />,
			};
		}
	};

	return (
		<div className="flex flex-col h-full">
			{/* Filtros y búsqueda */}
			<div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
				<div className="mb-2 relative">
					<input
						type="text"
						placeholder="Buscar conversaciones..."
						className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
						value={searchTerm}
						onChange={(e) => onSearchChange(e.target.value)}
					/>
					<Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
				</div>
				<div className="flex items-center justify-between mt-3">
					<div className="flex items-center space-x-2">
						<Filter className="h-5 w-5 text-gray-500" />
						<select
							className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={statusFilter}
							onChange={(e) => onStatusFilterChange(e.target.value)}
						>
							<option value="all">Todos</option>
							<option value="active">Activos</option>
							<option value="closed">Cerrados</option>
							<option value="archived">Archivados</option>
						</select>
					</div>
					<div className="flex items-center">
						<input
							type="checkbox"
							id="unreadOnly"
							className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
							checked={unreadFilter}
							onChange={(e) => onUnreadFilterChange(e.target.checked)}
						/>
						<label
							htmlFor="unreadOnly"
							className="ml-2 text-sm text-gray-700"
						>
							Solo no leídos
						</label>
					</div>
				</div>
			</div>

			{/* Lista de conversaciones con scroll personalizado */}
			<div className="flex-1 overflow-y-auto custom-scrollbar">
				{loading ? (
					<div className="flex justify-center items-center h-full">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
					</div>
				) : chats.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full p-6 text-center">
						<div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
							{isSeller ? (
								<User className="h-8 w-8 text-gray-500" />
							) : (
								<Store className="h-8 w-8 text-gray-500" />
							)}
						</div>
						<h3 className="text-lg font-medium text-gray-900">
							No hay conversaciones
						</h3>
						<p className="text-gray-500 mt-2">
							{searchTerm || statusFilter !== "all" || unreadFilter
								? "No se encontraron resultados con los filtros actuales"
								: isSeller
									? "Cuando los clientes inicien conversaciones, aparecerán aquí"
									: "Inicia una conversación con un vendedor desde la página de un producto"}
						</p>
					</div>
				) : (
					<div className="divide-y divide-gray-200">
						{chats.map((chat) => {
							const participant = getChatParticipant(chat);
							// Asegurar que cada chat tiene un id válido
							const chatId = chat.id || 0;

							return (
								<div
									key={`chat-${chatId}`}
									className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
										selectedChatId === chatId
											? "bg-primary-50 border-l-primary-500"
											: "border-l-transparent hover:border-l-gray-300"
									}`}
									onClick={() => onSelectChat(chat)}
								>
									<div className="flex items-start">
										{/* Avatar */}
										<div className="flex-shrink-0 mr-3">
											{participant.avatar ? (
												<img
													src={participant.avatar}
													alt={participant.name}
													className="h-12 w-12 rounded-full border-2 border-white shadow-sm"
													onError={(e) => {
														const target = e.target as HTMLImageElement;
														target.onerror = null;
														target.src =
															"https://via.placeholder.com/48?text=U";
													}}
												/>
											) : (
												<div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
													{participant.icon}
												</div>
											)}
										</div>

										{/* Contenido del chat */}
										<div className="flex-1 min-w-0">
											<div className="flex justify-between items-start mb-1">
												<h3 className={`text-sm font-medium truncate pr-2 ${
													selectedChatId === chatId ? 'text-primary-700' : 'text-gray-900'
												}`}>
													{participant.name}
												</h3>
												<div className="flex items-center space-x-2 flex-shrink-0">
													<span className="text-xs text-gray-500">
														{formatDate(chat.updatedAt)}
													</span>
													{/* Indicador de no leídos */}
													{chat.unreadCount && chat.unreadCount > 0 && (
														<span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary-600 text-white text-xs font-medium">
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
											
											{/* Último mensaje y estado */}
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

			{/* Indicador de scroll */}
			{chats.length > 10 && (
				<div className="p-2 border-t border-gray-200 bg-gray-50 text-center">
					<span className="text-xs text-gray-500">
						{chats.length} conversaciones • Desliza para ver más
					</span>
				</div>
			)}
		</div>
	);
};

export default ChatList;