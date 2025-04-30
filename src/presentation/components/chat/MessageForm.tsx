import React, {useState, useRef, useEffect} from "react";
import type {FormEvent, KeyboardEvent} from "react";
import {Send} from "lucide-react";

interface MessageFormProps {
	onSendMessage: (message: string) => Promise<boolean>;
	isDisabled?: boolean;
	disabledText?: string;
	placeholder?: string;
	isLoading?: boolean;
}

const MessageForm: React.FC<MessageFormProps> = ({
	onSendMessage,
	isDisabled = false,
	disabledText = "Esta conversación está cerrada",
	placeholder = "Escribe un mensaje...",
	isLoading = false,
}) => {
	const [message, setMessage] = useState("");
	const [localLoading, setLocalLoading] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Mantener registro de montaje para evitar actualizar estados en componentes desmontados
	const isMounted = useRef(true);

	useEffect(() => {
		// Marcar cuando el componente se desmonta
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

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		// Validaciones de seguridad
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

			// Solo actualizar estado si el componente sigue montado
			if (isMounted.current) {
				if (success) {
					console.log("Mensaje enviado correctamente");
					setMessage("");
					// Enfocar el textarea después de enviar
					if (textareaRef.current) {
						textareaRef.current.focus();
					}
				} else {
					console.error("Error al enviar mensaje");
					// No limpiamos el mensaje para permitir reintentar
				}
			}
		} catch (error) {
			console.error("Error al enviar mensaje:", error);
			if (isMounted.current) {
				// También podríamos mostrar un toast o alerta aquí
			}
		} finally {
			if (isMounted.current) {
				setLocalLoading(false);
			}
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		// Enviar con Ctrl+Enter o Cmd+Enter (Mac)
		if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	// Si el chat está deshabilitado, mostrar mensaje informativo
	if (isDisabled) {
		return (
			<div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
				<p className="text-center text-gray-500 dark:text-gray-400">
					{disabledText}
				</p>
			</div>
		);
	}

	return (
		<div className="p-4 border-t border-gray-200 dark:border-gray-700">
			<form onSubmit={handleSubmit} className="flex items-end">
				<div className="flex-1 mr-2">
					<textarea
						ref={textareaRef}
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white resize-none"
						rows={2}
						disabled={isLoading || localLoading}
					/>
					<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
						Presiona Ctrl+Enter para enviar
					</p>
				</div>
				<button
					type="submit"
					className={`h-10 px-4 rounded-lg flex items-center justify-center transition-colors ${
						message.trim() && !isLoading && !localLoading
							? "bg-primary-600 text-white hover:bg-primary-700"
							: "bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300 cursor-not-allowed"
					}`}
					disabled={!message.trim() || isLoading || localLoading}
				>
					{isLoading || localLoading ? (
						<div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
					) : (
						<Send size={18} />
					)}
				</button>
			</form>
		</div>
	);
};

export default MessageForm;
