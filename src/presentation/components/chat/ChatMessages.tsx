import React, {useRef, useEffect, useState} from "react";
import {User, Clock, Check, CheckCheck, AlertCircle} from "lucide-react";
import type {Message} from "../../../core/domain/entities/Chat";
import {parseBackendDate, isToday, isYesterday} from "../../../utils/dateUtils";

interface ChatMessagesProps {
	messages: Message[];
	loading: boolean;
	noMessagesText?: string;
	currentUserId?: number;
}

// Enum para estados de mensaje mejorado
enum MessageStatus {
	SENDING = 'sending',
	SENT = 'sent',
	DELIVERED = 'delivered', 
	READ = 'read',
	ERROR = 'error'
}

// Función mejorada para obtener el estado del mensaje
const getMessageStatus = (message: Message, isFromCurrentUser: boolean): MessageStatus => {
	// Si no es del usuario actual, no evaluar estado
	if (!isFromCurrentUser) {
		return MessageStatus.DELIVERED;
	}

	// Verificar si hay error en el envío
	if (message.content && message.content.includes('[ERROR]')) {
		return MessageStatus.ERROR;
	}

	// Si el mensaje no tiene ID, se está enviando
	if (!message.id || message.id < 0) {
		return MessageStatus.SENDING;
	}

	// Si está marcado como leído por el receptor
	if (message.isRead) {
		return MessageStatus.READ;
	}

	// Si tiene fecha de creación, fue enviado y entregado
	if (message.createdAt) {
		return MessageStatus.DELIVERED;
	}

	// Por defecto, está enviado
	return MessageStatus.SENT;
};

// Componente mejorado para el icono de estado
const MessageStatusIcon: React.FC<{status: MessageStatus}> = ({status}) => {
	const getIcon = () => {
		switch (status) {
			case MessageStatus.SENDING:
				return (
					<div className="flex items-center">
						<Clock className="h-3 w-3 text-gray-400 animate-pulse" />
					</div>
				);
			case MessageStatus.SENT:
				return (
					<div className="flex items-center">
						<Check className="h-3 w-3 text-gray-400" />
					</div>
				);
			case MessageStatus.DELIVERED:
				return (
					<div className="flex items-center">
						<CheckCheck className="h-3 w-3 text-gray-400" />
					</div>
				);
			case MessageStatus.READ:
				return (
					<div className="flex items-center">
						<CheckCheck className="h-3 w-3 text-primary-500" />
					</div>
				);
			case MessageStatus.ERROR:
				return (
					<div className="flex items-center" title="Error al enviar mensaje">
						<AlertCircle className="h-3 w-3 text-red-500" />
					</div>
				);
			default:
				return null;
		}
	};

	return <span className="ml-1 flex-shrink-0">{getIcon()}</span>;
};

// Función mejorada para formatear fecha para separadores
const formatDateSeparator = (dateString: string): string => {
	try {
		const date = parseBackendDate(dateString);
		if (!date) return '';

		if (isToday(dateString)) {
			return 'Hoy';
		} else if (isYesterday(dateString)) {
			return 'Ayer';
		} else {
			const now = new Date();
			const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
			
			if (diffInDays < 7) {
				// Mostrar día de la semana para la semana pasada
				return date.toLocaleDateString('es-EC', { weekday: 'long' });
			} else {
				// Fecha completa para fechas más antiguas
				return date.toLocaleDateString('es-EC', { 
					day: 'numeric',
					month: 'long',
					year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
				});
			}
		}
	} catch (error) {
		console.error('Error formateando fecha separador:', error);
		return '';
	}
};

// Función mejorada para formatear hora del mensaje
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

// Función mejorada para agrupar mensajes por fecha
const groupMessagesByDate = (messages: Message[]) => {
	const groups: { date: string; messages: Message[]; dateKey: string }[] = [];
	
	// Ordenar mensajes por fecha de creación (más antiguos primero)
	const sortedMessages = [...messages].sort((a, b) => {
		const dateA = a.createdAt ? parseBackendDate(a.createdAt)?.getTime() || 0 : 0;
		const dateB = b.createdAt ? parseBackendDate(b.createdAt)?.getTime() || 0 : 0;
		return dateA - dateB;
	});
	
	sortedMessages.forEach((message) => {
		if (!message.createdAt) return;
		
		const messageDate = parseBackendDate(message.createdAt);
		if (!messageDate) return;
		
		// Usar solo la fecha (sin hora) como clave
		const dateKey = messageDate.toDateString();
		let group = groups.find(g => g.dateKey === dateKey);
		
		if (!group) {
			group = { 
				date: formatDateSeparator(message.createdAt), 
				messages: [], 
				dateKey 
			};
			groups.push(group);
		}
		
		group.messages.push(message);
	});
	
	// Los grupos ya están ordenados por fecha (más antiguos primero)
	return groups;
};

// Función para determinar si dos mensajes consecutivos son del mismo usuario (para agrupar visualmente)
const shouldGroupWithPrevious = (currentMessage: Message, previousMessage: Message): boolean => {
	if (!previousMessage) return false;
	
	// Mismo remitente
	if (currentMessage.senderId !== previousMessage.senderId) return false;
	
	// Diferencia de tiempo menor a 5 minutos
	const currentTime = currentMessage.createdAt ? parseBackendDate(currentMessage.createdAt)?.getTime() : 0;
	const previousTime = previousMessage.createdAt ? parseBackendDate(previousMessage.createdAt)?.getTime() : 0;
	
	if (!currentTime || !previousTime) return false;
	
	const diffInMinutes = (currentTime - previousTime) / (1000 * 60);
	return diffInMinutes < 5;
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
	const [autoScroll, setAutoScroll] = useState(true);

	// Detectar si el usuario está al final del chat
	const handleScroll = () => {
		if (messagesContainerRef.current) {
			const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
			const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
			setAutoScroll(isAtBottom);
		}
	};

	// Scroll automático mejorado
	useEffect(() => {
		if (messages.length > 0) {
			console.log(`📱 Mostrando ${messages.length} mensajes en estilo WhatsApp`);
		}

		// Scroll automático solo si hay nuevos mensajes y el usuario está al final
		if (messages.length > prevMessagesLength && autoScroll) {
			if (messagesEndRef.current) {
				messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
			}
		}

		setPrevMessagesLength(messages.length);
	}, [messages.length, prevMessagesLength, autoScroll]);

	// Scroll inicial
	useEffect(() => {
		if (messagesEndRef.current && messages.length > 0) {
			setTimeout(() => {
				messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
			}, 100);
		}
	}, []);

	// Mostrar estado de carga inicial
	if (loading && messages.length === 0) {
		return (
			<div className="flex justify-center items-center h-full p-8">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	// Mostrar estado vacío
	if (!messages.length) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-center p-8">
				<div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
					<User className="h-8 w-8 text-gray-500" />
				</div>
				<h3 className="text-lg font-medium text-gray-900 mb-2">
					{noMessagesText}
				</h3>
				<p className="text-sm text-gray-500">
					Envía un mensaje para iniciar la conversación
				</p>
			</div>
		);
	}

	// Agrupar mensajes por fecha
	const messageGroups = groupMessagesByDate(messages);

	return (
		<div className="flex flex-col h-full bg-gray-50">
			<div
				className="flex-1 overflow-y-auto px-4 py-2 space-y-1"
				style={{ height: "calc(70vh - 180px)" }}
				ref={messagesContainerRef}
				onScroll={handleScroll}
			>
				{messageGroups.map((group, groupIndex) => (
					<div key={`${group.dateKey}-${groupIndex}`} className="space-y-1">
						{/* Separador de fecha estilo WhatsApp */}
						<div className="flex justify-center my-4">
							<div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-gray-200">
								<span className="text-xs text-gray-600 font-medium">
									{group.date}
								</span>
							</div>
						</div>

						{/* Mensajes del día */}
						{group.messages.map((message, index) => {
							const isFromCurrentUser = message.isMine || (currentUserId !== undefined && message.senderId === currentUserId);
							const messageStatus = getMessageStatus(message, Boolean(isFromCurrentUser));
							const previousMessage = index > 0 ? group.messages[index - 1] : null;
							const nextMessage = index < group.messages.length - 1 ? group.messages[index + 1] : null;
							
							const shouldGroup = previousMessage ? shouldGroupWithPrevious(message, previousMessage) : false;
							const shouldGroupNext = nextMessage ? shouldGroupWithPrevious(nextMessage, message) : false;
							
							// Determinar el radio de la burbuja
							const getBubbleRadius = () => {
								if (isFromCurrentUser) {
									// Mensajes propios (derecha)
									if (shouldGroup && shouldGroupNext) return "rounded-l-2xl rounded-r-md rounded-tr-2xl"; // Medio
									if (shouldGroup) return "rounded-l-2xl rounded-r-2xl rounded-tr-md"; // Último
									if (shouldGroupNext) return "rounded-2xl rounded-br-md"; // Primero
									return "rounded-2xl"; // Solo
								} else {
									// Mensajes de otros (izquierda)
									if (shouldGroup && shouldGroupNext) return "rounded-r-2xl rounded-l-md rounded-tl-2xl"; // Medio
									if (shouldGroup) return "rounded-r-2xl rounded-l-2xl rounded-tl-md"; // Último
									if (shouldGroupNext) return "rounded-2xl rounded-bl-md"; // Primero
									return "rounded-2xl"; // Solo
								}
							};

							return (
								<div
									key={message.id || `temp-${groupIndex}-${index}`}
									className={`flex ${isFromCurrentUser ? "justify-end" : "justify-start"} ${shouldGroup ? 'mt-0.5' : 'mt-3'}`}
								>
									<div className={`flex max-w-xs lg:max-w-md items-end ${isFromCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
										{/* Avatar solo para mensajes de otros y cuando no está agrupado */}
										{!isFromCurrentUser && !shouldGroupNext && (
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

										{/* Espaciador cuando está agrupado */}
										{!isFromCurrentUser && shouldGroupNext && (
											<div className="w-8 flex-shrink-0" />
										)}

										{/* Burbuja del mensaje */}
										<div
											className={`
												relative px-3 py-2 max-w-full break-words shadow-sm
												${getBubbleRadius()}
												${isFromCurrentUser
													? "bg-primary-500 text-white"
													: "bg-white text-gray-800 border border-gray-200"
												}
											`}
										>
											{/* Nombre del remitente (solo para mensajes de otros y cuando no está agrupado) */}
											{!isFromCurrentUser && !shouldGroup && message.sender?.name && (
												<p className="text-xs font-medium text-primary-600 mb-1">
													{message.sender.name}
												</p>
											)}

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
				))}

				{/* Elemento para scroll automático */}
				<div ref={messagesEndRef} className="h-1" />

				{/* Indicador de carga para nuevos mensajes */}
				{loading && messages.length > 0 && (
					<div className="flex justify-center py-2">
						<div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
							<div className="flex items-center space-x-2">
								<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-600"></div>
								<span className="text-xs text-gray-600">Cargando mensajes...</span>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Botón para volver al final cuando no está en auto-scroll */}
			{!autoScroll && (
				<div className="absolute bottom-20 right-4 z-10">
					<button
						onClick={() => {
							setAutoScroll(true);
							messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
						}}
						className="bg-primary-500 text-white p-2 rounded-full shadow-lg hover:bg-primary-600 transition-colors"
						title="Ir al final"
					>
						↓
					</button>
				</div>
			)}
		</div>
	);
};

export default ChatMessages;