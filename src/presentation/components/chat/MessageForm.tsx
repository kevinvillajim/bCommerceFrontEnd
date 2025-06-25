import React, {useState, useRef, useEffect} from "react";
import type {FormEvent, KeyboardEvent} from "react";
import {Send, Loader2, Smile, Search, Clock} from "lucide-react";
import { useTypingIndicator } from "../../hooks/useRealTimeChat";

interface MessageFormProps {
	onSendMessage: (message: string) => Promise<boolean>;
	isDisabled?: boolean;
	disabledText?: string;
	placeholder?: string;
	isLoading?: boolean;
	chatId?: number; // Para el indicador de escritura
}

// Lista expandida de emojis organizados por categorías
const EMOJI_CATEGORIES = {
	"Frecuentes": {
		icon: "🕒",
		emojis: ["😊", "😂", "❤️", "👍", "👌", "🙏", "😍", "🎉", "🤔", "😭", "🔥", "💪"]
	},
	"Emociones": {
		icon: "😊",
		emojis: [
			"😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", 
			"😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", 
			"🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", 
			"😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", 
			"😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", 
			"🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", 
			"😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", 
			"😷", "🤒", "🤕"
		]
	},
	"Gestos": {
		icon: "👍",
		emojis: [
			"👍", "👎", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", 
			"👆", "🖕", "👇", "☝️", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", 
			"🤳", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🧠", "🫀", "🫁", 
			"🦷", "🦴", "👀", "👁️", "👅", "👄", "💋"
		]
	},
	"Objetos": {
		icon: "❤️",
		emojis: [
			"❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", 
			"💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉️", "☸️", 
			"✡️", "🔯", "🕎", "☯️", "☦️", "🛐", "⛎", "♈", "♉", "♊", "♋", "♌", "♍", 
			"♎", "♏", "♐", "♑", "♒", "♓", "🔥", "💯", "💢", "💦", "💨", "🎉", "🎊", 
			"🎈", "🎁", "🏆", "🥇", "🥈", "🥉", "⭐", "🌟", "💫", "✨"
		]
	},
	"Animales": {
		icon: "🐶",
		emojis: [
			"🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨", "🐯", "🦁", 
			"🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", 
			"🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", 
			"🐛", "🦋", "🐌", "🐞", "🐜", "🦟", "🦗", "🕷️", "🦂", "🐢", "🐍", "🦎", 
			"🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", 
			"🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🐘", "🦣", "🦏", "🦛", 
			"🐪", "🐫", "🦒", "🦘", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙", 
			"🐐", "🦌", "🐕", "🐩", "🦮", "🐕‍🦺", "🐈", "🐈‍⬛", "🐓", "🦃", "🦚", "🦜", 
			"🦢", "🦩", "🕊️", "🐇", "🦝", "🦨", "🦡", "🦦", "🦥", "🐁", "🐀", "🐿️"
		]
	},
	"Comida": {
		icon: "🍕",
		emojis: [
			"🍎", "🍏", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", 
			"🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", 
			"🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", 
			"🥨", "🧀", "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", 
			"🌭", "🍔", "🍟", "🍕", "🫓", "🥪", "🥙", "🧆", "🌮", "🌯", "🫔", "🥗", 
			"🥘", "🫕", "🥫", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟", "🦪", "🍤", 
			"🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡", "🍧", "🍨", "🍦", "🥧", 
			"🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "🌰", "🥜"
		]
	},
	"Actividades": {
		icon: "⚽",
		emojis: [
			"⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", 
			"🏸", "🏑", "🏒", "🥍", "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", 
			"🥊", "🥋", "🎽", "🛹", "🛷", "⛸️", "🥌", "🎿", "⛷️", "🏂", "🪂", "🏋️", 
			"🤼", "🤸", "⛹️", "🤺", "🏌️", "🏇", "🧘", "🏄", "🏊", "🤽", "🚣", "🧗", 
			"🚵", "🚴", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🏵️", "🎗️", "🎫", "🎟️", 
			"🎪", "🤹", "🎭", "🩰", "🎨", "🎬", "🎤", "🎧", "🎼", "🎵", "🎶", "🎹", 
			"🥁", "🎷", "🎺", "🎸", "🪕", "🎻", "🎲", "♠️", "♥️", "♦️", "♣️", "♟️", 
			"🃏", "🀄", "🎴", "🎮", "🕹️", "🎯"
		]
	},
	"Viajes": {
		icon: "✈️",
		emojis: [
			"🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", 
			"🚛", "🚜", "🏍️", "🛵", "🚲", "🛴", "🛹", "🛼", "🚁", "🛸", "✈️", "🛩️", 
			"🛫", "🛬", "🪂", "⛵", "🚤", "🛥️", "🛳️", "⛴️", "🚢", "⚓", "⛽", "🚧", 
			"🚦", "🚥", "🚏", "🗺️", "🎡", "🎢", "🎠", "⛲", "⛱️", "🏖️", "🏝️", "🏜️", 
			"🌋", "⛰️", "🏔️", "🗻", "🏕️", "⛺", "🏠", "🏡", "🏘️", "🏚️", "🏗️", "🏭", 
			"🏢", "🏬", "🏣", "🏤", "🏥", "🏦", "🏨", "🏪", "🏫", "🏩", "💒", "🏛️", 
			"⛪", "🕌", "🛕", "🕍", "🕋", "⛩️", "🛤️", "🛣️", "🗾", "🎑", "🏞️", "🌅", 
			"🌄", "🌠", "🎇", "🎆", "🌇", "🌆", "🏙️", "🌃", "🌌", "🌉", "🌁"
		]
	}
};

// Lista de emojis frecuentes que se actualiza dinámicamente
const getFrequentEmojis = () => {
	try {
		const stored = localStorage.getItem('frequent-emojis');
		if (stored) {
			const frequent = JSON.parse(stored);
			return frequent.slice(0, 12); // Solo los 12 más frecuentes
		}
	} catch (error) {
		console.error('Error loading frequent emojis:', error);
	}
	return EMOJI_CATEGORIES["Frecuentes"].emojis;
};

// Función para guardar uso de emoji
const saveEmojiUsage = (emoji: string) => {
	try {
		const stored = localStorage.getItem('frequent-emojis');
		let frequent: string[] = stored ? JSON.parse(stored) : [];
		
		// Remover si ya existe y agregarlo al principio
		frequent = frequent.filter(e => e !== emoji);
		frequent.unshift(emoji);
		
		// Mantener solo los 20 más frecuentes
		frequent = frequent.slice(0, 20);
		
		localStorage.setItem('frequent-emojis', JSON.stringify(frequent));
	} catch (error) {
		console.error('Error saving emoji usage:', error);
	}
};

const MessageForm: React.FC<MessageFormProps> = ({
	onSendMessage,
	isDisabled = false,
	disabledText = "Esta conversación está cerrada",
	placeholder = "Escribe un mensaje...",
	isLoading = false,
	chatId,
}) => {
	const [message, setMessage] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState("Frecuentes");
	const [emojiSearch, setEmojiSearch] = useState("");
	const [recentEmojis, setRecentEmojis] = useState<string[]>(() => getFrequentEmojis());
	
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const emojiPickerRef = useRef<HTMLDivElement>(null);
	const emojiSearchRef = useRef<HTMLInputElement>(null);
	const isMounted = useRef(true);

	// Hook para indicador de escritura
	const { startTyping, stopTyping } = useTypingIndicator(chatId);

	useEffect(() => {
		return () => {
			isMounted.current = false;
			// Detener indicador de escritura al desmontar
			stopTyping();
		};
	}, [stopTyping]);

	// Actualizar emojis frecuentes cuando se abre el picker
	useEffect(() => {
		if (showEmojiPicker) {
			setRecentEmojis(getFrequentEmojis());
		}
	}, [showEmojiPicker]);

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
				setEmojiSearch("");
			}
		};

		if (showEmojiPicker) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showEmojiPicker]);

	// Focus en búsqueda cuando se abre el picker
	useEffect(() => {
		if (showEmojiPicker && emojiSearchRef.current) {
			setTimeout(() => {
				emojiSearchRef.current?.focus();
			}, 100);
		}
	}, [showEmojiPicker]);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		setError(null);

		if (isDisabled || isLoading || !message.trim()) {
			console.log("Envío bloqueado:", {
				isDisabled,
				isLoading,
				messageEmpty: !message.trim(),
			});
			return;
		}

		const messageToSend = message.trim();

		// Detener indicador de escritura
		stopTyping();

		try {
			console.log("Enviando mensaje:", messageToSend);
			const success = await onSendMessage(messageToSend);

			if (isMounted.current) {
				if (success) {
					console.log("Mensaje enviado correctamente");
					setMessage("");
					// Reset altura del textarea
					if (textareaRef.current) {
						textareaRef.current.style.height = "auto";
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

	// Ajustar altura automáticamente y activar indicador de escritura
	const autoAdjustHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const textarea = e.target;
		const newValue = textarea.value;

		textarea.style.height = "auto";

		const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 150);
		textarea.style.height = `${newHeight}px`;

		setMessage(newValue);

		// Manejar indicador de escritura
		if (newValue.trim() && !isDisabled && !isLoading) {
			startTyping();
		} else if (!newValue.trim()) {
			stopTyping();
		}
	};

	// Insertar emoji en el mensaje
	const insertEmoji = (emoji: string) => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const newMessage = message.slice(0, start) + emoji + message.slice(end);
		
		setMessage(newMessage);
		
		// Guardar uso del emoji
		saveEmojiUsage(emoji);
		
		// Restaurar la posición del cursor después del emoji
		setTimeout(() => {
			if (textarea) {
				textarea.focus();
				textarea.setSelectionRange(start + emoji.length, start + emoji.length);
				// Reajustar altura
				textarea.style.height = "auto";
				const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 150);
				textarea.style.height = `${newHeight}px`;
			}
		}, 0);
	};

	// Filtrar emojis por búsqueda
	const getFilteredEmojis = (categoryEmojis: string[]) => {
		if (!emojiSearch.trim()) return categoryEmojis;
		
		// Buscar por el texto del emoji (muy básico)
		return categoryEmojis.filter(emoji => {
			// Aquí podrías implementar una búsqueda más sofisticada con nombres de emojis
			return emoji.includes(emojiSearch.trim());
		});
	};

	// Obtener emojis de la categoría actual
	const getCurrentEmojis = () => {
		if (selectedCategory === "Frecuentes") {
			return getFilteredEmojis(recentEmojis);
		}
		return getFilteredEmojis(EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES].emojis);
	};

	// Si el chat está deshabilitado, mostrar mensaje informativo
	if (isDisabled) {
		return (
			<div className="p-4 border-t border-gray-200 bg-gray-50">
				<div className="flex items-center justify-center space-x-2 text-gray-500">
					<Clock size={16} />
					<p className="text-sm">{disabledText}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-4 border-t border-gray-200 bg-white relative">
			{error && (
				<div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-start space-x-2">
					<div className="flex-shrink-0 mt-0.5">
						⚠️
					</div>
					<div className="flex-1">
						{error}
					</div>
					<button 
						onClick={() => setError(null)}
						className="flex-shrink-0 text-red-400 hover:text-red-600"
					>
						×
					</button>
				</div>
			)}

			{/* Emoji Picker Mejorado */}
			{showEmojiPicker && (
				<div 
					ref={emojiPickerRef}
					className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-300 rounded-xl shadow-xl z-50 overflow-hidden"
					style={{ maxHeight: '320px' }}
				>
					{/* Header con búsqueda */}
					<div className="p-3 border-b border-gray-200 bg-gray-50">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
							<input
								ref={emojiSearchRef}
								type="text"
								placeholder="Buscar emojis..."
								value={emojiSearch}
								onChange={(e) => setEmojiSearch(e.target.value)}
								className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
							/>
						</div>
					</div>

					{/* Pestañas de categorías */}
					<div className="border-b border-gray-200 bg-gray-50">
						<div className="flex overflow-x-auto scrollbar-hide">
							{Object.entries(EMOJI_CATEGORIES).map(([categoryName, categoryData]) => (
								<button
									key={categoryName}
									onClick={() => {
										setSelectedCategory(categoryName);
										setEmojiSearch("");
									}}
									className={`flex-shrink-0 px-3 py-2 text-lg hover:bg-gray-100 transition-colors ${
										selectedCategory === categoryName
											? "bg-primary-100 border-b-2 border-primary-500"
											: ""
									}`}
									title={categoryName}
								>
									{categoryName === "Frecuentes" ? "🕒" : categoryData.icon}
								</button>
							))}
						</div>
					</div>

					{/* Grid de emojis */}
					<div className="p-2 max-h-48 overflow-y-auto">
						<div className="grid grid-cols-8 gap-1">
							{getCurrentEmojis().map((emoji, index) => (
								<button
									key={`${emoji}-${index}`}
									onClick={() => {
										insertEmoji(emoji);
										// No cerrar el picker automáticamente para permitir múltiples selecciones
									}}
									className="p-2 text-lg hover:bg-gray-100 rounded-lg transition-colors transform hover:scale-110 active:scale-95"
									title={emoji}
								>
									{emoji}
								</button>
							))}
						</div>
						
						{getCurrentEmojis().length === 0 && (
							<div className="text-center py-8 text-gray-500">
								<div className="text-2xl mb-2">🔍</div>
								<p className="text-sm">No se encontraron emojis</p>
							</div>
						)}
					</div>

					{/* Footer */}
					<div className="p-2 border-t border-gray-200 bg-gray-50 text-center">
						<button
							onClick={() => setShowEmojiPicker(false)}
							className="text-xs text-gray-500 hover:text-gray-700"
						>
							Presiona ESC para cerrar
						</button>
					</div>
				</div>
			)}

			<form onSubmit={handleSubmit} className="flex items-end space-x-3">
				{/* Botón de emojis */}
				<button
					type="button"
					onClick={() => setShowEmojiPicker(!showEmojiPicker)}
					className={`flex-shrink-0 p-2 rounded-full transition-colors ${
						showEmojiPicker 
							? "bg-primary-100 text-primary-600" 
							: "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
					}`}
					disabled={isLoading}
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
						className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
						rows={1}
						style={{minHeight: "44px", maxHeight: "150px"}}
						disabled={isLoading}
					/>
					<div className="flex items-center justify-between mt-1 px-1">
						<p className="text-xs text-gray-500">
							{isLoading ? "Enviando..." : "Ctrl+Enter para enviar"}
						</p>
						{message.length > 0 && (
							<p className="text-xs text-gray-400">
								{message.length}/2000
							</p>
						)}
					</div>
				</div>

				{/* Botón de envío */}
				<button
					type="submit"
					className={`flex-shrink-0 h-11 w-11 rounded-full flex items-center justify-center transition-all transform ${
						message.trim() && !isLoading
							? "bg-primary-600 text-white hover:bg-primary-700 hover:scale-105 active:scale-95 shadow-lg"
							: "bg-gray-300 text-gray-600 cursor-not-allowed"
					}`}
					disabled={!message.trim() || isLoading}
					title={isLoading ? "Enviando..." : "Enviar mensaje"}
				>
					{isLoading ? (
						<Loader2 className="h-5 w-5 animate-spin" />
					) : (
						<Send size={18} />
					)}
				</button>
			</form>

			{/* Atajos de teclado */}
			{showEmojiPicker && (
				<div 
					className="fixed inset-0 z-40" 
					onClick={() => setShowEmojiPicker(false)}
					onKeyDown={(e) => {
						if (e.key === 'Escape') {
							setShowEmojiPicker(false);
						}
					}}
					tabIndex={-1}
				/>
			)}
		</div>
	);
};

export default MessageForm;