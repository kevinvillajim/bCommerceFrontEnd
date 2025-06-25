// src/presentation/components/chat/ChatInterface.tsx - CORREGIDO
import React, {useState, useEffect, useRef} from "react";
import {MessageSquare, ArrowLeft, RefreshCw} from "lucide-react";
import ChatList from "./ChatList";
import ChatMessages from "./ChatMessages";
import ChatHeader from "./ChatHeader";
import MessageForm from "./MessageForm";
import type {Chat, Message} from "../../../core/domain/entities/Chat";

/**
 * Props para el componente ChatInterface
 */
interface ChatInterfaceProps {
	// Datos de chat
	chats: Chat[];
	selectedChat: Chat | null;
	messages: Message[];

	// Estados
	loading: boolean;
	error: string | null;

	// Handlers y callbacks
	onSelectChat: (chat: Chat) => void;
	onSendMessage: (content: string) => Promise<boolean>;
	onUpdateStatus: (
		chatId: number,
		status: "active" | "closed" | "archived"
	) => Promise<boolean>;
	onRefresh: () => void;
	onBack?: () => void;

	// Configuración
	isSeller?: boolean;
	title?: string;
	noChatsMessage?: string;
	noChatSelectedMessage?: string;

	// Filtros
	initialSearchTerm?: string;
	initialStatusFilter?: string;
	initialUnreadFilter?: boolean;
}

/**
 * Componente reutilizable ChatInterface
 */
const ChatInterface: React.FC<ChatInterfaceProps> = ({
	// Datos de chat
	chats,
	selectedChat,
	messages,

	// Estados
	loading,
	error,

	// Handlers y callbacks
	onSelectChat,
	onSendMessage,
	onUpdateStatus,
	onRefresh,
	onBack,

	// Configuración
	isSeller = false,
	title = "Mis Conversaciones",
	noChatsMessage = "No tienes conversaciones activas",
	noChatSelectedMessage = "Selecciona una conversación para ver los mensajes",

	// Filtros
	initialSearchTerm = "",
	initialStatusFilter = "all",
	initialUnreadFilter = false,
}) => {
	// Estados locales para filtros y búsqueda
	const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
	const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
	const [unreadFilter, setUnreadFilter] =
		useState<boolean>(initialUnreadFilter);
	const [isMobileView, setIsMobileView] = useState<boolean>(
		window.innerWidth < 768
	);
	const [showChatList, setShowChatList] = useState<boolean>(!selectedChat);

	// Referencias
	const chatContainerRef = useRef<HTMLDivElement>(null);

	// Función para detectar cambios en el tamaño de la ventana
	useEffect(() => {
		const handleResize = () => {
			setIsMobileView(window.innerWidth < 768);

			// En modo escritorio, mostrar siempre la lista y el chat
			if (window.innerWidth >= 768) {
				setShowChatList(true);
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Ajusta la visualización cuando cambia el chat seleccionado
	useEffect(() => {
		if (selectedChat && isMobileView) {
			setShowChatList(false);
		}
	}, [selectedChat, isMobileView]);

	// Filtrar chats según los criterios
	const filteredChats = chats.filter((chat) => {
		// Filtro por estado
		const matchesStatus =
			statusFilter === "all" || chat.status === statusFilter;

		// Filtro por mensajes no leídos
		const matchesUnread = unreadFilter
			? chat.unreadCount && chat.unreadCount > 0
			: true;

		// Búsqueda - CORREGIDO: usar las propiedades correctas
		const searchTarget1 = isSeller 
			? chat.user?.name 
			: chat.seller?.storeName;
		const searchTarget2 = chat.product?.name;

		const matchesSearch =
			searchTerm === "" ||
			(searchTarget1 &&
				searchTarget1.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(searchTarget2 &&
				searchTarget2.toLowerCase().includes(searchTerm.toLowerCase()));

		return matchesStatus && matchesUnread && matchesSearch;
	});

	// Handler para volver a la lista en móvil
	const handleBackToList = () => {
		setShowChatList(true);

		// Si hay callback externo para retroceder, llamarlo
		if (onBack) {
			onBack();
		}
	};

	// Renderiza el contenido principal del chat
	const renderChatContent = () => {
		// Si hay un chat seleccionado
		if (selectedChat) {
			return (
				<>
					{/* Encabezado del chat */}
					<ChatHeader
						chat={selectedChat}
						isSeller={isSeller}
						onUpdateStatus={onUpdateStatus}
						loading={loading}
					/>

					{/* Mensajes */}
					<div className="flex-1 overflow-y-auto">
						<ChatMessages
							messages={messages}
							loading={loading}
							noMessagesText="No hay mensajes todavía"
						/>
					</div>

					{/* Formulario de mensajes */}
					<MessageForm
						onSendMessage={onSendMessage}
						isDisabled={selectedChat.status !== "active"}
						disabledText={
							selectedChat.status === "closed"
								? "Esta conversación está cerrada"
								: "Esta conversación está archivada"
						}
						isLoading={loading}
					/>
				</>
			);
		}

		// Si no hay chat seleccionado (mensaje de bienvenida)
		return (
			<div className="flex flex-col items-center justify-center h-full p-4 text-center">
				<div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
					<MessageSquare className="h-8 w-8 text-gray-500" />
				</div>
				<h3 className="text-lg font-medium text-gray-900">
					{noChatSelectedMessage}
				</h3>
				<p className="text-gray-500 mt-2 max-w-md">
					{chats.length > 0
						? "Elige una conversación de la lista para ver los mensajes y responder"
						: noChatsMessage}
				</p>
			</div>
		);
	};

	return (
		<div className="container mx-auto p-4">
			<div className="mb-4 flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 flex items-center">
					<MessageSquare className="w-6 h-6 mr-2" />
					{title}
				</h1>
				<div className="flex space-x-2">
					{isMobileView && selectedChat && !showChatList && (
						<button
							onClick={handleBackToList}
							className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 flex items-center"
						>
							<ArrowLeft size={16} className="mr-1" />
							Volver
						</button>
					)}
					<button
						onClick={onRefresh}
						className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
						disabled={loading}
					>
						<RefreshCw
							size={16}
							className={`mr-1 ${loading ? "animate-spin" : ""}`}
						/>
						Actualizar
					</button>
				</div>
			</div>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
					<strong className="font-bold">Error: </strong>
					<span className="block sm:inline">{error}</span>
					<button
						onClick={onRefresh}
						className="underline ml-2 text-red-700 hover:text-red-900"
					>
						Reintentar
					</button>
				</div>
			)}

			<div
				ref={chatContainerRef}
				className="bg-white rounded-lg shadow-sm flex flex-col md:flex-row overflow-hidden"
				style={{minHeight: "70vh"}}
			>
				{/* Lista de chats (visible en escritorio o cuando está activa en móvil) */}
				{(!isMobileView || showChatList) && (
					<div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
						<ChatList
							chats={filteredChats}
							selectedChatId={selectedChat?.id}
							onSelectChat={onSelectChat}
							loading={loading}
							searchTerm={searchTerm}
							onSearchChange={setSearchTerm}
							statusFilter={statusFilter}
							onStatusFilterChange={setStatusFilter}
							unreadFilter={unreadFilter}
							onUnreadFilterChange={setUnreadFilter}
							isSeller={isSeller}
						/>
					</div>
				)}

				{/* Área de chat (visible en escritorio o cuando está activa en móvil) */}
				{(!isMobileView || !showChatList) && (
					<div className="w-full md:w-2/3 flex flex-col">
						{renderChatContent()}
					</div>
				)}
			</div>
		</div>
	);
};

export default ChatInterface;