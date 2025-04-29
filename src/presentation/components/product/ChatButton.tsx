import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {MessageCircle} from "lucide-react";
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
	sellerName,
	className = "",
}) => {
	const navigate = useNavigate();
	const {isAuthenticated} = useAuth();
	const {createChat} = useChat();
	const [loading, setLoading] = useState(false);

	const handleChatClick = async () => {
		// Si el usuario no está autenticado, redirigir a la página de login
		if (!isAuthenticated) {
			// Guardar en sessionStorage la información para regresar después del login
			sessionStorage.setItem(
				"chatRedirect",
				JSON.stringify({
					productId,
					sellerId,
					returnTo: window.location.pathname,
				})
			);
			navigate("/login");
			return;
		}

		setLoading(true);

		try {
			// Crear o encontrar un chat existente con este vendedor y producto
			const chatId = await createChat(sellerId, productId);

			if (chatId) {
				// Redirigir al chat específico
				navigate(`/chats/${chatId}`);
			} else {
				console.error("No se pudo crear el chat");
			}
		} catch (error) {
			console.error("Error al iniciar el chat:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<button
			onClick={handleChatClick}
			disabled={loading}
			className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
			title={`Chatear con ${sellerName || "el vendedor"} sobre ${productName}`}
		>
			{loading ? (
				<div className="w-4 h-4 border-2 border-t-transparent border-gray-600 dark:border-gray-300 rounded-full animate-spin mr-2"></div>
			) : (
				<MessageCircle className="w-4 h-4 mr-2" />
			)}
			<span>Preguntar al vendedor</span>
		</button>
	);
};

export default ChatButton;
