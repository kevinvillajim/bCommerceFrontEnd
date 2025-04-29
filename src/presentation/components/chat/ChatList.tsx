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
				icon: <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />,
			};
		} else {
			// En este caso, el usuario está viendo sus propios chats con vendedores
			return {
				name: `Vendedor #${chat.sellerId}`, // Idealmente, tendríamos el nombre del vendedor
				avatar: undefined, // Y su avatar
				id: chat.sellerId,
				icon: <Store className="h-6 w-6 text-gray-500 dark:text-gray-400" />,
			};
		}
	};

	return (
		<div className="flex flex-col h-full">
			{/* Filtros y búsqueda */}
			<div className="p-4 border-b border-gray-200 dark:border-gray-700">
				<div className="mb-2 relative">
					<input
						type="text"
						placeholder="Buscar conversaciones..."
						className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
						value={searchTerm}
						onChange={(e) => onSearchChange(e.target.value)}
					/>
					<Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
				</div>
				<div className="flex items-center justify-between mt-3">
					<div className="flex items-center space-x-2">
						<Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
						<select
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
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
							className="ml-2 text-sm text-gray-700 dark:text-gray-300"
						>
							Solo no leídos
						</label>
					</div>
				</div>
			</div>

			{/* Lista de conversaciones */}
			<div className="flex-1 overflow-y-auto">
				{loading ? (
					<div className="flex justify-center items-center h-full">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
					</div>
				) : chats.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full p-6 text-center">
						<div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
							{isSeller ? (
								<User className="h-8 w-8 text-gray-500 dark:text-gray-400" />
							) : (
								<Store className="h-8 w-8 text-gray-500 dark:text-gray-400" />
							)}
						</div>
						<h3 className="text-lg font-medium text-gray-900 dark:text-white">
							No hay conversaciones
						</h3>
						<p className="text-gray-500 dark:text-gray-400 mt-2">
							{searchTerm || statusFilter !== "all" || unreadFilter
								? "No se encontraron resultados con los filtros actuales"
								: isSeller
									? "Cuando los clientes inicien conversaciones, aparecerán aquí"
									: "Inicia una conversación con un vendedor desde la página de un producto"}
						</p>
					</div>
				) : (
					<ul>
						{chats.map((chat) => {
							const participant = getChatParticipant(chat);
							return (
								<li
									key={chat.id}
									className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
										selectedChatId === chat.id
											? "bg-primary-50 dark:bg-primary-900/30"
											: ""
									}`}
									onClick={() => onSelectChat(chat)}
								>
									<div className="px-4 py-3 flex items-start">
										{/* Avatar */}
										<div className="flex-shrink-0 mr-3">
											{participant.avatar ? (
												<img
													src={participant.avatar}
													alt={participant.name}
													className="h-10 w-10 rounded-full"
													onError={(e) => {
														const target = e.target as HTMLImageElement;
														target.onerror = null;
														target.src =
															"https://via.placeholder.com/40?text=U";
													}}
												/>
											) : (
												<div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
													{participant.icon}
												</div>
											)}
										</div>

										{/* Contenido */}
										<div className="flex-1 min-w-0">
											<div className="flex justify-between">
												<p className="text-sm font-medium text-gray-900 dark:text-white truncate">
													{participant.name}
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">
													{formatDate(chat.updatedAt)}
												</p>
											</div>
											<div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
												<Package className="h-3 w-3 mr-1" />
												<span className="truncate">
													{chat.product?.name || `Producto #${chat.productId}`}
												</span>
											</div>
											<div className="flex items-center mt-1">
												<span
													className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
														chat.status === "active"
															? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
															: chat.status === "closed"
																? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
																: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
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
												<p className="text-sm text-gray-600 dark:text-gray-300 truncate">
													{chat.lastMessage?.content || "Sin mensajes"}
												</p>
											</div>
										</div>

										{/* Indicadores de no leídos */}
										{chat.unreadCount && chat.unreadCount > 0 && (
											<div className="ml-2 flex-shrink-0">
												<span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary-600 text-white text-xs font-medium">
													{chat.unreadCount}
												</span>
											</div>
										)}
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</div>
		</div>
	);
};

export default ChatList;
