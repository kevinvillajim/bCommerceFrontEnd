import React, {useState, useRef, useEffect} from "react";
import type {FormEvent, KeyboardEvent} from "react";
import {Send, Loader2, Smile} from "lucide-react";

interface MessageFormProps {
	onSendMessage: (message: string) => Promise<boolean>;
	isDisabled?: boolean;
	disabledText?: string;
	placeholder?: string;
	isLoading?: boolean;
}

// Lista de emojis populares organizados por categorías
const EMOJI_CATEGORIES = {
	"Frecuentes": ["😊", "😂", "❤️", "👍", "👌", "🙏", "😍", "🎉"],
	"Emociones": ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳"],
	"Gestos": ["👍", "👎", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👏", "🙌", "👐", "🤲", "🤝", "🙏"],
	"Objetos": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "🔥", "💯", "💢", "💦", "💨", "🎉", "🎊"],
	"Actividades": ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏑", "🏒", "🥍", "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋"]
};

const MessageForm: React.FC<MessageFormProps> = ({
	onSendMessage,
	isDisabled = false,
	disabledText = "Esta conversación está cerrada",
	placeholder = "Escribe un mensaje...",
	isLoading = false,
}) => {
	const [message, setMessage] = useState("");
	const [localLoading, setLocalLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState("Frecuentes");
	
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const emojiPickerRef = useRef<HTMLDivElement>(null);
	const isMounted = useRef(true);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	// Al montar el componente, enfocar el textarea
	useEffect(() => {
		if (textareaRef.current && !isDisabled) {
			textareaRef.current.focus();
		}
	}, [isDisabled]);

	// Cerrar emoji picker cuando se hace clic fuera
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
				setShowEmojiPicker(false);
			}
		};

		if (showEmojiPicker) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showEmojiPicker]);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		setError(null);

		if (isDisabled || isLoading || localLoading || !message.trim()) {
			console.log("Envío bloqueado:", {
				isDisabled,
				isLoading,
				localLoading,
				messageEmpty: !message.trim(),
			});
			return;
		}

		const messageToSend = message.trim();
		setLocalLoading(true);

		try {
			console.log("Enviando mensaje:", messageToSend);
			const success = await onSendMessage(messageToSend);

			if (isMounted.current) {
				if (success) {
					console.log("Mensaje enviado correctamente");
					setMessage("");
					if (textareaRef.current) {
						textareaRef.current.focus();
					}
				} else {
					console.error("Error al enviar mensaje");
					setError("No se pudo enviar el mensaje. Inténtalo de nuevo.");
				}
			}
		} catch (error) {
			console.error("Error al enviar mensaje:", error);
			if (isMounted.current) {
				setError("Error al enviar mensaje. Por favor, inténtalo de nuevo.");
			}
		} finally {
			if (isMounted.current) {
				setLocalLoading(false);
			}
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (error) {
			setError(null);
		}

		// Enviar con Ctrl+Enter o Cmd+Enter (Mac)
		if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	// Ajustar altura automáticamente
	const autoAdjustHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const textarea = e.target;

		textarea.style.height = "auto";

		const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 150);
		textarea.style.height = `${newHeight}px`;

		setMessage(textarea.value);
	};

	// Insertar emoji en el mensaje
	const insertEmoji = (emoji: string) => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const newMessage = message.slice(0, start) + emoji + message.slice(end);
		
		setMessage(newMessage);
		
		// Restaurar la posición del cursor después del emoji
		setTimeout(() => {
			if (textarea) {
				textarea.focus();
				textarea.setSelectionRange(start + emoji.length, start + emoji.length);
			}
		}, 0);
	};

	// Si el chat está deshabilitado, mostrar mensaje informativo
	if (isDisabled) {
		return (
			<div className="p-4 border-t border-gray-200 bg-gray-50">
				<p className="text-center text-gray-500">
					{disabledText}
				</p>
			</div>
		);
	}

	return (
		<div className="p-4 border-t border-gray-200 bg-white relative">
			{error && (
				<div className="mb-2 p-2 bg-red-50 text-red-600 text-sm rounded-md">
					{error}
				</div>
			)}

			{/* Emoji Picker */}
			{showEmojiPicker && (
				<div 
					ref={emojiPickerRef}
					className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-hidden"
				>
					{/* Pestañas de categorías */}
					<div className="border-b border-gray-200 p-2">
						<div className="flex overflow-x-auto space-x-1">
							{Object.keys(EMOJI_CATEGORIES).map((category) => (
								<button
									key={category}
									onClick={() => setSelectedCategory(category)}
									className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
										selectedCategory === category
											? "bg-primary-100 text-primary-700"
											: "text-gray-600 hover:bg-gray-100"
									}`}
								>
									{category}
								</button>
							))}
						</div>
					</div>

					{/* Grid de emojis */}
					<div className="p-2 max-h-48 overflow-y-auto">
						<div className="grid grid-cols-8 gap-1">
							{EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES].map((emoji, index) => (
								<button
									key={`${emoji}-${index}`}
									onClick={() => {
										insertEmoji(emoji);
										setShowEmojiPicker(false);
									}}
									className="p-2 text-lg hover:bg-gray-100 rounded transition-colors"
									title={emoji}
								>
									{emoji}
								</button>
							))}
						</div>
					</div>
				</div>
			)}

			<form onSubmit={handleSubmit} className="flex items-end space-x-2">
				{/* Botón de emojis */}
				<button
					type="button"
					onClick={() => setShowEmojiPicker(!showEmojiPicker)}
					className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
					disabled={isLoading || localLoading}
					title="Insertar emoji"
				>
					<Smile size={20} />
				</button>

				{/* Campo de texto */}
				<div className="flex-1">
					<textarea
						ref={textareaRef}
						value={message}
						onChange={autoAdjustHeight}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
						rows={1}
						style={{minHeight: "40px", maxHeight: "150px"}}
						disabled={isLoading || localLoading}
					/>
					<p className="text-xs text-gray-500 mt-1">
						Presiona Ctrl+Enter para enviar
					</p>
				</div>

				{/* Botón de envío */}
				<button
					type="submit"
					className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
						message.trim() && !isLoading && !localLoading
							? "bg-primary-600 text-white hover:bg-primary-700"
							: "bg-gray-300 text-gray-600 cursor-not-allowed"
					}`}
					disabled={!message.trim() || isLoading || localLoading}
					title="Enviar mensaje"
				>
					{isLoading || localLoading ? (
						<Loader2 className="h-5 w-5 animate-spin" />
					) : (
						<Send size={18} />
					)}
				</button>
			</form>
		</div>
	);
};

export default MessageForm;