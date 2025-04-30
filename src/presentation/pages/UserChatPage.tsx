import React, {useState, useEffect, useRef, useCallback} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {MessageSquare, ArrowLeft, RefreshCw} from "lucide-react";
import {useChat} from "../hooks/useChat";
import ChatList from "../components/chat/ChatList";
import ChatMessages from "../components/chat/ChatMessages";
import ChatHeader from "../components/chat/ChatHeader";
import MessageForm from "../components/chat/MessageForm";

const UserChatPage: React.FC = () => {
	const navigate = useNavigate();
	const {chatId: chatIdParam} = useParams<{chatId?: string}>();

	// Estados para filtros y búsqueda
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [unreadFilter, setUnreadFilter] = useState<boolean>(false);
	const [isMobileView, setIsMobileView] = useState<boolean>(
		window.innerWidth < 768
	);
	const [showChatList, setShowChatList] = useState<boolean>(!chatIdParam);
	const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);

	// Referencias para evitar bucles infinitos
	const initialLoadComplete = useRef<boolean>(false);
	const chatIdRef = useRef<string | undefined>(chatIdParam);
	const isNavigatingRef = useRef<boolean>(false);

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
		if (!initialLoadComplete.current) {
			console.log("Cargando lista inicial de chats...");
			setIsLoadingChat(true);
			fetchChats()
				.then((loadedChats) => {
					initialLoadComplete.current = true;
					setIsLoadingChat(false);
					console.log(`Lista inicial de ${loadedChats.length} chats cargada`);
				})
				.catch(() => {
					setIsLoadingChat(false);
					initialLoadComplete.current = true;
				});
		}
	}, [fetchChats]);

	// Función para cargar un chat específico
	const loadSpecificChat = useCallback(
		async (chatId: number) => {
			if (isNavigatingRef.current) {
				return;
			}

			console.log(`Intentando cargar chat específico ${chatId}...`);
			setIsLoadingChat(true);

			try {
				// Buscar el chat en la lista de chats ya cargados
				const chat = chats.find((c) => c.id === chatId);

				if (chat) {
					console.log(
						`Chat ${chatId} encontrado en la lista, seleccionando...`
					);
					// Si encontramos el chat en la lista, seleccionarlo y cargar mensajes
					setSelectedChat(chat);
					setShowChatList(false);
				} else {
					console.log(
						`Chat ${chatId} no encontrado en la lista, cargando desde API...`
					);
					// Intentar cargar los mensajes directamente
					const result = await fetchChatMessages(chatId);

					if (result) {
						console.log(`Chat ${chatId} cargado correctamente desde API`);
						setShowChatList(false);
					} else {
						console.warn(
							`Chat ${chatId} no encontrado, redirigiendo a lista de chats`
						);
						isNavigatingRef.current = true;
						navigate("/chats", {replace: true});
					}
				}
			} catch (err) {
				console.error(`Error al cargar chat ${chatId}:`, err);
				// En caso de error, volver a la lista
				isNavigatingRef.current = true;
				navigate("/chats", {replace: true});
			} finally {
				setIsLoadingChat(false);
				// Restablecer bandera después de un breve retraso
				setTimeout(() => {
					isNavigatingRef.current = false;
				}, 500);
			}
		},
		[chats, fetchChatMessages, navigate, setSelectedChat]
	);

	// Cargar chat específico cuando cambia el ID en la URL
	useEffect(() => {
		// Evitar procesar el mismo chatId múltiples veces
		if (chatIdParam === chatIdRef.current && selectedChat) {
			return;
		}

		// Actualizar la referencia
		chatIdRef.current = chatIdParam;

		// Si hay un ID de chat en la URL y la carga inicial está completa
		if (chatIdParam && initialLoadComplete.current) {
			const chatId = parseInt(chatIdParam, 10);

			// Si no es un número válido, redirigir a chats
			if (isNaN(chatId)) {
				isNavigatingRef.current = true;
				navigate("/chats", {replace: true});
				return;
			}

			// Cargar el chat específico
			loadSpecificChat(chatId);
		} else if (!chatIdParam) {
			// Si no hay chatId, limpiar selección y mostrar lista
			setSelectedChat(null);
			setShowChatList(true);
		}
	}, [chatIdParam, loadSpecificChat, navigate, selectedChat, setSelectedChat]);

	// Filtrar chats según los criterios
	const filteredChats = chats.filter((chat) => {
		// Filtro por estado
		const matchesStatus =
			statusFilter === "all" || chat.status === statusFilter;

		// Filtro por mensajes no leídos
		const matchesUnread = unreadFilter
			? chat.unreadCount && chat.unreadCount > 0
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

	// Seleccionar un chat
	const handleSelectChat = (chat: typeof selectedChat) => {
		if (chat && chat.id) {
			console.log(`Usuario seleccionó chat ${chat.id}`);

			// Actualizar la URL sin causar un bucle
			isNavigatingRef.current = true;
			navigate(`/chats/${chat.id}`, {replace: true});
			chatIdRef.current = String(chat.id);

			// Seleccionar chat y cargar mensajes
			setSelectedChat(chat);

			// En móvil, ocultar la lista
			if (isMobileView) {
				setShowChatList(false);
			}

			// Restablecer bandera después de un breve retraso
			setTimeout(() => {
				isNavigatingRef.current = false;
			}, 300);
		}
	};

	// Enviar un mensaje
	const handleSendMessage = async (content: string): Promise<boolean> => {
		console.log("Enviando mensaje...");
		const result = await sendMessage(content);
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
		setShowChatList(true);
		isNavigatingRef.current = true;
		navigate("/chats", {replace: true});
		chatIdRef.current = undefined;
		// Restablecer bandera después de un breve retraso
		setTimeout(() => {
			isNavigatingRef.current = false;
		}, 300);
	};

	// Refrescar lista de chats
	const refreshChats = () => {
		console.log("Refrescando lista de chats");
		fetchChats();
	};

	// Contenido principal a renderizar
	const renderChatContent = () => {
		// Si estamos cargando inicialmente y no hay selectedChat
		if ((loading || isLoadingChat) && !selectedChat) {
			return (
				<div className="flex justify-center items-center h-full">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
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
						? "Elige una conversación de la lista para ver los mensajes y responder"
						: "No tienes conversaciones activas. Puedes iniciar una desde la página de un producto."}
				</p>
			</div>
		);
	};

	return (
		<div className="container mx-auto p-4">
			<div className="mb-4 flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
					<MessageSquare className="w-6 h-6 mr-2" />
					Mis Conversaciones
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
							isSeller={false}
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

export default UserChatPage;