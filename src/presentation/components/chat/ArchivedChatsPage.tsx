import React, { useState, useEffect } from 'react';
import { Archive, MessageSquare, RefreshCw, ArrowLeft, RotateCcw, User, Store, Package } from 'lucide-react';

interface Chat {
  id: number;
  userId: number;
  sellerId: number;
  productId: number;
  status: 'active' | 'closed' | 'archived';
  unreadCount?: number;
  user?: { name: string; avatar?: string };
  seller?: { storeName: string; avatar?: string };
  product?: { name: string };
  updatedAt?: string;
}

interface ArchivedChatsPageProps {
  isSeller?: boolean;
  chats: Chat[];
  loading: boolean;
  error: string | null;
  onSelectChat: (chat: Chat) => void;
  onRestoreChat: (chatId: number) => Promise<boolean>;
  onRefresh: () => void;
  onBackToMain: () => void;
}

const ArchivedChatsPage: React.FC<ArchivedChatsPageProps> = ({
  isSeller = false,
  chats,
  loading,
  error,
  onSelectChat,
  onRestoreChat,
  onRefresh,
  onBackToMain
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [unreadFilter, setUnreadFilter] = useState<boolean>(false);
  const [restoring, setRestoring] = useState<number | null>(null);

  // Filtrar solo chats archivados y cerrados
  const archivedChats = chats.filter((chat) => {
    const isArchivedOrClosed = chat.status === 'archived' || chat.status === 'closed';
    
    // Filtro por estado específico
    const matchesStatus = statusFilter === 'all' || chat.status === statusFilter;

    // Filtro por mensajes no leídos
    const matchesUnread = unreadFilter
      ? chat.unreadCount && chat.unreadCount > 0
      : true;

    // Búsqueda por nombre
    const searchTarget1 = isSeller ? chat.user?.name : chat.seller?.storeName;
    const searchTarget2 = chat.product?.name;

    const matchesSearch =
      searchTerm === "" ||
      (searchTarget1 &&
        searchTarget1.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (searchTarget2 &&
        searchTarget2.toLowerCase().includes(searchTerm.toLowerCase()));

    return isArchivedOrClosed && matchesStatus && matchesUnread && matchesSearch;
  });

  // Manejar restauración de chat
  const handleRestoreChat = async (chatId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setRestoring(chatId);
    
    try {
      const success = await onRestoreChat(chatId);
      if (success) {
        console.log(`Chat ${chatId} restaurado exitosamente`);
      }
    } catch (error) {
      console.error('Error al restaurar chat:', error);
    } finally {
      setRestoring(null);
    }
  };

  // Formatear fecha relativa
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 60) {
        return `${diffInMinutes} min`;
      } else if (diffInMinutes < 1440) {
        return `${Math.floor(diffInMinutes / 60)} h`;
      } else {
        return `${Math.floor(diffInMinutes / 1440)} d`;
      }
    } catch {
      return '';
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={onBackToMain}
            className="mr-3 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Archive className="w-6 h-6 mr-2" />
            {isSeller ? 'Conversaciones Archivadas' : 'Mis Conversaciones Archivadas'}
          </h1>
        </div>
        
        <button
          onClick={onRefresh}
          className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={`mr-1 ${loading ? "animate-spin" : ""}`}
          />
          Actualizar
        </button>
      </div>

      {/* Estadísticas */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {archivedChats.filter(c => c.status === 'archived').length}
            </div>
            <div className="text-sm text-gray-600">Archivadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {archivedChats.filter(c => c.status === 'closed').length}
            </div>
            <div className="text-sm text-gray-600">Cerradas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {archivedChats.length}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={onRefresh}
            className="underline ml-2 text-red-700 hover:text-red-900"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-4 bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Búsqueda */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar conversaciones archivadas..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MessageSquare className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          {/* Filtro de estado */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Estado:</label>
            <select
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="archived">Solo archivadas</option>
              <option value="closed">Solo cerradas</option>
            </select>
          </div>
          
          {/* Filtro no leídas */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="unreadOnly"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={unreadFilter}
              onChange={(e) => setUnreadFilter(e.target.checked)}
            />
            <label htmlFor="unreadOnly" className="ml-2 text-sm text-gray-700">
              Solo no leídas
            </label>
          </div>
        </div>
      </div>

      {/* Lista de chats archivados */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : archivedChats.length === 0 ? (
          <div className="text-center py-20">
            <Archive className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay conversaciones {statusFilter === 'archived' ? 'archivadas' : statusFilter === 'closed' ? 'cerradas' : 'archivadas o cerradas'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || unreadFilter
                ? "No se encontraron resultados con los filtros actuales"
                : "Cuando archives o cierres conversaciones, aparecerán aquí."
              }
            </p>
            {(searchTerm || statusFilter !== 'all' || unreadFilter) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setUnreadFilter(false);
                }}
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {archivedChats.map((chat) => {
              const participant = isSeller 
                ? { 
                    name: chat.user?.name || `Cliente #${chat.userId}`,
                    avatar: chat.user?.avatar,
                    icon: <User className="h-5 w-5 text-gray-500" />
                  }
                : {
                    name: chat.seller?.storeName || `Vendedor #${chat.sellerId}`,
                    avatar: chat.seller?.avatar,
                    icon: <Store className="h-5 w-5 text-gray-500" />
                  };

              return (
                <div
                  key={chat.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer relative group transition-colors"
                  onClick={() => onSelectChat(chat)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {participant.avatar ? (
                          <img
                            src={participant.avatar}
                            alt={participant.name}
                            className="h-10 w-10 rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = "https://via.placeholder.com/40?text=U";
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {participant.icon}
                          </div>
                        )}
                      </div>

                      {/* Información del chat */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {participant.name}
                          </p>
                          <p className="text-xs text-gray-500 ml-2">
                            {formatDate(chat.updatedAt)}
                          </p>
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Package className="h-3 w-3 mr-1" />
                          <span className="truncate">
                            {chat.product?.name || `Producto #${chat.productId}`}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              chat.status === "archived"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {chat.status === "archived" ? "Archivada" : "Cerrada"}
                          </span>
                          
                          {chat.unreadCount && chat.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-medium">
                              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botón de restaurar */}
                    <button
                      onClick={(e) => handleRestoreChat(chat.id, e)}
                      disabled={restoring === chat.id}
                      className="ml-2 p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      title="Restaurar conversación"
                    >
                      {restoring === chat.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent" />
                      ) : (
                        <RotateCcw size={16} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer con estadísticas */}
      {archivedChats.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Mostrando {archivedChats.length} de {chats.filter(c => c.status === 'archived' || c.status === 'closed').length} conversaciones archivadas
        </div>
      )}
    </div>
  );
};

export default ArchivedChatsPage;