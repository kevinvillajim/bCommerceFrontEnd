import React, {useRef, useEffect} from "react";
import {User, Clock} from "lucide-react";
import type {Message} from "../../../core/domain/entities/Chat";
import {formatDistanceToNow} from "date-fns";
import {es} from "date-fns/locale";

interface ChatMessagesProps {
	messages: Message[];
	loading: boolean;
	noMessagesText?: string;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
	messages,
	loading,
	noMessagesText = "No hay mensajes",
}) => {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Hacer scroll al último mensaje cuando hay nuevos mensajes
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({behavior: "smooth"});
		}
	}, [messages]);

	// Formatear fecha relativa
	const formatDate = (dateString: string) => {
		try {
			return formatDistanceToNow(new Date(dateString), {
				addSuffix: true,
				locale: es,
			});
		} catch (error) {
			return "fecha desconocida";
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-full">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	if (!messages.length) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-center p-4">
				<div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
					<User className="h-8 w-8 text-gray-500 dark:text-gray-400" />
				</div>
				<h3 className="text-lg font-medium text-gray-900 dark:text-white">
					{noMessagesText}
				</h3>
				<p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
					Envía un mensaje para iniciar la conversación
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4 p-4">
			{messages.map((message) => (
				<div
					key={message.id}
					className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}
				>
					<div className="flex max-w-xs lg:max-w-md">
						{!message.isMine && (
							<div className="flex-shrink-0 mr-2">
								{message.sender?.avatar ? (
									<img
										src={message.sender.avatar}
										alt={message.sender?.name}
										className="h-8 w-8 rounded-full"
										onError={(e) => {
											const target = e.target as HTMLImageElement;
											target.onerror = null;
											target.src = "https://via.placeholder.com/32?text=U";
										}}
									/>
								) : (
									<div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
										<User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
									</div>
								)}
							</div>
						)}
						<div
							className={`rounded-lg px-4 py-2 ${
								message.isMine
									? "bg-primary-600 text-white"
									: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
							}`}
						>
							<p className="text-sm whitespace-pre-wrap break-words">
								{message.content}
							</p>
							<p
								className={`text-xs mt-1 flex items-center ${
									message.isMine
										? "text-primary-100"
										: "text-gray-500 dark:text-gray-400"
								}`}
							>
								<Clock className="h-3 w-3 mr-1" />
								{message.createdAt ? formatDate(message.createdAt) : "ahora"}
								{!message.isRead && message.isMine && (
									<span className="ml-1">· No leído</span>
								)}
							</p>
						</div>
					</div>
				</div>
			))}
			<div ref={messagesEndRef} />
		</div>
	);
};

export default ChatMessages;
