// src/presentation/pages/seller/SellerMessagesPage.tsx
import React, {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {MessageSquare, RefreshCw, ArrowLeft} from "lucide-react";
import {useChat} from "../../hooks/useChat";
import ChatList from "../../components/chat/ChatList";
import ChatMessages from "../../components/chat/ChatMessages";
import ChatHeader from "../../components/chat/ChatHeader";
import MessageForm from "../../components/chat/MessageForm";

const SellerMessagesPage: React.FC = () => {
	const navigate = useNavigate();
	const {chatId: chatIdParam} = useParams<{chatId?: string}>();

	// Estados para filtros y búsqueda
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [statusFilter, setStatusFilter] = useState<string>("active");
	const [unreadFilter, setUnreadFilter] = useState<boolean>(false);
	const [isMobileView, setIsMobileView] = useState<boolean>(
		window.innerWidth < 768
	);
	const [showChatList, setShowChatList] = useState<boolean>(!chatIdParam);

	// Obtener datos del chat usando el hook personalizado
	const {
		chats,
		selectedChat,
		messages,
		loading,
		error,
		fetchChats,
		fetchChatMessages,
		sendMessage,
		updateChatStatus,
		setSelectedChat,
	} = useChat();

	// Detectar cambios en el tamaño de la ventana
	useEffect(() => {
		const handleResize = () => {
			setIsMobileView(window.innerWidth < 768);
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Cargar chat específico si se proporciona chatId en la URL
	useEffect(() => {
		if (chatIdParam) {
			const chatId = parseInt(chatIdParam, 10);

			// Buscar el chat en la lista de chats
			const chat = chats.find((c) => c.id === chatId);

			if (chat) {
				setSelectedChat(chat);
				fetchChatMessages(chatId);
				setShowChatList(false);
			} else if (!loading) {
				// Intentar cargar los mensajes directamente si el chat no está en la lista
				fetchChatMessages(chatId).catch(() => {
					// Si falla, redirigir a la lista de chats
					navigate("/seller/messages");
				});
			}
		}
	}, [
		chatIdParam,
		chats,
		fetchChatMessages,
		loading,
		navigate,
		setSelectedChat,
	]);

	// Actualizar la URL cuando se selecciona un chat
	useEffect(() => {
		if (selectedChat?.id) {
			navigate(`/seller/messages/${selectedChat.id}`, {replace: true});
		}
	}, [selectedChat, navigate]);

	// Filtrar chats según los criterios
	const filteredChats = chats.filter((chat) => {
		// Filtro por estado
		const matchesStatus =
			statusFilter === "all" || chat.status === statusFilter;

		// Filtro por mensajes no leídos
		const matchesUnread = unreadFilter
			? chat.unreadCount && chat.unreadCount > 0
			: true;

		// Búsqueda por nombre de usuario o producto
		const matchesSearch =
			searchTerm === "" ||
			chat.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			chat.product?.name?.toLowerCase().includes(searchTerm.toLowerCase());

		return matchesStatus && matchesUnread && matchesSearch;
	});

	// Calcular total de mensajes no leídos
	const totalUnreadMessages = chats.reduce(
		(total, chat) => total + (chat.unreadCount || 0),
		0
	);

	// Seleccionar un chat
	const handleSelectChat = (chat: typeof selectedChat) => {
		if (chat?.id) {
			setSelectedChat(chat);
			fetchChatMessages(chat.id);

			if (isMobileView) {
				setShowChatList(false);
			}
		}
	};

	// Enviar un mensaje
	const handleSendMessage = async (content: string): Promise<boolean> => {
		const result = await sendMessage(content);
		return result === true; // Aseguramos que siempre retorna boolean
	};

	// Actualizar estado del chat
	const handleUpdateStatus = async (
		chatId: number,
		status: "active" | "closed" | "archived"
	) => {
		return await updateChatStatus(chatId, status);
	};

	// Volver a la lista en móvil
	const handleBackToList = () => {
		setShowChatList(true);
		navigate("/seller/messages");
	};

	// Refrescar lista de chats
	const refreshChats = () => {
		fetchChats();
	};

	return (
		<div className="h-full flex flex-col">
			<div className="mb-4 flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
					<MessageSquare className="w-6 h-6 mr-2" />
					Mensajes
					{totalUnreadMessages > 0 && (
						<span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
							{totalUnreadMessages}
						</span>
					)}
				</h1>

				<div className="flex space-x-2">
					{isMobileView && selectedChat && !showChatList && (
						<button
							onClick={handleBackToList}
							className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
						>
							<ArrowLeft size={16} className="mr-1" />
							Volver
						</button>
					)}

					<button
						onClick={refreshChats}
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
				</div>
			)}

			<div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col md:flex-row overflow-hidden">
				{/* Lista de chats (visible en escritorio o cuando está activa en móvil) */}
				{(!isMobileView || showChatList) && (
					<div className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
						<ChatList
							chats={filteredChats}
							selectedChatId={selectedChat?.id}
							onSelectChat={handleSelectChat}
							loading={loading}
							searchTerm={searchTerm}
							onSearchChange={setSearchTerm}
							statusFilter={statusFilter}
							onStatusFilterChange={setStatusFilter}
							unreadFilter={unreadFilter}
							onUnreadFilterChange={setUnreadFilter}
							isSeller={true}
						/>
					</div>
				)}

				{/* Área de chat (visible en escritorio o cuando está activa en móvil) */}
				{(!isMobileView || !showChatList) && (
					<div className="w-full md:w-2/3 flex flex-col">
						{selectedChat ? (
							<>
								{/* Encabezado del chat */}
								<ChatHeader
									chat={selectedChat}
									isSeller={true}
									onUpdateStatus={handleUpdateStatus}
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
									onSendMessage={handleSendMessage}
									isDisabled={selectedChat.status !== "active"}
									disabledText={
										selectedChat.status === "closed"
											? "Esta conversación está cerrada"
											: "Esta conversación está archivada"
									}
									isLoading={loading}
								/>
							</>
						) : (
							<div className="flex flex-col items-center justify-center h-full p-6 text-center">
								<div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
									<MessageSquare className="h-8 w-8 text-gray-500 dark:text-gray-400" />
								</div>
								<h3 className="text-lg font-medium text-gray-900 dark:text-white">
									Selecciona una conversación
								</h3>
								<p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
									Elige una conversación de la lista para ver los mensajes y
									responder a tus clientes
								</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default SellerMessagesPage;
