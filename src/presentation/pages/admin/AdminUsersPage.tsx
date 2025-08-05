// src/presentation/pages/admin/AdminUsersPage.tsx
import React, {useState, useEffect} from "react";
import Table from "../../components/dashboard/Table";
import {
	User,
	Lock,
	Unlock,
	Mail,
	Store,
	Shield,
	Filter,
	RefreshCw,
	AlertCircle,
	X,
	AtSign,
	Send,
} from "lucide-react";
import useAdminUsers from "../../hooks/useAdminUsers";
import type {AdminUserData} from "../../hooks/useAdminUsers";
import ConfigurationService from "../../../core/services/ConfigurationService";

/**
 * Página de gestión de usuarios para administradores
 */
const AdminUsersPage: React.FC = () => {
	const {
		loading,
		error,
		pagination,
		fetchUsers,
		toggleUserStatus,
		sendPasswordReset,
		makeUserAdmin,
		makeUserSeller,
		filterUsers,
	} = useAdminUsers();

	// Estados para filtros y búsqueda
	const [roleFilter, setRoleFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	// Estados para el modal de crear vendedor
	const [showSellerModal, setShowSellerModal] = useState<boolean>(false);
	const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
	const [storeName, setStoreName] = useState<string>("");
	const [storeDescription, setStoreDescription] = useState<string>("");
	const [validationErrors, setValidationErrors] = useState<{
		[key: string]: string;
	}>({});

	// Estados para el modal de email
	const [showEmailModal, setShowEmailModal] = useState<boolean>(false);
	const [selectedUserForEmail, setSelectedUserForEmail] = useState<AdminUserData | null>(null);
	const [emailSubject, setEmailSubject] = useState<string>("");
	const [emailMessage, setEmailMessage] = useState<string>("");
	const [emailType, setEmailType] = useState<string>("notification");
	const [emailSending, setEmailSending] = useState<boolean>(false);
	const [emailValidationErrors, setEmailValidationErrors] = useState<{
		[key: string]: string;
	}>({});

	// Obtener datos de usuarios al iniciar
	useEffect(() => {
		fetchUsers(pagination.currentPage, pagination.itemsPerPage);
	}, [fetchUsers, pagination.currentPage, pagination.itemsPerPage]);

	// Filtrar usuarios basado en rol y estado
	const filteredUsers = filterUsers({
		role: roleFilter,
		status: statusFilter,
		searchTerm: searchTerm,
	});

	// Manejar cambio de estado de usuario (bloquear/desbloquear)
	const handleToggleUserStatus = async (
		userId: number,
		currentStatus: string
	) => {
		const isCurrentlyBlocked = currentStatus === "blocked";
		const success = await toggleUserStatus(userId, isCurrentlyBlocked);

		if (success) {
			setSuccessMessage(
				`Usuario ${isCurrentlyBlocked ? "desbloqueado" : "bloqueado"} correctamente.`
			);

			// Limpiar mensaje después de 3 segundos
			setTimeout(() => setSuccessMessage(null), 3000);
		}
	};

	// Manejar envío de restablecimiento de contraseña
	const handleSendPasswordReset = async (userId: number) => {
		const success = await sendPasswordReset(userId);

		if (success) {
			setSuccessMessage(
				"Correo de restablecimiento de contraseña enviado correctamente."
			);

			// Limpiar mensaje después de 3 segundos
			setTimeout(() => setSuccessMessage(null), 3000);
		}
	};

	// Manejar promoción a administrador
	const handleMakeAdmin = async (userId: number) => {
		const success = await makeUserAdmin(userId);

		if (success) {
			setSuccessMessage("Usuario promocionado a administrador correctamente.");

			// Limpiar mensaje después de 3 segundos
			setTimeout(() => setSuccessMessage(null), 3000);
		}
	};

	// Abrir modal para convertir en vendedor
	const handleShowMakeSellerModal = (userId: number) => {
		setSelectedUserId(userId);
		setStoreName("");
		setStoreDescription("");
		setValidationErrors({});
		setShowSellerModal(true);
	};

	// Cerrar modal
	const handleCloseSellerModal = () => {
		setShowSellerModal(false);
		setSelectedUserId(null);
		setStoreName("");
		setStoreDescription("");
		setValidationErrors({});
	};

	// Validar formulario de vendedor
	const validateSellerForm = (): boolean => {
		const errors: {[key: string]: string} = {};

		if (!storeName || storeName.trim().length < 3) {
			errors.storeName =
				"El nombre de la tienda debe tener al menos 3 caracteres";
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	// Convertir en vendedor
	const handleMakeSeller = async () => {
		if (!selectedUserId) return;

		if (validateSellerForm()) {
			const storeData = {
				store_name: storeName,
				description: storeDescription,
			};

			const success = await makeUserSeller(selectedUserId, storeData);

			if (success) {
				setSuccessMessage("Usuario convertido en vendedor correctamente.");
				handleCloseSellerModal();

				// Limpiar mensaje después de 3 segundos
				setTimeout(() => setSuccessMessage(null), 3000);
			}
		}
	};

	// Manejar cambio de página
	const handlePageChange = (page: number) => {
		fetchUsers(page, pagination.itemsPerPage);
	};

	// Refrescar datos
	const refreshData = () => {
		fetchUsers(pagination.currentPage, pagination.itemsPerPage);
	};

	// Funciones para el modal de email
	const handleShowEmailModal = (user: AdminUserData) => {
		setSelectedUserForEmail(user);
		setEmailSubject("");
		setEmailMessage("");
		setEmailType("notification");
		setEmailValidationErrors({});
		setShowEmailModal(true);
	};

	const handleCloseEmailModal = () => {
		setShowEmailModal(false);
		setSelectedUserForEmail(null);
		setEmailSubject("");
		setEmailMessage("");
		setEmailType("notification");
		setEmailValidationErrors({});
	};

	// Validar formulario de email
	const validateEmailForm = (): boolean => {
		const errors: {[key: string]: string} = {};

		if (!emailSubject || emailSubject.trim().length < 3) {
			errors.subject = "El asunto debe tener al menos 3 caracteres";
		}

		if (!emailMessage || emailMessage.trim().length < 10) {
			errors.message = "El mensaje debe tener al menos 10 caracteres";
		}

		if (emailMessage.length > 5000) {
			errors.message = "El mensaje no puede exceder 5000 caracteres";
		}

		setEmailValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	// Enviar email personalizado
	const handleSendCustomEmail = async () => {
		if (!selectedUserForEmail) return;

		if (validateEmailForm()) {
			setEmailSending(true);

			try {
				const configService = new ConfigurationService();
				const result = await configService.sendCustomEmail({
					user_id: selectedUserForEmail.id,
					subject: emailSubject.trim(),
					message: emailMessage.trim(),
					email_type: emailType,
				});

				if (result.status === 'success') {
					setSuccessMessage("Email enviado correctamente.");
					handleCloseEmailModal();
					
					// Limpiar mensaje después de 5 segundos
					setTimeout(() => setSuccessMessage(null), 5000);
				} else {
					setEmailValidationErrors({
						general: result.message || "Error al enviar el email"
					});
				}
			} catch (error) {
				console.error('Error sending custom email:', error);
				setEmailValidationErrors({
					general: "Error de conexión al enviar el email"
				});
			} finally {
				setEmailSending(false);
			}
		}
	};

	// Definir columnas de la tabla
	const columns = [
		{
			key: "user",
			header: "Usuario",
			sortable: true,
			render: (user: AdminUserData) => (
				<div className="flex items-center">
					<div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
						<User className="h-6 w-6 text-gray-500" />
					</div>
					<div className="ml-4">
						<div className="text-sm font-medium text-gray-900">
							{user.name}
						</div>
						<div className="text-sm text-gray-500">
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
			render: (user: AdminUserData) => (
				<span
					className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
						user.role === "admin"
							? "bg-red-100 text-red-800"
							: user.role === "seller"
								? "bg-blue-100 text-blue-800"
								: "bg-green-100 text-green-800"
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
			render: (user: AdminUserData) => (
				<span
					className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
						user.status === "active"
							? "bg-green-100 text-green-800"
							: "bg-red-100 text-red-800"
					}`}
				>
					{user.status === "active" ? "Activo" : "Bloqueado"}
				</span>
			),
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
			render: (user: AdminUserData) => (
				<div className="flex justify-end space-x-2">
					<button
						onClick={() => handleToggleUserStatus(user.id, user.status)}
						className={`p-1 rounded-md ${
							user.status === "active"
								? "text-red-600 hover:bg-red-100"
								: "text-green-600 hover:bg-green-100"
						}`}
						title={
							user.status === "active"
								? "Bloquear Usuario"
								: "Desbloquear Usuario"
						}
					>
						{user.status === "active" ? (
							<Lock size={18} />
						) : (
							<Unlock size={18} />
						)}
					</button>
					<button
						onClick={() => handleSendPasswordReset(user.id)}
						className="p-1 text-blue-600 hover:bg-blue-100 rounded-md"
						title="Enviar Restablecimiento de Contraseña"
					>
						<Mail size={18} />
					</button>
					<button
						onClick={() => handleShowEmailModal(user)}
						className="p-1 text-orange-600 hover:bg-orange-100 rounded-md"
						title="Enviar Email Personalizado"
					>
						<AtSign size={18} />
					</button>
					{user.role !== "seller" && (
						<button
							onClick={() => handleShowMakeSellerModal(user.id)}
							className="p-1 text-green-600 hover:bg-green-100 rounded-md"
							title="Convertir en Vendedor"
						>
							<Store size={18} />
						</button>
					)}
					{user.role !== "admin" && (
						<button
							onClick={() => handleMakeAdmin(user.id)}
							className="p-1 text-purple-600 hover:bg-purple-100 rounded-md"
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
				<h1 className="text-2xl font-bold text-gray-900">
					Gestión de Usuarios
				</h1>
				<div className="flex space-x-2">
					<button
						onClick={refreshData}
						className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
						disabled={loading}
					>
						<RefreshCw
							size={18}
							className={`inline mr-2 ${loading ? "animate-spin" : ""}`}
						/>
						Actualizar
					</button>
				</div>
			</div>

			{/* Mensajes de error y éxito */}
			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
					<div className="flex items-center">
						<AlertCircle className="h-5 w-5 mr-2" />
						<span>{error}</span>
					</div>
				</div>
			)}

			{successMessage && (
				<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
					<span>{successMessage}</span>
				</div>
			)}

			{/* Filtros */}
			<div className="bg-white0 rounded-lg shadow-sm p-4">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Filtro de Rol */}
					<div className="flex items-center space-x-2">
						<Filter className="h-5 w-5 text-gray-500" />
						<select
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="all">Todos los Estados</option>
							<option value="active">Activo</option>
							<option value="blocked">Bloqueado</option>
						</select>
					</div>

					{/* Búsqueda */}
					<div className="flex-grow">
						<input
							type="text"
							placeholder="Buscar por nombre o email..."
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
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

			{/* Modal para Crear Vendedor */}
			{showSellerModal && (
				<div className="fixed inset-0 flex items-center justify-center z-50">
					<div
						className="fixed inset-0 bg-black bg-opacity-50"
						onClick={handleCloseSellerModal}
					></div>
					<div className="bg-white0 rounded-lg p-6 w-full max-w-md relative z-10">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-bold text-gray-900">
								Convertir en Vendedor
							</h2>
							<button
								onClick={handleCloseSellerModal}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={20} />
							</button>
						</div>

						<div className="space-y-4">
							<div>
								<label
									htmlFor="store_name"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Nombre de la Tienda *
								</label>
								<input
									type="text"
									id="store_name"
									className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
										validationErrors.storeName
											? "border-red-500"
											: "border-gray-300"
									}`}
									value={storeName}
									onChange={(e) => setStoreName(e.target.value)}
								/>
								{validationErrors.storeName && (
									<p className="mt-1 text-sm text-red-500">
										{validationErrors.storeName}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="description"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Descripción
								</label>
								<textarea
									id="description"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
									value={storeDescription}
									onChange={(e) => setStoreDescription(e.target.value)}
									rows={4}
								></textarea>
							</div>

							<div className="flex justify-end space-x-3 mt-6">
								<button
									onClick={handleCloseSellerModal}
									className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
								>
									Cancelar
								</button>
								<button
									onClick={handleMakeSeller}
									className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
									disabled={loading}
								>
									{loading ? "Procesando..." : "Guardar"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Modal para Enviar Email Personalizado */}
			{showEmailModal && selectedUserForEmail && (
				<div className="fixed inset-0 flex items-center justify-center z-50">
					<div
						className="fixed inset-0 bg-black bg-opacity-50"
						onClick={handleCloseEmailModal}
					></div>
					<div className="bg-white rounded-lg p-6 w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-bold text-gray-900 flex items-center">
								<AtSign className="mr-2 text-orange-600" size={24} />
								Enviar Email a {selectedUserForEmail.name}
							</h2>
							<button
								onClick={handleCloseEmailModal}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={20} />
							</button>
						</div>

						{/* Información del destinatario */}
						<div className="mb-4 p-3 bg-gray-50 rounded-lg">
							<div className="flex items-center text-sm text-gray-600">
								<User className="mr-2" size={16} />
								<span className="font-medium">{selectedUserForEmail.name}</span>
								<span className="mx-2">•</span>
								<span>{selectedUserForEmail.email}</span>
								<span className="mx-2">•</span>
								<span className="capitalize">{selectedUserForEmail.role}</span>
							</div>
						</div>

						{/* Errores generales */}
						{emailValidationErrors.general && (
							<div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
								<div className="flex items-center">
									<AlertCircle className="h-5 w-5 mr-2" />
									<span>{emailValidationErrors.general}</span>
								</div>
							</div>
						)}

						<div className="space-y-4">
							{/* Tipo de Email */}
							<div>
								<label
									htmlFor="email_type"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Tipo de Email
								</label>
								<select
									id="email_type"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
									value={emailType}
									onChange={(e) => setEmailType(e.target.value)}
								>
									<option value="notification">Notificación</option>
									<option value="announcement">Anuncio</option>
									<option value="warning">Advertencia</option>
								</select>
							</div>

							{/* Asunto */}
							<div>
								<label
									htmlFor="email_subject"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Asunto *
								</label>
								<input
									type="text"
									id="email_subject"
									className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
										emailValidationErrors.subject
											? "border-red-500"
											: "border-gray-300"
									}`}
									value={emailSubject}
									onChange={(e) => setEmailSubject(e.target.value)}
									placeholder="Ingresa el asunto del email..."
									maxLength={255}
								/>
								{emailValidationErrors.subject && (
									<p className="mt-1 text-sm text-red-500">
										{emailValidationErrors.subject}
									</p>
								)}
								<p className="mt-1 text-xs text-gray-500">
									{emailSubject.length}/255 caracteres
								</p>
							</div>

							{/* Mensaje */}
							<div>
								<label
									htmlFor="email_message"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Mensaje *
								</label>
								<textarea
									id="email_message"
									className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
										emailValidationErrors.message
											? "border-red-500"
											: "border-gray-300"
									}`}
									value={emailMessage}
									onChange={(e) => setEmailMessage(e.target.value)}
									placeholder="Escribe tu mensaje aquí..."
									rows={8}
									maxLength={5000}
								></textarea>
								{emailValidationErrors.message && (
									<p className="mt-1 text-sm text-red-500">
										{emailValidationErrors.message}
									</p>
								)}
								<p className="mt-1 text-xs text-gray-500">
									{emailMessage.length}/5000 caracteres
								</p>
							</div>

							{/* Botones */}
							<div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
								<button
									onClick={handleCloseEmailModal}
									className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
									disabled={emailSending}
								>
									Cancelar
								</button>
								<button
									onClick={handleSendCustomEmail}
									className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center"
									disabled={emailSending}
								>
									{emailSending ? (
										<>
											<RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
											Enviando...
										</>
									) : (
										<>
											<Send className="-ml-1 mr-2 h-4 w-4" />
											Enviar Email
										</>
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminUsersPage;