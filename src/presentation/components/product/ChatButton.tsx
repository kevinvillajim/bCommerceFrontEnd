// src/presentation/components/product/ChatButton.tsx - CORREGIDO
import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {MessageCircle, Send, Loader2} from "lucide-react";
import {useChat} from "../../hooks/useChat";
import {useAuth} from "../../hooks/useAuth";
import {useChatFilter} from "../../hooks/useChatFilter";

interface ChatButtonProps {
	productId: number;
	sellerId: number;
	productName: string;
	sellerName?: string;
	className?: string;
}

const ChatButton: React.FC<ChatButtonProps> = ({
	productId,
	sellerId,
	productName,
	sellerName = "Vendedor",
	className = "",
}) => {
	const navigate = useNavigate();
	const {isAuthenticated, user} = useAuth();
	const {createChat, sendMessageForNewChat, chats} = useChat();

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [showMessageInput, setShowMessageInput] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [existingChatId, setExistingChatId] = useState<number | null>(null);

	// Hook para notificaciones de filtro
	const {
		showUserWarning
	} = useChatFilter();

	// Verificar si ya existe un chat con este vendedor para este producto
	useEffect(() => {
		if (isAuthenticated && user && chats.length > 0) {
			const existingChat = chats.find(
				(chat) => chat.sellerId === sellerId && chat.productId === productId
			);

			if (existingChat && existingChat.id) {
				setExistingChatId(existingChat.id);
			}
		}
	}, [chats, sellerId, productId, isAuthenticated, user]);

	const handleChatClick = () => {
		// Si el usuario no está autenticado, redirigir al login
		if (!isAuthenticated || !user) {
			navigate(
				`/login?redirect=${encodeURIComponent(window.location.pathname)}`
			);
			return;
		}

		// Evitar que un vendedor inicie chat con sí mismo
		if (user.id === sellerId) {
			setError("No puedes iniciar un chat contigo mismo como vendedor");
			return;
		}

		// Si ya existe un chat, ir directamente a él
		if (existingChatId) {
			navigate(`/chats/${existingChatId}`);
			return;
		}

		// Mostrar el campo para escribir el mensaje inicial
		setShowMessageInput(true);
	};

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!message.trim()) {
			setError("Por favor, escribe un mensaje");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			// 1. Crear chat o obtener ID si ya existe
			const chatId = await createChat(sellerId, productId);

			if (!chatId) {
				throw new Error("No se pudo crear la conversación");
			}

			// 2. Enviar el mensaje inicial con el ID del chat
			const success = await sendMessageForNewChat(chatId, message.trim());

			if (!success) {
				throw new Error("No se pudo enviar el mensaje");
			}

			// 3. Redirigir al chat
			console.log(`Redirigiendo a chat ${chatId}...`);
			navigate(`/chats/${chatId}`);
		} catch (err: any) {
			console.error("Error al iniciar conversación:", err);
			
			// Manejar errores específicos del filtro de chat
			if (err?.response?.data?.status === 'error') {
				const errorData = err.response.data;
				const censoredContent = errorData.data?.censored_content;
				
				// Para usuarios normales: solo advertencia
				showUserWarning(errorData.message, censoredContent);
				
				// Limpiar el mensaje para que puedan corregirlo
				setMessage("");
			} else {
				setError(
					err instanceof Error ? err.message : "Error al iniciar la conversación"
				);
			}
			
			setLoading(false);

			// Permitir al usuario reintentar después de algunos segundos
			setTimeout(() => {
				setError(null);
			}, 3000);
		}
	};

	return (
		<div>
			{!showMessageInput ? (
				<button
					onClick={handleChatClick}
					disabled={loading}
					className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${className}`}
					title={`Chatear con ${sellerName} sobre ${productName}`}
				>
					{loading ? (
						<Loader2 className="w-4 h-4 mr-2 animate-spin" />
					) : (
						<MessageCircle className="w-4 h-4 mr-2" />
					)}
					<span>
						{existingChatId
							? "Continuar conversación"
							: "Preguntar al vendedor"}
					</span>
				</button>
			) : (
				<div className="border border-gray-300 rounded-md p-3 bg-white shadow-sm">
					<div className="text-sm mb-2 text-gray-700 font-medium">
						Envía un mensaje a {sellerName} sobre {productName}:
					</div>

					{error && (
						<div className="text-sm text-red-600 mb-2 p-2 bg-red-50 border border-red-200 rounded">
							{error}
						</div>
					)}

					<form onSubmit={handleSendMessage} className="space-y-3">
						<textarea
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							placeholder="Escribe tu pregunta aquí..."
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
							rows={3}
							autoFocus
							disabled={loading}
						/>
						<div className="flex justify-between items-center">
							<button
								type="button"
								onClick={() => setShowMessageInput(false)}
								className="text-xs text-gray-500 hover:text-gray-700 underline"
								disabled={loading}
							>
								Cancelar
							</button>
							<button
								type="submit"
								disabled={loading || !message.trim()}
								className={`px-4 py-2 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
									loading || !message.trim()
										? "bg-gray-300 text-gray-600 cursor-not-allowed"
										: "bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
								}`}
							>
								{loading ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Enviando...
									</>
								) : (
									<>
										<Send className="w-4 h-4 mr-2" />
										Enviar mensaje
									</>
								)}
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Las notificaciones ahora se muestran a través del UniversalToast global */}
		</div>
	);
};

export default ChatButton;