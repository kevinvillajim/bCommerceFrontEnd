import React, {useRef, useEffect, useState} from "react";
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
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const [prevMessagesLength, setPrevMessagesLength] = useState(0);

	// Scroll automático cuando hay nuevos mensajes
	useEffect(() => {
		if (messages.length > 0) {
			console.log(`Mostrando ${messages.length} mensajes en el chat`);
		}

		// Scroll automático si hay nuevos mensajes
		if (messages.length > prevMessagesLength) {
			if (messagesEndRef.current) {
				messagesEndRef.current.scrollIntoView({behavior: "smooth"});
			}
		}

		// Actualizar el contador de mensajes previos
		setPrevMessagesLength(messages.length);
	}, [messages.length, prevMessagesLength]);

	// También hacer scroll al montar el componente
	useEffect(() => {
		if (messagesEndRef.current && messages.length > 0) {
			messagesEndRef.current.scrollIntoView({behavior: "auto"});
		}
	}, []);

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

	// Mostrar mensajes de estado
	if (loading && messages.length === 0) {
		return (
			<div className="flex justify-center items-center h-full p-8">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	if (!messages.length) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-center p-8">
				<div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
					<User className="h-8 w-8 text-gray-500" />
				</div>
				<h3 className="text-lg font-medium text-gray-900">
					{noMessagesText}
				</h3>
				<p className="text-sm text-gray-500 mt-2">
					Envía un mensaje para iniciar la conversación
				</p>
			</div>
		);
	}

	return (
		<div
			className="space-y-4 p-4 overflow-y-auto"
			style={{height: "calc(70vh - 180px)"}}
			ref={messagesContainerRef}
		>
			{messages.map((message, index) => (
				<div
					key={message.id || `temp-${index}`}
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
									<div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
										<User className="h-4 w-4 text-gray-500" />
									</div>
								)}
							</div>
						)}
						<div
							className={`rounded-lg px-4 py-2 ${
								message.isMine
									? "bg-primary-600 text-white"
									: "bg-gray-100 text-gray-800"
							}`}
						>
							<p className="text-sm whitespace-pre-wrap break-words">
								{message.content}
							</p>
							<p
								className={`text-xs mt-1 flex items-center ${
									message.isMine
										? "text-primary-100"
										: "text-gray-500"
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

			{/* Indicador de carga para nuevos mensajes */}
			{loading && messages.length > 0 && (
				<div className="flex justify-center py-2">
					<div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
				</div>
			)}
		</div>
	);
};

export default ChatMessages;
