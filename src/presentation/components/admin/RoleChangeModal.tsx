import React, { useState } from "react";
import { X, AlertCircle, User, Store, Shield, CreditCard, Users } from "lucide-react";

export interface RoleChangeModalProps {
	isOpen: boolean;
	user: {
		id: number;
		name: string;
		email: string;
		role: string;
	};
	onClose: () => void;
	onConfirm: (
		role: 'customer' | 'seller' | 'admin' | 'payment',
		storeData?: { store_name: string; description?: string }
	) => Promise<void>;
	isLoading?: boolean;
}

/**
 * Modal unificado para cambio de roles de usuario
 */
const RoleChangeModal: React.FC<RoleChangeModalProps> = ({
	isOpen,
	user,
	onClose,
	onConfirm,
	isLoading = false,
}) => {
	const [selectedRole, setSelectedRole] = useState<'customer' | 'seller' | 'admin' | 'payment'>('customer');
	const [storeName, setStoreName] = useState('');
	const [storeDescription, setStoreDescription] = useState('');
	const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

	if (!isOpen) return null;

	const roles = [
		{
			value: 'customer' as const,
			label: 'Cliente',
			icon: <User className="w-5 h-5" />,
			description: 'Usuario normal del sistema',
			color: 'text-gray-600',
		},
		{
			value: 'seller' as const,
			label: 'Vendedor',
			icon: <Store className="w-5 h-5" />,
			description: 'Puede vender productos en la plataforma',
			color: 'text-blue-600',
		},
		{
			value: 'admin' as const,
			label: 'Administrador',
			icon: <Shield className="w-5 h-5" />,
			description: 'Acceso completo al panel de administración',
			color: 'text-purple-600',
		},
		{
			value: 'payment' as const,
			label: 'Usuario de Pagos',
			icon: <CreditCard className="w-5 h-5" />,
			description: 'Gestión de pagos externos independiente',
			color: 'text-green-600',
		},
	];

	const getCurrentRoleLabel = (role: string): string => {
		switch (role) {
			case 'admin': return 'Administrador';
			case 'seller': return 'Vendedor';
			case 'customer': return 'Cliente';
			case 'payment': return 'Usuario de Pagos';
			default: return 'Cliente';
		}
	};

	const validateForm = (): boolean => {
		const errors: { [key: string]: string } = {};

		if (selectedRole === 'seller' && (!storeName || storeName.trim().length < 3)) {
			errors.storeName = 'El nombre de la tienda debe tener al menos 3 caracteres';
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleConfirm = async () => {
		if (!validateForm()) return;

		const storeData = selectedRole === 'seller' ? {
			store_name: storeName.trim(),
			description: storeDescription.trim(),
		} : undefined;

		await onConfirm(selectedRole, storeData);
	};

	const getWarningMessage = (): string | null => {
		if (selectedRole === 'customer') {
			return 'Al cambiar a cliente, el usuario perderá acceso a su panel actual, pero los datos se preservarán como inactivos (puede ser reactivado más tarde).';
		}
		return null;
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center z-50">
			<div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
			<div className="bg-white rounded-lg p-6 w-full max-w-lg relative z-10 max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-bold text-gray-900 flex items-center">
						<Users className="mr-2 text-blue-600" size={24} />
						Cambiar Rol de Usuario
					</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700"
						disabled={isLoading}
					>
						<X size={20} />
					</button>
				</div>

				{/* Información del usuario */}
				<div className="mb-4 p-3 bg-gray-50 rounded-lg">
					<div className="flex items-center text-sm text-gray-600">
						<User className="mr-2" size={16} />
						<span className="font-medium">{user.name}</span>
						<span className="mx-2">•</span>
						<span>{user.email}</span>
						<span className="mx-2">•</span>
						<span className="capitalize">Actual: {getCurrentRoleLabel(user.role)}</span>
					</div>
				</div>

				{/* Selector de roles */}
				<div className="space-y-3 mb-4">
					<label className="block text-sm font-medium text-gray-700">
						Nuevo Rol
					</label>
					{roles.map((role) => (
						<label
							key={role.value}
							className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
								selectedRole === role.value
									? 'border-primary-500 bg-primary-50'
									: 'border-gray-300 hover:bg-gray-50'
							}`}
						>
							<input
								type="radio"
								name="role"
								value={role.value}
								checked={selectedRole === role.value}
								onChange={(e) => setSelectedRole(e.target.value as any)}
								className="sr-only"
							/>
							<div className={`mr-3 ${role.color}`}>
								{role.icon}
							</div>
							<div className="flex-grow">
								<div className="font-medium text-gray-900">{role.label}</div>
								<div className="text-sm text-gray-500">{role.description}</div>
							</div>
						</label>
					))}
				</div>

				{/* Campos adicionales para vendedor */}
				{selectedRole === 'seller' && (
					<div className="space-y-4 mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
						<h3 className="font-medium text-blue-900">Datos de la Tienda</h3>

						<div>
							<label htmlFor="store_name" className="block text-sm font-medium text-gray-700 mb-1">
								Nombre de la Tienda *
							</label>
							<input
								type="text"
								id="store_name"
								className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
									validationErrors.storeName ? 'border-red-500' : 'border-gray-300'
								}`}
								value={storeName}
								onChange={(e) => setStoreName(e.target.value)}
								disabled={isLoading}
							/>
							{validationErrors.storeName && (
								<p className="mt-1 text-sm text-red-500">{validationErrors.storeName}</p>
							)}
						</div>

						<div>
							<label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
								Descripción
							</label>
							<textarea
								id="description"
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
								value={storeDescription}
								onChange={(e) => setStoreDescription(e.target.value)}
								rows={3}
								disabled={isLoading}
							></textarea>
						</div>
					</div>
				)}

				{/* Mensaje de advertencia */}
				{getWarningMessage() && (
					<div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
						<div className="flex">
							<AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
							<p className="text-sm text-yellow-800">{getWarningMessage()}</p>
						</div>
					</div>
				)}

				{/* Botones */}
				<div className="flex justify-end space-x-3 pt-4 border-t">
					<button
						onClick={onClose}
						className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
						disabled={isLoading}
					>
						Cancelar
					</button>
					<button
						onClick={handleConfirm}
						className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
						disabled={isLoading}
					>
						{isLoading ? 'Cambiando...' : 'Cambiar Rol'}
					</button>
				</div>
			</div>
		</div>
	);
};

export default RoleChangeModal;