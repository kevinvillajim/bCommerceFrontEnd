import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  User,
  Package,
  Mail,
  Circle,
  ChevronRight,
  Clock,
} from "lucide-react";
import type { Chat, Message } from "../../../core/domain/entities/Message";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

// Datos simulados para mensajes/chats
const mockChats: Chat[] = [
  {
    id: 1,
    userId: 101,
    sellerId: 2,
    productId: 201,
    status: "active",
    messages: [],
    createdAt: "2023-11-05T10:30:00Z",
    updatedAt: "2023-11-06T14:20:00Z",
    user: {
      id: 101,
      name: "Juan Pérez",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    product: {
      id: 201,
      name: "Auriculares Bluetooth",
      image: "https://via.placeholder.com/100",
      price: 89.99,
    },
    unreadCount: 2,
    lastMessage: {
      id: 1001,
      chatId: 1,
      senderId: 101,
      content: "¿Estos auriculares son compatibles con iPhone 12?",
      isRead: false,
      createdAt: "2023-11-06T14:20:00Z",
      isMine: false,
    },
  },
  {
    id: 2,
    userId: 102,
    sellerId: 2,
    productId: 202,
    status: "active",
    messages: [],
    createdAt: "2023-11-04T09:15:00Z",
    updatedAt: "2023-11-06T11:45:00Z",
    user: {
      id: 102,
      name: "María López",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    product: {
      id: 202,
      name: "Smartwatch Serie 5",
      image: "https://via.placeholder.com/100",
      price: 129.99,
    },
    unreadCount: 0,
    lastMessage: {
      id: 1002,
      chatId: 2,
      senderId: 2, // ID del vendedor
      content: "Sí, tenemos disponibilidad en todos los colores. Puede realizar el pedido directamente en la página.",
      isRead: true,
      createdAt: "2023-11-06T11:45:00Z",
      isMine: true,
    },
  },
  {
    id: 3,
    userId: 103,
    sellerId: 2,
    productId: 203,
    status: "active",
    messages: [],
    createdAt: "2023-11-02T16:20:00Z",
    updatedAt: "2023-11-05T18:30:00Z",
    user: {
      id: 103,
      name: "Carlos Rodríguez",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    product: {
      id: 203,
      name: "Cámara Digital 4K",
      image: "https://via.placeholder.com/100",
      price: 349.99,
    },
    unreadCount: 1,
    lastMessage: {
      id: 1003,
      chatId: 3,
      senderId: 103,
      content: "¿Cuál es el tiempo de entrega aproximado para este producto?",
      isRead: false,
      createdAt: "2023-11-05T18:30:00Z",
      isMine: false,
    },
  },
  {
    id: 4,
    userId: 104,
    sellerId: 2,
    productId: 204,
    status: "closed",
    messages: [],
    createdAt: "2023-10-28T14:10:00Z",
    updatedAt: "2023-11-01T09:25:00Z",
    user: {
      id: 104,
      name: "Laura Martínez",
      avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    },
    product: {
      id: 204,
      name: "Altavoz Bluetooth Portátil",
      image: "https://via.placeholder.com/100",
      price: 59.99,
    },
    unreadCount: 0,
    lastMessage: {
      id: 1004,
      chatId: 4,
      senderId: 2, // ID del vendedor
      content: "¡Perfecto! Su pedido ha sido enviado. El código de seguimiento es TX48756923.",
      isRead: true,
      createdAt: "2023-11-01T09:25:00Z",
      isMine: true,
    },
  },
  {
    id: 5,
    userId: 105,
    sellerId: 2,
    productId: 205,
    status: "archived",
    messages: [],
    createdAt: "2023-10-15T11:05:00Z",
    updatedAt: "2023-10-20T16:40:00Z",
    user: {
      id: 105,
      name: "Pedro Sánchez",
      avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    },
    product: {
      id: 205,
      name: "Tablet 10 pulgadas",
      image: "https://via.placeholder.com/100",
      price: 199.99,
    },
    unreadCount: 0,
    lastMessage: {
      id: 1005,
      chatId: 5,
      senderId: 105,
      content: "Gracias por su atención. Ya realicé la compra.",
      isRead: true,
      createdAt: "2023-10-20T16:40:00Z",
      isMine: false,
    },
  },
];

// Mensajes para un chat específico
const mockMessages: Message[] = [
  {
    id: 2001,
    chatId: 1,
    senderId: 101,
    content: "Hola, estoy interesado en estos auriculares. ¿Podría darme más información?",
    isRead: true,
    createdAt: "2023-11-05T10:35:00Z",
    sender: {
      id: 101,
      name: "Juan Pérez",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    isMine: false,
  },
  {
    id: 2002,
    chatId: 1,
    senderId: 2,
    content: "¡Hola! Claro, estos auriculares tienen una duración de batería de 20 horas, son resistentes al agua y tienen cancelación de ruido activa. ¿Qué más te gustaría saber?",
    isRead: true,
    createdAt: "2023-11-05T11:05:00Z",
    sender: {
      id: 2,
      name: "Mi Tienda",
      avatar: "",
    },
    isMine: true,
  },
  {
    id: 2003,
    chatId: 1,
    senderId: 101,
    content: "¿Son compatibles con iPhone 12?",
    isRead: false,
    createdAt: "2023-11-06T14:20:00Z",
    sender: {
      id: 101,
      name: "Juan Pérez",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    isMine: false,
  },
];

const SellerMessagesPage: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [unreadFilter, setUnreadFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [newMessage, setNewMessage] = useState<string>("");

  // Cargar datos al montar
  useEffect(() => {
    const fetchChats = () => {
      setLoading(true);
      // Simulación de carga de datos
      setTimeout(() => {
        setChats(mockChats);
        setLoading(false);
      }, 800);
    };

    fetchChats();
  }, []);

  // Cargar mensajes al seleccionar chat
  useEffect(() => {
    if (selectedChat) {
      setLoading(true);
      // Simulación de carga de mensajes
      setTimeout(() => {
        setMessages(mockMessages);
        setLoading(false);
      }, 500);
    }
  }, [selectedChat]);

  // Filtrar chats
  const filteredChats = chats.filter((chat) => {
    // Filtro por estado
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && chat.status === "active") ||
      (statusFilter === "closed" && chat.status === "closed") ||
      (statusFilter === "archived" && chat.status === "archived");

    // Filtro por mensajes no leídos
    const matchesUnread = unreadFilter ? chat.unreadCount && chat.unreadCount > 0 : true;

    // Búsqueda por nombre de usuario o producto
    const matchesSearch =
      searchTerm === "" ||
      (chat.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesUnread && matchesSearch;
  });

  // Seleccionar un chat
  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
  };

  // Enviar un mensaje
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    // Simular envío de mensaje
    const newMsg: Message = {
      id: Math.floor(Math.random() * 10000),
      chatId: selectedChat.id || 0,
      senderId: 2, // ID del vendedor
      content: newMessage,
      isRead: true,
      createdAt: new Date().toISOString(),
      sender: {
        id: 2,
        name: "Mi Tienda",
        avatar: "",
      },
      isMine: true,
    };

    setMessages((prevMessages) => [...prevMessages, newMsg]);
    setNewMessage("");
  };

  // Actualizar estado de chat (cerrar/archivar)
  const updateChatStatus = (chatId: number, newStatus: "active" | "closed" | "archived") => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          return { ...chat, status: newStatus };
        }
        return chat;
      })
    );

    // Si es el chat seleccionado, actualiza también ese estado
    if (selectedChat && selectedChat.id === chatId) {
      setSelectedChat({ ...selectedChat, status: newStatus });
    }
  };

  // Refrescar lista de chats
  const refreshChats = () => {
    setLoading(true);
    // Simulación de recarga
    setTimeout(() => {
      setChats(mockChats);
      setLoading(false);
    }, 800);
  };

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

  // Calcular total de mensajes no leídos
  const totalUnreadMessages = chats.reduce(
    (total, chat) => total + (chat.unreadCount || 0),
    0
  );

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <MessageSquare className="w-6 h-6 mr-2" />
          Mensajes
          {totalUnreadMessages > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
              {totalUnreadMessages}
            </span>
          )}
        </h1>
        <button
          onClick={refreshChats}
          className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <RefreshCw size={16} className="mr-1" />
          Actualizar
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col md:flex-row overflow-hidden">
        {/* Panel izquierdo: Lista de conversaciones */}
        <div className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Filtros y búsqueda */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="mb-2 relative">
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <select
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="closed">Cerrados</option>
                  <option value="archived">Archivados</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="unreadOnly"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={unreadFilter}
                  onChange={(e) => setUnreadFilter(e.target.checked)}
                />
                <label
                  htmlFor="unreadOnly"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Solo no leídos
                </label>
              </div>
            </div>
          </div>

          {/* Lista de conversaciones */}
          <div className="flex-1 overflow-y-auto">
            {loading && !selectedChat ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No hay conversaciones
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {searchTerm || statusFilter !== "all" || unreadFilter
                    ? "No se encontraron resultados con los filtros actuales"
                    : "Cuando los clientes inicien conversaciones, aparecerán aquí"}
                </p>
              </div>
            ) : (
              <ul>
                {filteredChats.map((chat) => (
                  <li
                    key={chat.id}
                    className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                      selectedChat?.id === chat.id
                        ? "bg-primary-50 dark:bg-primary-900/30"
                        : ""
                    }`}
                    onClick={() => handleSelectChat(chat)}
                  >
                    <div className="px-4 py-3 flex items-start">
                      {/* Avatar */}
                      <div className="flex-shrink-0 mr-3">
                        {chat.user?.avatar ? (
                          <img
                            src={chat.user.avatar}
                            alt={chat.user?.name}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {chat.user?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(chat.updatedAt || "")}
                          </p>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <Package className="h-3 w-3 mr-1" />
                          <span className="truncate">{chat.product?.name}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">
                          {chat.lastMessage?.content}
                        </p>
                      </div>

                      {/* Indicadores */}
                      {chat.unreadCount && chat.unreadCount > 0 && (
                        <div className="ml-2 flex-shrink-0">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary-600 text-white text-xs font-medium">
                            {chat.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Panel derecho: Conversación seleccionada */}
        <div className="w-full md:w-2/3 flex flex-col">
          {!selectedChat ? (
            // Estado vacío (ninguna conversación seleccionada)
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <Mail className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                Selecciona una conversación
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                Elige una conversación de la lista para ver los mensajes y responder a tus clientes
              </p>
            </div>
          ) : (
            <>
              {/* Encabezado de la conversación */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center">
                  {selectedChat.user?.avatar ? (
                    <img
                      src={selectedChat.user.avatar}
                      alt={selectedChat.user?.name}
                      className="h-10 w-10 rounded-full mr-3"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedChat.user?.name}
                    </h2>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Link
                        to={`/seller/products/edit/${selectedChat.productId}`}
                        className="text-primary-600 dark:text-primary-400 hover:underline flex items-center"
                      >
                        {selectedChat.product?.name}
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedChat.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : selectedChat.status === "closed"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <Circle className="w-2 h-2 mr-1" fill="currentColor" />
                    {selectedChat.status === "active"
                      ? "Activo"
                      : selectedChat.status === "closed"
                      ? "Cerrado"
                      : "Archivado"}
                  </span>
                  {selectedChat.status === "active" && (
                    <button
                      onClick={() => updateChatStatus(selectedChat.id || 0, "closed")}
                      className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      Cerrar
                    </button>
                  )}
                  {selectedChat.status !== "archived" && (
                    <button
                      onClick={() => updateChatStatus(selectedChat.id || 0, "archived")}
                      className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      Archivar
                    </button>
                  )}
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 p-4 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      No hay mensajes
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                      Envía un mensaje para iniciar la conversación
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div className="flex max-w-xs lg:max-w-md">
                          {!message.isMine && (
                            <div className="flex-shrink-0 mr-2">
                              {message.sender?.avatar ? (
                                <img
                                  src={message.sender.avatar}
                                  alt={message.sender?.name}
                                  className="h-8 w-8 rounded-full"
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
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 flex items-center ${
                                message.isMine
                                  ? "text-primary-100"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDate(message.createdAt || "")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Formulario de nuevo mensaje */}
              {selectedChat.status === "active" && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <form onSubmit={handleSendMessage} className="flex">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 border border-gray-300 dark:border-gray-600 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="bg-primary-600 text-white rounded-r-lg px-4 py-2 hover:bg-primary-700 transition-colors"
                    >
                      Enviar
                    </button>
                  </form>
                </div>
              )}
              {selectedChat.status !== "active" && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Esta conversación está {selectedChat.status === "closed" ? "cerrada" : "archivada"}
                    {selectedChat.status === "closed" && (
                      <button
                        onClick={() => updateChatStatus(selectedChat.id || 0, "active")}
                        className="ml-2 text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        Reabrir
                      </button>
                    )}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerMessagesPage;