import React, {useRef, useEffect, useState} from "react";
import {User, Clock, Check, CheckCheck} from "lucide-react";
import type {Message} from "../../../core/domain/entities/Chat";
import {formatRelativeTime, parseBackendDate, isToday, isYesterday} from "../../../utils/dateUtils";

interface ChatMessagesProps {
	messages: Message[];
	loading: boolean;
	noMessagesText?: string;
	currentUserId?: number; // Para determinar si los mensajes son míos
}

// Enum para estados de mensaje
enum MessageStatus {
	SENDING = 'sending',
	SENT = 'sent',
	DELIVERED = 'delivered', 
	READ = 'read',
	ERROR = 'error'
}

// Función para obtener el estado del mensaje
const getMessageStatus = (message: Message, isFromCurrentUser: boolean): MessageStatus => {
	// Si no es del usuario actual, no mostrar estado
	if (!isFromCurrentUser) {
		return MessageStatus.DELIVERED; // No se mostrará el icono
	}

	// Si el mensaje no tiene ID, se está enviando
	if (!message.id) {
		return MessageStatus.SENDING;
	}

	// Si está marcado como leído
	if (message.isRead) {
		return MessageStatus.READ;
	}

	// Si tiene fecha de creación, fue enviado y entregado
	if (message.createdAt) {
		return MessageStatus.DELIVERED;
	}

	// Si llegó hasta aquí, está enviado pero no entregado
	return MessageStatus.SENT;
};

// Componente para el icono de estado
const MessageStatusIcon: React.FC<{status: MessageStatus}> = ({status}) => {
	const getIcon = () => {
		switch (status) {
			case MessageStatus.SENDING:
				return <Clock className="h-3 w-3 text-gray-400 animate-spin" />;
			case MessageStatus.SENT:
				return <Check className="h-3 w-3 text-gray-400" />;
			case MessageStatus.DELIVERED:
				return <CheckCheck className="h-3 w-3 text-gray-400" />;
			case MessageStatus.READ:
				return <CheckCheck className="h-3 w-3 text-primary-500" />;
			case MessageStatus.ERROR:
				return <Clock className="h-3 w-3 text-red-500" />;
			default:
				return null;
		}
	};

	return <span className="ml-1 flex-shrink-0">{getIcon()}</span>;
};

// Función para formatear fecha para separadores
const formatDateSeparator = (dateString: string): string => {
	try {
		const date = parseBackendDate(dateString);
		if (!date) return '';

		if (isToday(dateString)) {
			return 'Hoy';
		} else if (isYesterday(dateString)) {
			return 'Ayer';
		} else {
			return date.toLocaleDateString('es-EC', { 
				weekday: 'long', 
				year: 'numeric', 
				month: 'long', 
				day: 'numeric' 
			});
		}
	} catch (error) {
		console.error('Error formateando fecha separador:', error);
		return '';
	}
};

// Función para formatear hora del mensaje
const formatMessageTime = (dateString: string): string => {
	try {
		if (!dateString) return '';
		
		const date = parseBackendDate(dateString);
		if (!date) return '';

		return date.toLocaleTimeString('es-EC', { 
			hour: '2-digit', 
			minute: '2-digit',
			hour12: false 
		});
	} catch (error) {
		console.error('Error formateando hora:', error);
		return '';
	}
};

// Función para agrupar mensajes por fecha
const groupMessagesByDate = (messages: Message[]) => {
	const groups: { date: string; messages: Message[] }[] = [];
	
	messages.forEach((message) => {
		if (!message.createdAt) return;
		
		const messageDate = parseBackendDate(message.createdAt);
		if (!messageDate) return;
		
		const dateKey = messageDate.toDateString();
		let group = groups.find(g => g.date === dateKey);
		
		if (!group) {
			group = { date: dateKey, messages: [] };
			groups.push(group);
		}
		
		group.messages.push(message);
	});
	
	// Ordenar grupos por fecha (más antiguos primero)
	groups.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
	
	// Dentro de cada grupo, ordenar mensajes por hora (más antiguos primero)
	groups.forEach(group => {
		group.messages.sort((a, b) => {
			const dateA = a.createdAt ? parseBackendDate(a.createdAt)?.getTime() || 0 : 0;
			const dateB = b.createdAt ? parseBackendDate(b.createdAt)?.getTime() || 0 : 0;
			return dateA - dateB;
		});
	});
	
	return groups;
};

const ChatMessages: React.FC<ChatMessagesProps> = ({
	messages,
	loading,
	noMessagesText = "No hay mensajes",
	currentUserId
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

		setPrevMessagesLength(messages.length);
	}, [messages.length, prevMessagesLength]);

	// También hacer scroll al montar el componente
	useEffect(() => {
		if (messagesEndRef.current && messages.length > 0) {
			messagesEndRef.current.scrollIntoView({behavior: "auto"});
		}
	}, []);

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

	// Agrupar mensajes por fecha
	const messageGroups = groupMessagesByDate(messages);

	return (
		<div
			className="flex flex-col p-4 overflow-y-auto bg-gray-50"
			style={{height: "calc(70vh - 180px)"}}
			ref={messagesContainerRef}
		>
			{messageGroups.map((group, groupIndex) => (
				<div key={group.date} className="mb-4">
					{/* Separador de fecha */}
					<div className="flex justify-center mb-4">
						<div className="bg-white px-3 py-1 rounded-full shadow-sm border">
							<span className="text-xs text-gray-600 font-medium">
								{formatDateSeparator(group.messages[0]?.createdAt || '')}
							</span>
						</div>
					</div>

					{/* Mensajes del día */}
					<div className="space-y-3">
						{group.messages.map((message, index) => {
							const isFromCurrentUser = message.isMine || (currentUserId && message.senderId === currentUserId);
							const messageStatus = getMessageStatus(message, Boolean(isFromCurrentUser));
							
							return (
								<div
									key={message.id || `temp-${groupIndex}-${index}`}
									className={`flex ${isFromCurrentUser ? "justify-end" : "justify-start"}`}
								>
									<div className="flex max-w-xs lg:max-w-md items-end">
										{/* Avatar para mensajes de otros usuarios */}
										{!isFromCurrentUser && (
											<div className="flex-shrink-0 mr-2 mb-1">
												{message.sender?.avatar ? (
													<img
														src={message.sender.avatar}
														alt={message.sender?.name}
														className="h-6 w-6 rounded-full"
														onError={(e) => {
															const target = e.target as HTMLImageElement;
															target.onerror = null;
															target.src = "https://via.placeholder.com/24?text=U";
														}}
													/>
												) : (
													<div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
														<User className="h-3 w-3 text-gray-600" />
													</div>
												)}
											</div>
										)}

										{/* Burbuja del mensaje */}
										<div
											className={`
												relative px-3 py-2 rounded-2xl max-w-full break-words
												${isFromCurrentUser
													? "bg-primary-500 text-white rounded-br-md"
													: "bg-white text-gray-800 rounded-bl-md border border-gray-200"
												}
											`}
										>
											{/* Contenido del mensaje */}
											<p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
												{message.content}
											</p>

											{/* Información de hora y estado */}
											<div 
												className={`
													flex items-center justify-end mt-1 space-x-1
													${isFromCurrentUser ? "text-primary-100" : "text-gray-500"}
												`}
											>
												<span className="text-xs">
													{formatMessageTime(message.createdAt || '')}
												</span>
												
												{/* Icono de estado solo para mensajes propios */}
												{isFromCurrentUser && (
													<MessageStatusIcon status={messageStatus} />
												)}
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			))}

			{/* Elemento para scroll automático */}
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