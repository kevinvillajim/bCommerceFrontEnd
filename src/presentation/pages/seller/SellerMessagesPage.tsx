// src/presentation/pages/seller/SellerMessagesPage.tsx - VERSIÓN CORREGIDA

import React, {useState, useEffect, useRef, useCallback} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {MessageSquare, ArrowLeft, RefreshCw} from "lucide-react";
import {useChat} from "../../hooks/useChat";
import {useAuth} from "../../hooks/useAuth";
import ChatList from "../../components/chat/ChatList";
import ChatMessages from "../../components/chat/ChatMessages";
import ChatHeader from "../../components/chat/ChatHeader";
import MessageForm from "../../components/chat/MessageForm";

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

	// CORRECCIÓN: Estado local para el loading de envío de mensajes
	const [sendingMessage, setSendingMessage] = useState<boolean>(false);

	// Referencias para evitar bucles infinitos
	const initialLoadComplete = useRef<boolean>(false);
	const chatIdRef = useRef<string | undefined>(chatIdParam);
	const loadAttempts = useRef<number>(0);
	const isInitialNavRef = useRef<boolean>(true);
	const markAllAsReadCalledRef = useRef<Record<number, boolean>>({});
	const lastSelectedChatRef = useRef<number | null>(null);

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
	} = useChat(true); // Indicamos que es un vendedor con true fijo

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

							if (
								chat.unreadCount &&
								chat.unreadCount > 0 &&
								!markAllAsReadCalledRef.current[chatId]
							) {
								markAllAsReadCalledRef.current[chatId] = true;
								setTimeout(() => {
									markAllAsRead(chatId).catch(console.error);
								}, 500);
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
					console.log(
						`Chat ${chatId} encontrado en la lista, seleccionando...`
					);
					setSelectedChat(chat);
					setShowChatList(false);
					lastSelectedChatRef.current = chatId;

					startMessagesPolling(chatId);

					if (
						chat.unreadCount &&
						chat.unreadCount > 0 &&
						!markAllAsReadCalledRef.current[chatId]
					) {
						markAllAsReadCalledRef.current[chatId] = true;
						setTimeout(() => {
							markAllAsRead(chatId).catch(console.error);
						}, 500);
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
							lastSelectedChatRef.current = chatId;

							startMessagesPolling(chatId);

							if (!markAllAsReadCalledRef.current[chatId]) {
								markAllAsReadCalledRef.current[chatId] = true;
								setTimeout(() => {
									markAllAsRead(chatId).catch(console.error);
								}, 500);
							}
						} else {
							console.warn(
								`Chat ${chatId} no encontrado en API, mostrando lista de chats`
							);

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

	useEffect(() => {
		if (!initialLoadComplete.current || !user?.id) {
			return;
		}

		if (isInitialNavRef.current) {
			isInitialNavRef.current = false;
			return;
		}

		if (
			chatIdParam === chatIdRef.current &&
			lastSelectedChatRef.current !== null
		) {
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

	// Filtrar chats según los criterios
	const filteredChats = chats.filter((chat) => {
		const matchesStatus =
			statusFilter === "all" || chat.status === statusFilter;

		const matchesUnread = unreadFilter
			? chat.unreadCount && chat.unreadCount > 0
			: true;

		const matchesSearch =
			searchTerm === "" ||
			(chat.product?.name &&
				chat.product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(chat.user?.name &&
				chat.user.name.toLowerCase().includes(searchTerm.toLowerCase()));

		return matchesStatus && matchesUnread && matchesSearch;
	});

	const handleSelectChat = (chat: typeof selectedChat) => {
		if (chat && chat.id) {
			if (lastSelectedChatRef.current === chat.id) {
				console.log(
					`Chat ${chat.id} ya está seleccionado, omitiendo selección.`
				);
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

			if (
				chat.unreadCount &&
				chat.unreadCount > 0 &&
				!markAllAsReadCalledRef.current[chat.id]
			) {
				markAllAsReadCalledRef.current[chat.id] = true;
				setTimeout(() => {
					if (chat.id !== undefined) {
						markAllAsRead(chat.id).catch(console.error);
					}
				}, 500);
			}
		}
	};

	// CORRECCIÓN: Enviar un mensaje SIN llamar fetchChatMessages después
	const handleSendMessage = async (content: string): Promise<boolean> => {
		if (sendingMessage) {
			console.log("Ya se está enviando un mensaje, ignorando...");
			return false;
		}

		console.log("Enviando mensaje como vendedor...");
		setSendingMessage(true);

		try {
			const result = await sendMessage(content);
			
			// CORRECCIÓN: NO llamar fetchChatMessages aquí ya que el hook useChat
			// debería manejar la actualización automáticamente
			console.log("Mensaje enviado:", result ? "exitoso" : "fallido");
			
			return result;
		} catch (error) {
			console.error("Error al enviar mensaje:", error);
			return false;
		} finally {
			setSendingMessage(false);
		}
	};

	const handleUpdateStatus = async (
		chatId: number,
		status: "active" | "closed" | "archived"
	) => {
		console.log(`Actualizando estado de chat ${chatId} a ${status}...`);
		return await updateChatStatus(chatId, status);
	};

	const handleBackToList = () => {
		console.log("Volviendo a lista de chats");

		stopMessagesPolling();

		setShowChatList(true);
		navigate("/seller/messages", {replace: true});
		chatIdRef.current = undefined;
		lastSelectedChatRef.current = null;
	};

	const refreshChats = () => {
		console.log("Refrescando lista de chats");

		if (selectedChat && selectedChat.id) {
			markAllAsReadCalledRef.current[selectedChat.id] = false;
		}

		fetchChats().then(() => {
			// CORRECCIÓN: NO recargar mensajes aquí para evitar bucles
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
						loading={loading || sendingMessage}
					/>

					<div className="flex-1 overflow-y-auto">
						<ChatMessages
							messages={messages}
							loading={loading}
							noMessagesText="No hay mensajes todavía"
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
						isLoading={loading || sendingMessage} // CORRECCIÓN: Usar estado local
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
		<div className="container mx-auto p-4">
			<div className="mb-4 flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 flex items-center">
					<MessageSquare className="w-6 h-6 mr-2" />
					Conversaciones con Clientes
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
						onClick={refreshChats}
						className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
						disabled={loading || isLoadingChat}
					>
						<RefreshCw
							size={16}
							className={`mr-1 ${loading || isLoadingChat ? "animate-spin" : ""}`}
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
						onClick={refreshChats}
						className="underline ml-2 text-red-700 hover:text-red-900"
					>
						Reintentar
					</button>
				</div>
			)}

			<div
				className="bg-white rounded-lg shadow-sm flex flex-col md:flex-row overflow-hidden"
				style={{minHeight: "70vh"}}
			>
				{(!isMobileView || showChatList) && (
					<div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
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
						/>
					</div>
				)}

				{(!isMobileView || !showChatList) && (
					<div className="w-full md:w-2/3 flex flex-col">
						{renderChatContent()}
					</div>
				)}
			</div>
		</div>
	);
};

export default SellerMessagesPage;