// src/presentation/components/chat/ChatHeader.tsx - ESTADO DE CONEXIÓN REAL

import React, {useState, useRef, useEffect, useMemo, useCallback} from "react";
import {Link} from "react-router-dom";
import {
	User,
	Store,
	Package,
	ChevronRight,
	Circle,
	MoreVertical,
	Wifi,
	WifiOff,
	Clock,
	RotateCcw,
	Archive,
	Eye,
	Box,
} from "lucide-react";
import type {Chat} from "../../../core/domain/entities/Chat";
import { useRealTimeChat } from "../../hooks/useRealTimeChat";

interface ChatHeaderProps {
	chat: Chat;
	isSeller?: boolean;
	onUpdateStatus: (
		chatId: number,
		status: "active" | "closed" | "archived"
	) => Promise<boolean>;
	loading: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
	chat,
	isSeller = false,
	onUpdateStatus,
	loading,
}) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// Determinar el participante según el rol - OPTIMIZADO
	const participant = useMemo(() => {
		return isSeller
			? {
					name: chat.user?.name || `Cliente #${chat.userId}`,
					avatar: chat.user?.avatar,
					id: chat.userId,
					icon: <User className="h-6 w-6 text-gray-500" />,
					route: `/admin/users/${chat.userId}`,
				}
			: {
					name: chat.seller?.storeName || `Vendedor #${chat.sellerId}`,
					avatar: chat.seller?.avatar,
					id: chat.sellerId,
					icon: <Store className="h-6 w-6 text-gray-500" />,
					route: `/sellers/${chat.sellerId}`,
				};
	}, [isSeller, chat.user, chat.userId, chat.seller, chat.sellerId]);

	// Estados de conexión y escritura usando el hook real - OPTIMIZADO
	const { onlineStatus } = useRealTimeChat({
		chatId: chat.id,
		participantId: participant.id,
		pollInterval: 60000, // Reducido a 60 segundos
		enableTypingIndicator: true
	});

	const { isOnline, lastSeen, isTyping } = onlineStatus;

	// Ruta al producto - OPTIMIZADA
	const productRoute = useMemo(() => {
		return isSeller
			? `/seller/products/edit/${chat.productId}`
			: `/products/${chat.productId}`;
	}, [isSeller, chat.productId]);

	// Cerrar menú al hacer clic fuera
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Cerrar menú
	const closeMenu = () => {
		setIsMenuOpen(false);
	};

	// Cambiar estado del chat
	const handleStatusChange = async (
		status: "active" | "closed" | "archived"
	) => {
		if (loading || isUpdating || !chat.id) return;

		setIsUpdating(true);
		closeMenu();

		try {
			console.log(`Cambiando estado de chat ${chat.id} a ${status}`);
			const success = await onUpdateStatus(chat.id, status);

			if (!success) {
				console.error(`Error al cambiar estado a ${status}`);
			}
		} catch (error) {
			console.error(`Error al actualizar estado a ${status}:`, error);
		} finally {
			setIsUpdating(false);
		}
	};

	// Formatear última vez visto - OPTIMIZADO
	const formatLastSeen = useCallback((date: Date): string => {
		const now = new Date();
		const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
		
		if (diffInMinutes < 1) {
			return 'hace un momento';
		} else if (diffInMinutes < 60) {
			return `hace ${diffInMinutes} min`;
		} else if (diffInMinutes < 1440) {
			const hours = Math.floor(diffInMinutes / 60);
			return `hace ${hours} h`;
		} else {
			const days = Math.floor(diffInMinutes / 1440);
			if (days === 1) return 'ayer';
			if (days < 7) return `hace ${days} días`;
			return date.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
		}
	}, []);

	return (
		<div className="p-4 border-b border-gray-200 bg-white shadow-sm">
			<div className="flex items-center justify-between">
				{/* Información del participante */}
				<div className="flex items-center flex-1 min-w-0">
					{/* Avatar con indicador de estado mejorado */}
					<div className="flex-shrink-0 mr-3 relative">
						{participant.avatar ? (
							<img
								src={participant.avatar}
								alt={participant.name}
								className="h-12 w-12 rounded-full border-2 border-white shadow-sm"
								onError={(e) => {
									const target = e.target as HTMLImageElement;
									target.onerror = null;
									target.src = "https://via.placeholder.com/48?text=U";
								}}
							/>
						) : (
							<div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
								{participant.icon}
							</div>
						)}
						
						{/* Indicador de estado online/offline mejorado */}
						<div className={`absolute -bottom-1 -right-1 ${isOnline ? 'connection-indicator' : 'connection-indicator offline'}`}>
							<div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
								isOnline ? 'bg-green-500' : 'bg-gray-400'
							}`}>
								{isOnline ? (
									<Wifi size={8} className="text-white" />
								) : (
									<WifiOff size={8} className="text-white" />
								)}
							</div>
						</div>
					</div>

					{/* Información del chat */}
					<div className="flex-1 min-w-0">
						<div className="flex items-center space-x-2 mb-1">
							<Link
								to={participant.route}
								className="text-lg font-semibold text-gray-900 hover:text-primary-600 truncate transition-colors"
							>
								{participant.name}
							</Link>
							
							{/* Badge de estado del chat */}
							<span
								className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
									chat.status === "active"
										? "bg-green-100 text-green-800"
										: chat.status === "closed"
											? "bg-blue-100 text-blue-800"
											: "bg-gray-100 text-gray-800"
								}`}
							>
								<Circle className="w-1.5 h-1.5 mr-1" fill="currentColor" />
								{chat.status === "active"
									? "Activo"
									: chat.status === "closed"
										? "Cerrado"
										: "Archivado"}
							</span>
						</div>
						
						{/* Estado de conexión y escritura */}
						<div className="flex items-center text-sm mb-1">
							{isTyping ? (
								<div className="flex items-center text-primary-600 font-medium">
									<div className="typing-indicator flex space-x-1 mr-2">
										<div className="w-1 h-1 bg-current rounded-full"></div>
										<div className="w-1 h-1 bg-current rounded-full"></div>
										<div className="w-1 h-1 bg-current rounded-full"></div>
									</div>
									<span>escribiendo...</span>
								</div>
							) : (
								<div className="flex items-center text-gray-500">
									{isOnline ? (
										<>
											<Circle className="w-2 h-2 mr-2 fill-green-500 text-green-500" />
											<span className="text-green-600 font-medium">En línea</span>
										</>
									) : (
										<>
											<Circle className="w-2 h-2 mr-2 fill-gray-400 text-gray-400" />
											<span>
												{lastSeen ? `Visto ${formatLastSeen(lastSeen)}` : 'Desconectado'}
											</span>
										</>
									)}
								</div>
							)}
						</div>
						
						{/* Información del producto */}
						<div className="flex items-center text-sm text-gray-500">
							<Link
								to={productRoute}
								className="text-primary-600 hover:text-primary-700 hover:underline flex items-center truncate"
								title={chat.product?.name || `Producto #${chat.productId}`}
							>
								<Package className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
								<span className="truncate max-w-xs">
									{chat.product?.name || `Producto #${chat.productId}`}
								</span>
								<ChevronRight size={14} className="ml-1 flex-shrink-0" />
							</Link>
						</div>
					</div>
				</div>

				{/* Menú de acciones */}
				<div className="flex items-center space-x-2">
					{/* Indicador de carga */}
					{(loading || isUpdating) && (
						<div className="flex items-center text-gray-500">
							<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400 mr-2"></div>
							<span className="text-sm">
								{isUpdating ? 'Actualizando...' : 'Cargando...'}
							</span>
						</div>
					)}

					{/* Menú desplegable */}
					<div className="relative" ref={menuRef}>
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
							disabled={loading || isUpdating}
							title="Más opciones"
						>
							<MoreVertical className="h-5 w-5 text-gray-600" />
						</button>

						{/* Menú desplegable */}
						{isMenuOpen && (
							<div className="absolute right-0 z-20 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
								{/* Información adicional */}
								<div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
									<div className="flex items-center text-xs text-gray-500 space-x-4">
										<span>ID: {chat.id}</span>
										<span>Creado: {chat.createdAt ? new Date(chat.createdAt).toLocaleDateString('es-EC') : 'N/A'}</span>
									</div>
								</div>

								{/* Acciones de estado */}
								<div className="py-1">
									{chat.status === "active" && (
										<button
											onClick={() => handleStatusChange("closed")}
											className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
											disabled={loading || isUpdating}
										>
											<Clock className="h-4 w-4 mr-3 text-gray-500" />
											Cerrar conversación
										</button>
									)}

									{chat.status === "closed" && (
										<button
											onClick={() => handleStatusChange("active")}
											className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
											disabled={loading || isUpdating}
										>
											<RotateCcw className="h-4 w-4 mr-3 text-gray-500" />
											Reabrir conversación
										</button>
									)}

									{chat.status !== "archived" && (
										<button
											onClick={() => handleStatusChange("archived")}
											className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
											disabled={loading || isUpdating}
										>
											<Archive className="h-4 w-4 mr-3 text-gray-500" />
											Archivar conversación
										</button>
									)}

									{chat.status === "archived" && (
										<button
											onClick={() => handleStatusChange("active")}
											className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
											disabled={loading || isUpdating}
										>
											<RotateCcw className="h-4 w-4 mr-3 text-gray-500" />
											Desarchivar conversación
										</button>
									)}
								</div>

								{/* Enlaces adicionales */}
								<div className="border-t border-gray-100 py-1">
									<Link
										to={participant.route}
										className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
									>
										<Eye className="h-4 w-4 mr-3 text-gray-500" />
										Ver perfil
									</Link>
									<Link
										to={productRoute}
										className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
									>
										<Box className="h-4 w-4 mr-3 text-gray-500" />
										Ver producto
									</Link>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ChatHeader;