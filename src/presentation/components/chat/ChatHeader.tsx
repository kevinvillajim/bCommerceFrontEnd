// src/presentation/components/chat/ChatHeader.tsx - CORREGIDO
import React, {useState, useRef, useEffect} from "react";
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
} from "lucide-react";
import type {Chat} from "../../../core/domain/entities/Chat";

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

	// Hook para estado de conexión (simplificado por ahora)
	const useConnectionStatus = (userId: number | undefined) => {
		const [isOnline, setIsOnline] = useState<boolean>(false);
		const [lastSeen, setLastSeen] = useState<Date | null>(null);
	
		useEffect(() => {
			if (!userId) {
				setIsOnline(false);
				setLastSeen(null);
				return;
			}
	
			// TODO: Implementar estado de conexión real
			// Por ahora, simular que algunos usuarios están online
			const isCurrentlyOnline = Math.random() > 0.7; // 30% de probabilidad
			setIsOnline(isCurrentlyOnline);
			
			if (!isCurrentlyOnline) {
				const minutesAgo = Math.floor(Math.random() * 120) + 1;
				const lastSeenTime = new Date();
				lastSeenTime.setMinutes(lastSeenTime.getMinutes() - minutesAgo);
				setLastSeen(lastSeenTime);
			} else {
				setLastSeen(null);
			}
		}, [userId]);
	
		return { isOnline, lastSeen };
	};

	// Determinar el participante según el rol
	const participant = isSeller
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

	// Estado de conexión del participante
	const { isOnline, lastSeen } = useConnectionStatus(participant.id);

	// Ruta al producto
	const productRoute = isSeller
		? `/seller/products/edit/${chat.productId}`
		: `/products/${chat.productId}`;

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

	// Formatear última vez visto
	const formatLastSeen = (date: Date): string => {
		const now = new Date();
		const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
		
		if (diffInMinutes < 60) {
			return `hace ${diffInMinutes} min`;
		} else if (diffInMinutes < 1440) {
			return `hace ${Math.floor(diffInMinutes / 60)} h`;
		} else {
			return `hace ${Math.floor(diffInMinutes / 1440)} d`;
		}
	};

	return (
		<div className="p-4 border-b border-gray-200 flex justify-between items-center">
			<div className="flex items-center">
				{/* Avatar con indicador de estado */}
				<div className="flex-shrink-0 mr-3 relative">
					{participant.avatar ? (
						<img
							src={participant.avatar}
							alt={participant.name}
							className="h-10 w-10 rounded-full"
							onError={(e) => {
								const target = e.target as HTMLImageElement;
								target.onerror = null;
								target.src = "https://via.placeholder.com/40?text=U";
							}}
						/>
					) : (
						<div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
							{participant.icon}
						</div>
					)}
					
					{/* Indicador de estado online/offline */}
					<div className="absolute -bottom-0.5 -right-0.5">
						{isOnline ? (
							<div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
								<Wifi size={8} className="text-white" />
							</div>
						) : (
							<div className="w-3 h-3 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center">
								<WifiOff size={8} className="text-white" />
							</div>
						)}
					</div>
				</div>

				{/* Información del participante y producto */}
				<div>
					<h2 className="text-lg font-medium text-gray-900">
						{participant.name}
					</h2>
					
					{/* Estado de conexión */}
					<div className="flex items-center text-xs text-gray-500 mb-1">
						{isOnline ? (
							<>
								<Circle className="w-2 h-2 mr-1 fill-green-500 text-green-500" />
								<span className="text-green-600 font-medium">En línea</span>
							</>
						) : (
							<>
								<Circle className="w-2 h-2 mr-1 fill-gray-400 text-gray-400" />
								<span>
									{lastSeen ? `Visto ${formatLastSeen(lastSeen)}` : 'Desconectado'}
								</span>
							</>
						)}
					</div>
					
					{/* Información del producto */}
					<div className="flex items-center text-sm text-gray-500">
						<Link
							to={productRoute}
							className="text-primary-600 hover:underline flex items-center"
						>
							<Package className="h-3.5 w-3.5 mr-1" />
							<span className="truncate max-w-xs">
								{chat.product?.name || `Producto #${chat.productId}`}
							</span>
							<ChevronRight size={14} />
						</Link>
					</div>
				</div>
			</div>

			{/* Indicador de estado del chat y menú de acciones */}
			<div className="flex items-center">
				<span
					className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
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

				{/* Menú desplegable para acciones */}
				<div className="relative" ref={menuRef}>
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
						disabled={loading || isUpdating}
					>
						<MoreVertical className="h-5 w-5 text-gray-600" />
					</button>

					{/* Menú desplegable */}
					{isMenuOpen && (
						<div className="absolute right-0 z-20 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
							{chat.status === "active" && (
								<button
									onClick={() => handleStatusChange("closed")}
									className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
									disabled={loading || isUpdating}
								>
									Cerrar conversación
								</button>
							)}

							{chat.status === "closed" && (
								<button
									onClick={() => handleStatusChange("active")}
									className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
									disabled={loading || isUpdating}
								>
									Reabrir conversación
								</button>
							)}

							{chat.status !== "archived" && (
								<button
									onClick={() => handleStatusChange("archived")}
									className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
									disabled={loading || isUpdating}
								>
									Archivar conversación
								</button>
							)}

							{chat.status === "archived" && (
								<button
									onClick={() => handleStatusChange("active")}
									className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
									disabled={loading || isUpdating}
								>
									Desarchivar conversación
								</button>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ChatHeader;