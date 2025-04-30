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

	// Referencias para evitar bucles infinitos
	const initialLoadComplete = useRef<boolean>(false);
	const chatIdRef = useRef<string | undefined>(chatIdParam);
	const loadAttempts = useRef<number>(0);
	const isInitialNavRef = useRef<boolean>(true);

	// CORRECCIÓN 1: Usar un objeto para rastrear cuándo se ha llamado markAllAsRead para cada chatId
	const markAllAsReadCalledRef = useRef<Record<number, boolean>>({});

	// CORRECCIÓN 2: Guardar referencia al último selectedChat para comparaciones
	const lastSelectedChatRef = useRef<number | null>(null);

	// CORRECCIÓN 3: Crear la instancia de useChat con isSeller=true una sola vez
	// y evitar que esa propiedad cambie entre renderizados
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

	// CORRECCIÓN 4: Optimizar la carga inicial de chats y manejar las referencias correctamente
	useEffect(() => {
		// Solo ejecutar una vez al inicio
		if (!initialLoadComplete.current && user?.id) {
			console.log("Cargando lista inicial de chats para vendedor...");
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
							lastSelectedChatRef.current = chatId;

							// Marcar mensajes como leídos (con protección para evitar múltiples llamadas)
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
							// Si no se encuentra el chat en la lista inicial, intentar cargar directamente
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

	// CORRECCIÓN 5: Optimizar loadSpecificChat para evitar ciclos
	const loadSpecificChat = useCallback(
		async (chatId: number) => {
			// Evitar cargar el mismo chat que ya está cargado
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
				// Buscar el chat en la lista de chats
				const chat = chats.find((c) => c.id === chatId);

				if (chat) {
					console.log(
						`Chat ${chatId} encontrado en la lista, seleccionando...`
					);
					// Si encontramos el chat en la lista, seleccionarlo y cargar mensajes
					setSelectedChat(chat);
					setShowChatList(false);
					lastSelectedChatRef.current = chatId;

					// Iniciar polling de mensajes
					startMessagesPolling(chatId);

					// Marcar mensajes como leídos con protección contra loops
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
					// Intentar cargar los mensajes directamente
					try {
						const result = await fetchChatMessages(chatId);

						if (result) {
							console.log(`Chat ${chatId} cargado correctamente desde API`);
							setShowChatList(false);
							lastSelectedChatRef.current = chatId;

							// Iniciar polling de mensajes
							startMessagesPolling(chatId);

							// Proteger llamada a markAllAsRead
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

							// Si hay demasiados intentos, mostrar página principal de chats
							if (loadAttempts.current >= 3) {
								navigate("/seller/messages", {replace: true});
								lastSelectedChatRef.current = null;
							} else {
								// Intentar recargar los chats y volver a intentar
								const updatedChats = await fetchChats();

								// Si sigue sin encontrar el chat, mostrar lista de chats
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

	// CORRECCIÓN 6: Optimizar useEffect para cambiar de chat cuando cambia la URL
	useEffect(() => {
		// Si la carga inicial no está completa, esperar
		if (!initialLoadComplete.current || !user?.id) {
			return;
		}

		// En la navegación inicial, ya manejamos la carga en el useEffect anterior
		if (isInitialNavRef.current) {
			isInitialNavRef.current = false;
			return;
		}

		// Evitar procesar el mismo chatId múltiples veces
		if (
			chatIdParam === chatIdRef.current &&
			lastSelectedChatRef.current !== null
		) {
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

			// Si no es un número válido, redirigir a chats
			if (isNaN(chatId)) {
				navigate("/seller/messages", {replace: true});
				lastSelectedChatRef.current = null;
				return;
			}

			// Resetear el flag de marcado como leído para este chat
			// solo si es diferente al último chat seleccionado
			if (lastSelectedChatRef.current !== chatId) {
				markAllAsReadCalledRef.current[chatId] = false;
				loadSpecificChat(chatId);
			}
		} else {
			// Si no hay chatId, limpiar selección y mostrar lista
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
			(chat.product?.name &&
				chat.product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(chat.user?.name &&
				chat.user.name.toLowerCase().includes(searchTerm.toLowerCase()));

		return matchesStatus && matchesUnread && matchesSearch;
	});

	// CORRECCIÓN 7: Optimizar handleSelectChat para evitar llamadas innecesarias
	const handleSelectChat = (chat: typeof selectedChat) => {
		if (chat && chat.id) {
			// Evitar seleccionar el mismo chat repetidamente
			if (lastSelectedChatRef.current === chat.id) {
				console.log(
					`Chat ${chat.id} ya está seleccionado, omitiendo selección.`
				);
				return;
			}

			console.log(`Vendedor seleccionó chat ${chat.id}`);

			// Detener cualquier polling activo
			stopMessagesPolling();

			// Actualizar la URL
			navigate(`/seller/messages/${chat.id}`, {replace: true});
			chatIdRef.current = String(chat.id);

			// Guardar referencia al chat seleccionado
			lastSelectedChatRef.current = chat.id;

			// Seleccionar chat y cargar mensajes
			setSelectedChat(chat);

			// En móvil, ocultar la lista
			if (isMobileView) {
				setShowChatList(false);
			}

			// Marcar mensajes como leídos con protección
			if (
				chat.unreadCount &&
				chat.unreadCount > 0 &&
				!markAllAsReadCalledRef.current[chat.id]
			) {
				markAllAsReadCalledRef.current[chat.id] = true;
				// Usar setTimeout para asegurar que esto ocurre después del render
				setTimeout(() => {
					markAllAsRead(chat.id).catch(console.error);
				}, 500);
			}
		}
	};

	// Enviar un mensaje
	const handleSendMessage = async (content: string): Promise<boolean> => {
		console.log("Enviando mensaje como vendedor...");
		const result = await sendMessage(content);

		// Si el mensaje se envió correctamente, actualizar la lista de chats
		// para reflejar el último mensaje
		if (result && selectedChat) {
			await fetchChatMessages(selectedChat.id!);
		}

		return result;
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
		navigate("/seller/messages", {replace: true});
		chatIdRef.current = undefined;
		lastSelectedChatRef.current = null;
	};

	// CORRECCIÓN 8: Optimizar refreshChats para evitar bucles
	const refreshChats = () => {
		console.log("Refrescando lista de chats");

		// Resetear los marcados como leído para permitir marcar de nuevo
		// pero solo para el chat actualmente seleccionado si existe
		if (selectedChat && selectedChat.id) {
			markAllAsReadCalledRef.current[selectedChat.id] = false;
		}

		fetchChats().then(() => {
			// Si hay un chat seleccionado, recargar sus mensajes
			if (selectedChat && selectedChat.id) {
				fetchChatMessages(selectedChat.id);
			}
		});
	};

	// Contenido principal a renderizar
	const renderChatContent = () => {
		// Si estamos cargando inicialmente y no hay selectedChat
		if ((loading || isLoadingChat) && !selectedChat) {
			return (
				<div className="flex flex-col justify-center items-center h-full">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
					<p className="text-gray-600 dark:text-gray-300">{loadingMessage}</p>
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
						isSeller={true} // Indicamos que somos el vendedor
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
			);
		}

		// Si no hay chat seleccionado (mensaje de bienvenida)
		return (
			<div className="flex flex-col items-center justify-center h-full p-4 text-center">
				<div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
					<MessageSquare className="h-8 w-8 text-gray-500 dark:text-gray-400" />
				</div>
				<h3 className="text-lg font-medium text-gray-900 dark:text-white">
					Selecciona una conversación
				</h3>
				<p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
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
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
					<MessageSquare className="w-6 h-6 mr-2" />
					Conversaciones con Clientes
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
				className="bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col md:flex-row overflow-hidden"
				style={{minHeight: "70vh"}}
			>
				{/* Lista de chats (visible en escritorio o cuando está activa en móvil) */}
				{(!isMobileView || showChatList) && (
					<div className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
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
							isSeller={true} // Indicamos que somos el vendedor
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

export default SellerMessagesPage;
