import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {MessageCircle, Send} from "lucide-react";
import {useChat} from "../../hooks/useChat";
import {useAuth} from "../../hooks/useAuth";

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
	const {createChat, sendMessageForNewChat} = useChat();

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [showMessageInput, setShowMessageInput] = useState(false);
	const [error, setError] = useState<string | null>(null);

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
		} catch (err) {
			console.error("Error al iniciar conversación:", err);
			setError(
				err instanceof Error ? err.message : "Error al iniciar la conversación"
			);
			setLoading(false);

			// Permitir al usuario reintentar el envío
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
					className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
					title={`Chatear con ${sellerName} sobre ${productName}`}
				>
					{loading ? (
						<div className="w-4 h-4 border-2 border-t-transparent border-gray-600 dark:border-gray-300 rounded-full animate-spin mr-2"></div>
					) : (
						<MessageCircle className="w-4 h-4 mr-2" />
					)}
					<span>Preguntar al vendedor</span>
				</button>
			) : (
				<div className="border border-gray-300 rounded-md p-3 dark:border-gray-600">
					<div className="text-sm mb-2 text-gray-700 dark:text-gray-300">
						Envía un mensaje a {sellerName} sobre {productName}:
					</div>

					{error && <div className="text-sm text-red-600 mb-2">{error}</div>}

					<form onSubmit={handleSendMessage} className="flex">
						<input
							type="text"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							placeholder="Escribe tu pregunta aquí..."
							className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
							autoFocus
							disabled={loading}
						/>
						<button
							type="submit"
							disabled={loading || !message.trim()}
							className={`px-3 py-2 flex items-center justify-center rounded-r-md ${
								loading || !message.trim()
									? "bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300"
									: "bg-primary-600 text-white hover:bg-primary-700"
							}`}
						>
							{loading ? (
								<div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
							) : (
								<Send className="w-4 h-4" />
							)}
						</button>
					</form>

					<div className="flex justify-end mt-2">
						<button
							onClick={() => setShowMessageInput(false)}
							className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
							disabled={loading}
						>
							Cancelar
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default ChatButton;
