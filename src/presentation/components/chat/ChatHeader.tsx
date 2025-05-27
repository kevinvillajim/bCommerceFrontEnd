import React, {useState, useRef, useEffect} from "react";
import {Link} from "react-router-dom";
import {
	User,
	Store,
	Package,
	ChevronRight,
	Circle,
	MoreVertical,
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

	// Determinar el participante según el rol
	const participant = isSeller
		? {
				name: chat.user?.name || `Cliente #${chat.userId}`,
				avatar: chat.user?.avatar,
				id: chat.userId,
				icon: <User className="h-6 w-6 text-gray-500" />,
				route: `/admin/users/${chat.userId}`, // Enlace al perfil del cliente
			}
		: {
				name: chat.seller?.storeName || `Vendedor #${chat.sellerId}`,
				avatar: chat.seller?.avatar,
				id: chat.sellerId,
				icon: <Store className="h-6 w-6 text-gray-500" />,
				route: `/sellers/${chat.sellerId}`, // Enlace al perfil del vendedor
			};

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

	// Cerrar menú al hacer clic en cualquier parte
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

	return (
		<div className="p-4 border-b border-gray-200 flex justify-between items-center">
			<div className="flex items-center">
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
								target.src = "https://via.placeholder.com/40?text=U";
							}}
						/>
					) : (
						<div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
							{participant.icon}
						</div>
					)}
				</div>

				{/* Información del participante y producto */}
				<div>
					<h2 className="text-lg font-medium text-gray-900">
						{participant.name}
					</h2>
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

			{/* Indicador de estado y menú de acciones */}
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
