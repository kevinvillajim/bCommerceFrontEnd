// src/presentation/pages/UserChatPage.tsx - CORREGIDO

import React, {useState, useEffect, useRef, useCallback} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {MessageSquare, ArrowLeft, RefreshCw} from "lucide-react";
import {useChat} from "../hooks/useChat";
import {useAuth} from "../hooks/useAuth";
import ChatList from "../components/chat/ChatList";
import ChatMessages from "../components/chat/ChatMessages";
import ChatHeader from "../components/chat/ChatHeader";
import MessageForm from "../components/chat/MessageForm";
import {useChatFilterNotifications} from "../components/notifications/ChatFilterToast";
import type { Chat } from "../../core/domain/entities/Chat";

const UserChatPage: React.FC = () => {
	const navigate = useNavigate();
	const {chatId: chatIdParam} = useParams<{chatId?: string}>();
	const {user} = useAuth();

	// Estados para filtros y búsqueda
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [unreadFilter, setUnreadFilter] = useState<boolean>(false);
	const [isMobileView, setIsMobileView] = useState<boolean>(
		window.innerWidth < 768
	);
	const [showChatList, setShowChatList] = useState<boolean>(!chatIdParam);
	const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);
	const [loadingMessage, setLoadingMessage] = useState<string>(
		"Cargando conversaciones..."
	);

	// Referencias para evitar bucles infinitos
	const initialLoadComplete = useRef<boolean>(false);
	const chatIdRef = useRef<string | undefined>(chatIdParam);
	const loadAttempts = useRef<number>(0);
	const isInitialNavRef = useRef<boolean>(true);

	// Hook para notificaciones de filtro
	const {
		showUserWarning,
		NotificationComponent
	} = useChatFilterNotifications();

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
		startMessagesPolling,
		stopMessagesPolling,
		markAllAsRead,
	} = useChat();

	// Función para detectar cambios en el tamaño de la ventana
	useEffect(() => {
		const handleResize = () => {
			setIsMobileView(window.innerWidth < 768);
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Cargar chats al iniciar
	useEffect(() => {
		if (!initialLoadComplete.current && user?.id) {
			console.log("Cargando lista inicial de chats...");
			setIsLoadingChat(true);

			fetchChats()
				.then((fetchedChats) => {
					initialLoadComplete.current = true;
					setIsLoadingChat(false);
					console.log(`Lista inicial de ${fetchedChats.length} chats cargada`);

					// Si hay un chatId en la URL, seleccionarlo tras cargar la lista
					if (chatIdParam && fetchedChats.length > 0) {
						const chatId = parseInt(chatIdParam, 10);
						const chat = fetchedChats.find((c) => c.id === chatId);

						if (chat) {
							console.log(
								`Chat ${chatId} encontrado en carga inicial, seleccionando...`
							);
							setSelectedChat(chat);
							setShowChatList(false);
						} else {
							console.log(
								`Chat ${chatId} no encontrado en lista inicial, intentando carga directa...`
							);
							loadSpecificChat(chatId);
						}
					}
				})
				.catch((err) => {
					console.error("Error al cargar chats iniciales:", err);
					setIsLoadingChat(false);
					initialLoadComplete.current = true;
				});
		}
	}, [fetchChats, chatIdParam, setSelectedChat, user?.id]);

	// Función para cargar un chat específico
	const loadSpecificChat = useCallback(
		async (chatId: number) => {
			if (!user?.id) return;

			console.log(`Intentando cargar chat específico ${chatId}...`);
			setIsLoadingChat(true);
			setLoadingMessage(`Cargando conversación #${chatId}...`);
			loadAttempts.current += 1;

			try {
				// Buscar el chat en la lista de chats
				const chat = chats.find((c) => c.id === chatId);

				if (chat) {
					console.log(
						`Chat ${chatId} encontrado en la lista, seleccionando...`
					);
					setSelectedChat(chat);
					setShowChatList(false);
					startMessagesPolling(chatId);

					// Marcar como leído
					if (chat.unreadCount && chat.unreadCount > 0) {
						setTimeout(() => {
							markAllAsRead(chatId).catch(console.error);
						}, 1000);
					}
				} else {
					console.log(
						`Chat ${chatId} no encontrado en la lista, cargando desde API...`
					);
					try {
						const result = await fetchChatMessages(chatId);

						if (result) {
							console.log(`Chat ${chatId} cargado correctamente desde API`);
							setShowChatList(false);
							startMessagesPolling(chatId);

							// Marcar como leído
							setTimeout(() => {
								markAllAsRead(chatId).catch(console.error);
							}, 1000);
						} else {
							console.warn(
								`Chat ${chatId} no encontrado en API, mostrando lista de chats`
							);

							if (loadAttempts.current >= 3) {
								navigate("/chats", {replace: true});
							} else {
								const updatedChats = await fetchChats();
								const updatedChat = updatedChats.find((c) => c.id === chatId);
								if (updatedChat) {
									setSelectedChat(updatedChat);
									setShowChatList(false);
								} else {
									navigate("/chats", {replace: true});
								}
							}
						}
					} catch (error) {
						console.error(`Error al cargar chat ${chatId} desde API:`, error);
						navigate("/chats", {replace: true});
					}
				}
			} catch (error) {
				console.error(`Error al cargar chat ${chatId}:`, error);
				navigate("/chats", {replace: true});
			} finally {
				setIsLoadingChat(false);
			}
		},
		[
			chats,
			fetchChatMessages,
			navigate,
			setSelectedChat,
			fetchChats,
			startMessagesPolling,
			markAllAsRead,
			user?.id,
		]
	);

	// Cargar chat específico cuando cambia el ID en la URL
	useEffect(() => {
		if (!initialLoadComplete.current || !user?.id) {
			return;
		}

		if (isInitialNavRef.current) {
			isInitialNavRef.current = false;
			return;
		}

		if (chatIdParam === chatIdRef.current && selectedChat) {
			return;
		}

		// Detener cualquier polling activo al cambiar de chat
		stopMessagesPolling();

		// Actualizar la referencia
		chatIdRef.current = chatIdParam;
		loadAttempts.current = 0;

		// Si hay un ID de chat en la URL
		if (chatIdParam) {
			const chatId = parseInt(chatIdParam, 10);

			if (isNaN(chatId)) {
				navigate("/chats", {replace: true});
				return;
			}

			loadSpecificChat(chatId);
		} else {
			setSelectedChat(null);
			setShowChatList(true);
		}
	}, [
		chatIdParam,
		loadSpecificChat,
		navigate,
		selectedChat,
		setSelectedChat,
		stopMessagesPolling,
		user?.id,
	]);

	// Filtrar chats según los criterios - OPTIMIZADO con useMemo
	const filteredChats = React.useMemo(() => {
		return chats.filter((chat) => {
			// Filtro por estado
			const matchesStatus =
				statusFilter === "all" || chat.status === statusFilter;

			// Filtro por mensajes no leídos
			const matchesUnread = unreadFilter
				? (chat.unreadCount ?? 0) > 0
				: true;

			// Búsqueda por nombre de vendedor o producto
			const matchesSearch =
				searchTerm === "" ||
				(chat.product?.name &&
					chat.product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(chat.seller?.storeName &&
					chat.seller.storeName.toLowerCase().includes(searchTerm.toLowerCase()));

			return matchesStatus && matchesUnread && matchesSearch;
		});
	}, [chats, statusFilter, unreadFilter, searchTerm]);

	// Seleccionar un chat
	const handleSelectChat = (chat: Chat) => {
		if (chat && chat.id) {
			console.log(`Usuario seleccionó chat ${chat.id}`);

			// Detener cualquier polling activo
			stopMessagesPolling();

			// Actualizar la URL
			navigate(`/chats/${chat.id}`, {replace: true});
			chatIdRef.current = String(chat.id);

			// Seleccionar chat y cargar mensajes
			setSelectedChat(chat);

			// En móvil, ocultar la lista
			if (isMobileView) {
				setShowChatList(false);
			}

			// Marcar como leído
			if (chat.unreadCount && chat.unreadCount > 0) {
				setTimeout(() => {
					if (chat.id !== undefined) {
						markAllAsRead(chat.id).catch(console.error);
					}
				}, 1000);
			}
		}
	};

	// Enviar un mensaje - MEJORADO COMO SellerMessagesPage
	const handleSendMessage = async (content: string): Promise<boolean> => {
		console.log("Enviando mensaje como usuario...");
		
		try {
			const result = await sendMessage(content);
			
			if (result && selectedChat?.id) {
				// Recargar mensajes inmediatamente después de enviar exitosamente
				await fetchChatMessages(selectedChat.id);
			}
			
			return result;
		} catch (error: any) {
			console.error("Error al enviar mensaje:", error);

			// Manejar errores específicos del filtro de chat
			if (error?.response?.data?.status === 'error') {
				const errorData = error.response.data;
				const censoredContent = errorData.data?.censored_content;
				
				// Para usuarios normales: solo advertencia
				showUserWarning(errorData.message, censoredContent);
			}

			return false;
		}
	};

	// Actualizar estado del chat
	const handleUpdateStatus = async (
		chatId: number,
		status: "active" | "closed" | "archived"
	) => {
		console.log(`Actualizando estado de chat ${chatId} a ${status}...`);
		return await updateChatStatus(chatId, status);
	};

	// Volver a la lista en móvil
	const handleBackToList = () => {
		console.log("Volviendo a lista de chats");

		// Detener polling de mensajes
		stopMessagesPolling();

		setShowChatList(true);
		navigate("/chats", {replace: true});
		chatIdRef.current = undefined;
	};

	// Refrescar lista de chats
	const refreshChats = () => {
		console.log("Refrescando lista de chats");
		fetchChats();

		// Si hay un chat seleccionado, recargar sus mensajes
		if (selectedChat && selectedChat.id) {
			fetchChatMessages(selectedChat.id);
		}
	};

	// Contenido principal a renderizar
	const renderChatContent = () => {
		// Si estamos cargando inicialmente y no hay selectedChat
		if ((loading || isLoadingChat) && !selectedChat) {
			return (
				<div className="flex flex-col justify-center items-center h-full">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
					<p className="text-gray-600">{loadingMessage}</p>
				</div>
			);
		}

		// Si hay un chat seleccionado
		if (selectedChat) {
			return (
				<>
					{/* Encabezado del chat */}
					<ChatHeader
						chat={selectedChat}
						isSeller={false}
						onUpdateStatus={handleUpdateStatus}
						loading={loading}
					/>

					{/* Mensajes */}
					<div className="flex-1 overflow-y-auto">
						<ChatMessages
							messages={messages}
							loading={loading}
							noMessagesText="No hay mensajes todavía"
							currentUserId={user?.id ?? undefined} // ← CORREGIDO: Asegurar que sea 'number | undefined'
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
						chatId={selectedChat.id} // ← NUEVO: Para indicador de escritura
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
					Selecciona una conversación
				</h3>
				<p className="text-gray-500 mt-2 max-w-md">
					{chats.length > 0
						? "Elige una conversación de la lista para ver los mensajes y responder"
						: "No tienes conversaciones activas. Puedes iniciar una desde la página de un producto."}
				</p>
			</div>
		);
	};

	return (
		<div className="container mx-auto p-6 max-w-7xl">
			<div className="mb-6 flex justify-between items-center">
				<div className="flex items-center space-x-3">
					<div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
						<MessageSquare className="w-5 h-5 text-primary-600" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">Mis Conversaciones</h1>
						<p className="text-sm text-gray-500">Gestiona tus chats con vendedores</p>
					</div>
				</div>
				<div className="flex items-center space-x-3">
					{isMobileView && selectedChat && !showChatList && (
						<button
							onClick={handleBackToList}
							className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
						>
							<ArrowLeft size={16} className="mr-2" />
							Volver
						</button>
					)}
					<button
						onClick={refreshChats}
						className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
						disabled={loading || isLoadingChat}
					>
						<RefreshCw
							size={16}
							className={`mr-2 ${loading || isLoadingChat ? "animate-spin" : ""}`}
						/>
						Actualizar
					</button>
				</div>
			</div>

			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-6 flex items-start space-x-3">
					<div className="flex-shrink-0">
						<svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
							<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
						</svg>
					</div>
					<div className="flex-1">
						<h3 className="text-sm font-medium text-red-800">Error al cargar conversaciones</h3>
						<p className="text-sm text-red-700 mt-1">{error}</p>
						<button
							onClick={refreshChats}
							className="text-sm text-red-700 hover:text-red-900 underline mt-2 inline-block"
						>
							Reintentar
						</button>
					</div>
				</div>
			)}

			<div
				className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row overflow-hidden"
				style={{minHeight: "75vh"}}
			>
				{/* Lista de chats (visible en escritorio o cuando está activa en móvil) */}
				{(!isMobileView || showChatList) && (
					<div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col bg-white">
					<ChatList
					chats={filteredChats}
					selectedChatId={selectedChat?.id}
					onSelectChat={handleSelectChat}
					loading={loading || isLoadingChat}
					searchTerm={searchTerm}
					onSearchChange={setSearchTerm}
					statusFilter={statusFilter}
					onStatusFilterChange={setStatusFilter}
					unreadFilter={unreadFilter}
					onUnreadFilterChange={setUnreadFilter}
					isSeller={false}
					 showTabs={true}
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

			{/* Componente de notificaciones flotantes */}
			<NotificationComponent />
		</div>
	);
};

export default UserChatPage;