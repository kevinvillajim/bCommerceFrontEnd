// src/presentation/pages/seller/SellerMessagesPage.tsx - LOADING INFINITO CORREGIDO

import React, {useState, useEffect, useRef, useCallback} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {MessageSquare, ArrowLeft, RefreshCw} from "lucide-react";
import {useChat} from "../../hooks/useChat";
import {useAuth} from "../../hooks/useAuth";
import ChatList from "../../components/chat/ChatList";
import ChatMessages from "../../components/chat/ChatMessages";
import ChatHeader from "../../components/chat/ChatHeader";
import MessageForm from "../../components/chat/MessageForm";
import {useChatFilterNotifications} from "../../components/notifications/ChatFilterToast";
import type {Chat} from "../../../core/domain/entities/Chat";

const SellerMessagesPage: React.FC = () => {
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
	const markAllAsReadCalledRef = useRef<Record<number, boolean>>({});
	const lastSelectedChatRef = useRef<number | null>(null);

	// Hook para notificaciones de filtro
	const {
		showSellerStrike,
		showSellerBlocked,
		NotificationComponent
	} = useChatFilterNotifications();

	// Obtener datos del chat usando el hook personalizado para vendedores
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
	} = useChat(true); // IMPORTANTE: true para vendedor

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
			console.log("Cargando lista inicial de chats para vendedor...");
			setIsLoadingChat(true);

			fetchChats()
				.then((fetchedChats) => {
					initialLoadComplete.current = true;
					setIsLoadingChat(false);
					console.log(`Lista inicial de ${fetchedChats.length} chats cargada`);

					if (chatIdParam && fetchedChats.length > 0) {
						const chatId = parseInt(chatIdParam, 10);
						const chat = fetchedChats.find((c) => c.id === chatId);

						if (chat) {
							console.log(
								`Chat ${chatId} encontrado en carga inicial, seleccionando...`
							);
							setSelectedChat(chat);
							setShowChatList(false);
							lastSelectedChatRef.current = chatId;

							// Marcar como leído después de un delay
							if (chat.unreadCount && chat.unreadCount > 0 && !markAllAsReadCalledRef.current[chatId]) {
								markAllAsReadCalledRef.current[chatId] = true;
								setTimeout(() => {
									markAllAsRead(chatId).catch(console.error);
								}, 1000);
							}
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
	}, [fetchChats, chatIdParam, setSelectedChat, user?.id, markAllAsRead]);

	// Función para cargar un chat específico
	const loadSpecificChat = useCallback(
		async (chatId: number) => {
			if (lastSelectedChatRef.current === chatId) {
				console.log(`Chat ${chatId} ya está seleccionado, omitiendo carga.`);
				return;
			}

			if (!user?.id) return;

			console.log(`Intentando cargar chat específico ${chatId}...`);
			setIsLoadingChat(true);
			setLoadingMessage(`Cargando conversación #${chatId}...`);
			loadAttempts.current += 1;

			try {
				const chat = chats.find((c) => c.id === chatId);

				if (chat) {
					console.log(`Chat ${chatId} encontrado en la lista, seleccionando...`);
					setSelectedChat(chat);
					setShowChatList(false);
					lastSelectedChatRef.current = chatId;

					startMessagesPolling(chatId);

					// Marcar como leído
					if (chat.unreadCount && chat.unreadCount > 0 && !markAllAsReadCalledRef.current[chatId]) {
						markAllAsReadCalledRef.current[chatId] = true;
						setTimeout(() => {
							markAllAsRead(chatId).catch(console.error);
						}, 1000);
					}
				} else {
					console.log(`Chat ${chatId} no encontrado en la lista, cargando desde API...`);
					try {
						const result = await fetchChatMessages(chatId);

						if (result) {
							console.log(`Chat ${chatId} cargado correctamente desde API`);
							setShowChatList(false);
							lastSelectedChatRef.current = chatId;
							startMessagesPolling(chatId);

							// Marcar como leído
							if (!markAllAsReadCalledRef.current[chatId]) {
								markAllAsReadCalledRef.current[chatId] = true;
								setTimeout(() => {
									markAllAsRead(chatId).catch(console.error);
								}, 1000);
							}
						} else {
							console.warn(`Chat ${chatId} no encontrado en API`);

							if (loadAttempts.current >= 3) {
								navigate("/seller/messages", {replace: true});
								lastSelectedChatRef.current = null;
							} else {
								const updatedChats = await fetchChats();
								const updatedChat = updatedChats.find((c) => c.id === chatId);
								if (updatedChat) {
									setSelectedChat(updatedChat);
									setShowChatList(false);
									lastSelectedChatRef.current = chatId;
								} else {
									navigate("/seller/messages", {replace: true});
									lastSelectedChatRef.current = null;
								}
							}
						}
					} catch (error) {
						console.error(`Error al cargar chat ${chatId} desde API:`, error);
						navigate("/seller/messages", {replace: true});
						lastSelectedChatRef.current = null;
					}
				}
			} catch (error) {
				console.error(`Error al cargar chat ${chatId}:`, error);
				navigate("/seller/messages", {replace: true});
				lastSelectedChatRef.current = null;
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

	// Manejar cambios en la URL
	useEffect(() => {
		if (!initialLoadComplete.current || !user?.id) {
			return;
		}

		if (isInitialNavRef.current) {
			isInitialNavRef.current = false;
			return;
		}

		if (chatIdParam === chatIdRef.current && lastSelectedChatRef.current !== null) {
			return;
		}

		stopMessagesPolling();
		chatIdRef.current = chatIdParam;
		loadAttempts.current = 0;

		if (chatIdParam) {
			const chatId = parseInt(chatIdParam, 10);

			if (isNaN(chatId)) {
				navigate("/seller/messages", {replace: true});
				lastSelectedChatRef.current = null;
				return;
			}

			if (lastSelectedChatRef.current !== chatId) {
				markAllAsReadCalledRef.current[chatId] = false;
				loadSpecificChat(chatId);
			}
		} else {
			if (lastSelectedChatRef.current !== null) {
				setSelectedChat(null);
				lastSelectedChatRef.current = null;
				setShowChatList(true);
			}
		}
	}, [
		chatIdParam,
		loadSpecificChat,
		navigate,
		setSelectedChat,
		stopMessagesPolling,
		user?.id,
	]);

	// Filtrar chats según los criterios - OPTIMIZADO con useMemo
	const filteredChats = React.useMemo(() => {
		return chats.filter((chat) => {
			const matchesStatus = statusFilter === "all" || chat.status === statusFilter;
			// Filtro por mensajes no leídos - CORREGIDO como UserChatPage
			const matchesUnread = unreadFilter ? chat.unreadCount > 0 : true;

			// Búsqueda por nombre de usuario y producto
			const matchesSearch =
				searchTerm === "" ||
				(chat.product?.name &&
					chat.product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(chat.user?.name &&
					chat.user.name.toLowerCase().includes(searchTerm.toLowerCase()));

			return matchesStatus && matchesUnread && matchesSearch;
		});
	}, [chats, statusFilter, unreadFilter, searchTerm]);

	// Seleccionar un chat
	const handleSelectChat = (chat: Chat) => {
		if (chat && chat.id) {
			if (lastSelectedChatRef.current === chat.id) {
				console.log(`Chat ${chat.id} ya está seleccionado, omitiendo selección.`);
				return;
			}

			console.log(`Vendedor seleccionó chat ${chat.id}`);

			stopMessagesPolling();

			navigate(`/seller/messages/${chat.id}`, {replace: true});
			chatIdRef.current = String(chat.id);
			lastSelectedChatRef.current = chat.id;

			setSelectedChat(chat);

			if (isMobileView) {
				setShowChatList(false);
			}

			// Marcar como leído
			if (chat.unreadCount && chat.unreadCount > 0 && !markAllAsReadCalledRef.current[chat.id]) {
				markAllAsReadCalledRef.current[chat.id] = true;
				setTimeout(() => {
					if (chat.id !== undefined) {
						markAllAsRead(chat.id).catch(console.error);
					}
				}, 1000);
			}
		}
	};

	// CORREGIDO: Enviar mensaje sin estado local de loading
	const handleSendMessage = async (content: string): Promise<boolean> => {
		console.log("Enviando mensaje como vendedor...");

		try {
			const result = await sendMessage(content);
			
			if (result && selectedChat?.id) {
				// Recargar mensajes después de enviar exitosamente
				await fetchChatMessages(selectedChat.id);
			}
			
			return result;
		} catch (error: any) {
			console.error("Error al enviar mensaje:", error);

			// Manejar errores específicos del filtro de chat
			if (error?.response?.data?.status === 'error') {
				const errorData = error.response.data;
				const strikeCount = errorData.data?.strike_count || 0;
				const isBlocked = errorData.data?.is_blocked || false;
				const censoredContent = errorData.data?.censored_content;

				if (isBlocked) {
					// Cuenta bloqueada
					showSellerBlocked(
						"Tu cuenta ha sido bloqueada por acumular múltiples strikes. Contacta al soporte."
					);
				} else {
					// Strike aplicado
					showSellerStrike(
						errorData.message,
						strikeCount,
						censoredContent
					);
				}
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

		stopMessagesPolling();
		setShowChatList(true);
		navigate("/seller/messages", {replace: true});
		chatIdRef.current = undefined;
		lastSelectedChatRef.current = null;
	};

	// Refrescar lista de chats
	const refreshChats = () => {
		console.log("Refrescando lista de chats");

		if (selectedChat && selectedChat.id) {
			markAllAsReadCalledRef.current[selectedChat.id] = false;
		}

		fetchChats().then(() => {
			console.log("Lista de chats refrescada");
		});
	};

	// Contenido principal a renderizar
	const renderChatContent = () => {
		if ((loading || isLoadingChat) && !selectedChat) {
			return (
				<div className="flex flex-col justify-center items-center h-full">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
					<p className="text-gray-600">{loadingMessage}</p>
				</div>
			);
		}

		if (selectedChat) {
			return (
				<>
					<ChatHeader
						chat={selectedChat}
						isSeller={true}
						onUpdateStatus={handleUpdateStatus}
						loading={loading}
					/>

					<div className="flex-1 overflow-y-auto">
						<ChatMessages
							messages={messages}
							loading={loading}
							noMessagesText="No hay mensajes todavía"
							currentUserId={user?.id ?? undefined} // ← CORREGIDO: Manejar null como undefined
						/>
					</div>

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
						? "Elige una conversación de la lista para ver los mensajes y responder a tus clientes"
						: "No tienes conversaciones activas. Cuando los clientes inicien conversaciones sobre tus productos, aparecerán aquí."}
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
						<h1 className="text-2xl font-bold text-gray-900">Conversaciones con Clientes</h1>
						<p className="text-sm text-gray-500">Gestiona tus chats con compradores</p>
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
							isSeller={true}
							showTabs={true}
						/>
					</div>
				)}

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

export default SellerMessagesPage;