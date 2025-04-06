import React, { useState, useEffect } from "react";
import Table from "../../components/dashboard/Table"; // Importar el componente Table que creamos
import { User, Lock, Unlock, Mail, Edit, Shield, Filter, RefreshCw } from "lucide-react";

// Tipo de usuario
interface UserData {
  id: number;
  name: string;
  email: string;
  role: "customer" | "seller" | "admin";
  status: "active" | "blocked";
  lastLogin: string;
  registeredDate: string;
  ordersCount: number;
}

// Tipo para los datos de vendedor
interface Seller {
	id: number;
	storeName: string;
	status: "pending" | "active" | "suspended" | "inactive";
	verificationLevel: string;
	averageRating: number;
	totalSales: number;
	createdAt: string;
}

const AdminSellersPage: React.FC = () => {
	const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 5,
    totalItems: 48,
    itemsPerPage: 10,
  });

  // Obtener datos de usuarios (simulado)
  useEffect(() => {
    const fetchUsers = () => {
      setLoading(true);

      // Datos de ejemplo
      const mockUsers: UserData[] = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          role: "customer",
          status: "active",
          lastLogin: "2023-11-05",
          registeredDate: "2023-01-15",
          ordersCount: 12,
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          role: "customer",
          status: "active",
          lastLogin: "2023-11-02",
          registeredDate: "2023-02-20",
          ordersCount: 8,
        },
        {
          id: 3,
          name: "Michael Brown",
          email: "michael@example.com",
          role: "seller",
          status: "active",
          lastLogin: "2023-11-04",
          registeredDate: "2023-03-10",
          ordersCount: 0,
        },
        {
          id: 4,
          name: "Sarah Johnson",
          email: "sarah@example.com",
          role: "customer",
          status: "blocked",
          lastLogin: "2023-10-28",
          registeredDate: "2023-04-05",
          ordersCount: 3,
        },
        {
          id: 5,
          name: "David Wilson",
          email: "david@example.com",
          role: "seller",
          status: "active",
          lastLogin: "2023-11-01",
          registeredDate: "2023-05-12",
          ordersCount: 0,
        },
        {
          id: 6,
          name: "Jennifer Lee",
          email: "jennifer@example.com",
          role: "customer",
          status: "active",
          lastLogin: "2023-11-03",
          registeredDate: "2023-06-22",
          ordersCount: 5,
        },
        {
          id: 7,
          name: "Robert Garcia",
          email: "robert@example.com",
          role: "admin",
          status: "active",
          lastLogin: "2023-11-05",
          registeredDate: "2023-07-18",
          ordersCount: 0,
        },
        {
          id: 8,
          name: "Emily Taylor",
          email: "emily@example.com",
          role: "customer",
          status: "active",
          lastLogin: "2023-10-30",
          registeredDate: "2023-08-14",
          ordersCount: 2,
        },
        {
          id: 9,
          name: "Kevin Martinez",
          email: "kevin@example.com",
          role: "customer",
          status: "blocked",
          lastLogin: "2023-10-15",
          registeredDate: "2023-09-28",
          ordersCount: 1,
        },
        {
          id: 10,
          name: "Amanda White",
          email: "amanda@example.com",
          role: "seller",
          status: "active",
          lastLogin: "2023-11-04",
          registeredDate: "2023-10-05",
          ordersCount: 0,
        },
      ];

      setTimeout(() => {
        setUsers(mockUsers);
        setPagination({
          currentPage: 1,
          totalPages: 5,
          totalItems: 48,
          itemsPerPage: 10,
        });
        setLoading(false);
      }, 500); // Simular retardo de red
    };

    fetchUsers();
  }, []);

  // Filtrar usuarios basado en rol y estado
  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesRole && matchesStatus;
  });

  // Manejar cambio de estado de usuario (bloquear/desbloquear)
  const toggleUserStatus = (userId: number) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === "active" ? "blocked" : "active" }
          : user
      )
    );
  };

  // Manejar envío de restablecimiento de contraseña
  const sendPasswordReset = (userId: number) => {
    // En una app real, harías una llamada a la API aquí
    alert(`Correo de restablecimiento de contraseña enviado al usuario #${userId}`);
  };

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    // En una app real, aquí obtendrías los datos para la nueva página
  };

  // Refrescar datos
  const refreshData = () => {
    setLoading(true);
    // Simular recarga de datos
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // Definir columnas de la tabla
  const columns = [
    {
      key: "user",
      header: "Usuario",
      sortable: true,
      render: (user: UserData) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {user.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Rol",
      sortable: true,
      render: (user: UserData) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.role === "admin"
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              : user.role === "seller"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          }`}
        >
          {user.role === "admin" && "Administrador"}
          {user.role === "seller" && "Vendedor"}
          {user.role === "customer" && "Cliente"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (user: UserData) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.status === "active"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {user.status === "active" ? "Activo" : "Bloqueado"}
        </span>
      ),
    },
    {
      key: "lastLogin",
      header: "Último Acceso",
      sortable: true,
    },
    {
      key: "registeredDate",
      header: "Registrado",
      sortable: true,
    },
    {
      key: "ordersCount",
      header: "Pedidos",
      sortable: true,
    },
    {
      key: "actions",
      header: "Acciones",
      render: (user: UserData) => (
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => toggleUserStatus(user.id)}
            className={`p-1 rounded-md ${
              user.status === "active"
                ? "text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
                : "text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900"
            }`}
            title={
              user.status === "active" ? "Bloquear Usuario" : "Desbloquear Usuario"
            }
          >
            {user.status === "active" ? <Lock size={18} /> : <Unlock size={18} />}
          </button>
          <button
            onClick={() => sendPasswordReset(user.id)}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded-md dark:text-blue-400 dark:hover:bg-blue-900"
            title="Enviar Restablecimiento de Contraseña"
          >
            <Mail size={18} />
          </button>
          <button
            className="p-1 text-yellow-600 hover:bg-yellow-100 rounded-md dark:text-yellow-400 dark:hover:bg-yellow-900"
            title="Editar Usuario"
          >
            <Edit size={18} />
          </button>
          {user.role !== "admin" && (
            <button
              className="p-1 text-purple-600 hover:bg-purple-100 rounded-md dark:text-purple-400 dark:hover:bg-purple-900"
              title="Hacer Administrador"
            >
              <Shield size={18} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Usuarios
        </h1>
        <div className="flex space-x-2">
          <button 
            onClick={refreshData}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <RefreshCw size={18} className="inline mr-2" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Filtro de Rol */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Todos los Roles</option>
              <option value="customer">Cliente</option>
              <option value="seller">Vendedor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {/* Filtro de Estado */}
          <div className="flex items-center space-x-2">
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los Estados</option>
              <option value="active">Activo</option>
              <option value="blocked">Bloqueado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <Table
        data={filteredUsers}
        columns={columns}
        searchFields={["name", "email"]}
        loading={loading}
        emptyMessage="No se encontraron usuarios"
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
          itemsPerPage: pagination.itemsPerPage,
          onPageChange: handlePageChange,
        }}
      />
    </div>
  );
};
export default AdminSellersPage;
