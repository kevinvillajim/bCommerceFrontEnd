import React, {useState, useEffect} from "react";
import {Store, X} from "lucide-react";
import type {Seller} from "../../../core/domain/entities/Seller";
import type {
	CreateSellerData,
	UpdateSellerData,
} from "../../../core/services/SellerAdminService";

interface SellerFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: CreateSellerData | UpdateSellerData) => Promise<void>;
	seller?: Seller | null;
	title: string;
	isCreate?: boolean;
	users?: {id: number; name: string; email: string}[];
}

const SellerFormModal: React.FC<SellerFormModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	seller,
	title,
	isCreate = false,
	users = [],
}) => {
	const [formData, setFormData] = useState<CreateSellerData | UpdateSellerData>(
		{
			store_name: "",
			description: "",
			status: "pending",
			// commission_rate: 10, // TODO: Implementar comisiones individuales en el futuro
			is_featured: false,
			user_id: 0,
		}
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Cargar datos del vendedor si es edición
	useEffect(() => {
		if (seller && !isCreate) {
			setFormData({
				store_name: seller.storeName,
				description: seller.description || "",
				// commission_rate: seller.commissionRate, // TODO: Implementar comisiones individuales en el futuro
				is_featured: seller.isFeatured,
			});
		} else if (isCreate) {
			// Valores por defecto para creación
			setFormData({
				user_id: users.length > 0 ? users[0].id : 0,
				store_name: "",
				description: "",
				status: "pending",
				// commission_rate: 10, // TODO: Implementar comisiones individuales en el futuro
				is_featured: false,
			});
		}
	}, [seller, isCreate, users]);

	if (!isOpen) return null;

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const {name, value, type} = e.target;

		if (type === "checkbox") {
			const checkbox = e.target as HTMLInputElement;
			setFormData((prev) => ({
				...prev,
				[name]: checkbox.checked,
			}));
		// } else if (name === "commission_rate") {
		//	setFormData((prev) => ({
		//		...prev,
		//		[name]: parseFloat(value),
		//	}));
		} else if (name === "user_id") {
			setFormData((prev) => ({
				...prev,
				[name]: parseInt(value, 10),
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			await onSubmit(formData);
			onClose();
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("Error al procesar el formulario");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Overlay */}
			<div
				className="fixed inset-0 bg-black bg-opacity-50"
				onClick={onClose}
			></div>

			{/* Modal */}
			<div className="bg-white rounded-lg p-6 w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-4">
					<div className="flex items-center">
						<Store className="h-6 w-6 mr-2 text-primary-600" />
						<h3 className="text-xl font-semibold text-gray-900">{title}</h3>
					</div>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-500"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{error && (
					<div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit}>
					{/* Selección de usuario (solo para creación) */}
					{isCreate && (
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Usuario:
							</label>
							<select
								name="user_id"
								value={(formData as CreateSellerData).user_id || 0} // CORREGIDO: cast explícito y valor por defecto
								onChange={handleChange}
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
							>
								<option value="">Seleccionar usuario</option>
								{users.map((user) => (
									<option key={user.id} value={user.id}>
										{user.name} ({user.email})
									</option>
								))}
							</select>
						</div>
					)}

					{/* Nombre de la tienda */}
					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Nombre de la tienda:
						</label>
						<input
							type="text"
							name="store_name"
							value={formData.store_name}
							onChange={handleChange}
							required
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
						/>
					</div>

					{/* Descripción */}
					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Descripción:
						</label>
						<textarea
							name="description"
							value={formData.description}
							onChange={handleChange}
							rows={3}
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
						/>
					</div>

					{/* Estado (solo para creación) */}
					{isCreate && (
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Estado inicial:
							</label>
							<select
								name="status"
								value={(formData as CreateSellerData).status}
								onChange={handleChange}
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
							>
								<option value="pending">Pendiente</option>
								<option value="active">Activo</option>
							</select>
						</div>
					)}

					{/* Vendedor Destacado */}
					<div className="mb-4">
						<label className="flex items-center">
							<input
								type="checkbox"
								name="is_featured"
								checked={formData.is_featured || false}
								onChange={handleChange}
								className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
							/>
							<span className="ml-2 text-sm font-medium text-gray-700">
								Vendedor Destacado
							</span>
						</label>
						<p className="text-xs text-gray-500 mt-1">
							Los vendedores destacados tienen todos sus productos automáticamente destacados
						</p>
					</div>

					{/* TODO: Implementar comisiones individuales en el futuro */}
					{/* Comisión (Solo visual) */}
					{/* <div className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Tasa de comisión (%):
						</label>
						<input
							type="number"
							name="commission_rate"
							value={formData.commission_rate}
							min="0"
							max="100"
							step="0.1"
							disabled
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
						/>
						<p className="text-xs text-gray-500 mt-1">
							Campo informativo - La comisión se configurará en el futuro
						</p>
					</div> */}


					{/* Botones */}
					<div className="flex justify-end space-x-3 mt-6">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
						>
							Cancelar
						</button>

						<button
							type="submit"
							disabled={loading}
							className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
						>
							{loading ? (
								<>
									<svg
										className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Procesando...
								</>
							) : isCreate ? (
								"Crear vendedor"
							) : (
								"Guardar cambios"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default SellerFormModal;
