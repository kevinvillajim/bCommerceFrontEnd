import React, { useState } from "react";
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

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		if (isDisabled || isLoading || !message.trim()) {
			return;
		}

		const success = await onSendMessage(message);
		if (success) {
			setMessage("");
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		// Enviar con Ctrl+Enter o Cmd+Enter (Mac)
		if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
			e.preventDefault();
			handleSubmit(e);
		}
	};

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
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white resize-none"
						rows={2}
						disabled={isLoading}
					/>
					<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
						Presiona Ctrl+Enter para enviar
					</p>
				</div>
				<button
					type="submit"
					className={`h-10 px-4 rounded-lg flex items-center justify-center transition-colors ${
						message.trim() && !isLoading
							? "bg-primary-600 text-white hover:bg-primary-700"
							: "bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300 cursor-not-allowed"
					}`}
					disabled={!message.trim() || isLoading}
				>
					{isLoading ? (
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
