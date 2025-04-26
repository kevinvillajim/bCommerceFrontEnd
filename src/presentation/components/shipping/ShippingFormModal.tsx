import React, {useState} from "react";
import {X, Package} from "lucide-react";

// Definir la interfaz para los datos del formulario
export interface ShippingFormData {
	tracking_number: string;
	shipping_company: string;
	estimated_delivery: string;
	notes?: string;
}

interface ShippingFormModalProps {
	isOpen: boolean;
	orderId: string;
	onClose: () => void;
	onSubmit: (data: ShippingFormData) => void;
	isLoading?: boolean;
}

const ShippingFormModal: React.FC<ShippingFormModalProps> = ({
	isOpen,
	orderId,
	onClose,
	onSubmit,
	isLoading = false,
}) => {
	// Estados para los campos del formulario
	const [trackingNumber, setTrackingNumber] = useState("");
	const [shippingCompany, setShippingCompany] = useState("");
	const [estimatedDelivery, setEstimatedDelivery] = useState("");
	const [notes, setNotes] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Si el modal no está abierto, no renderizar nada
	if (!isOpen) return null;

	// Función para validar el formulario
	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!trackingNumber.trim()) {
			newErrors.trackingNumber = "El número de seguimiento es obligatorio";
		}

		if (!shippingCompany.trim()) {
			newErrors.shippingCompany = "El transportista es obligatorio";
		}

		// Fecha opcional, pero si se proporciona debe ser válida
		if (estimatedDelivery && new Date(estimatedDelivery) < new Date()) {
			newErrors.estimatedDelivery = "La fecha estimada debe ser futura";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Función para manejar el envío del formulario
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		// Preparar datos para el envío
		const shippingData: ShippingFormData = {
			tracking_number: trackingNumber,
			shipping_company: shippingCompany,
			estimated_delivery: estimatedDelivery,
			notes: notes.trim() || undefined,
		};

		// Llamar a la función onSubmit con los datos
		onSubmit(shippingData);
	};

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			{/* Fondo oscuro */}
			<div
				className="fixed inset-0 bg-black bg-opacity-50"
				onClick={onClose}
			></div>

			{/* Modal */}
			<div className="flex items-center justify-center min-h-screen p-4">
				<div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
					{/* Cabecera */}
					<div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
						<h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
							<Package className="h-5 w-5 mr-2" />
							Información de Envío
						</h2>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
							disabled={isLoading}
						>
							<X size={24} />
						</button>
					</div>

					{/* Cuerpo del modal */}
					<form onSubmit={handleSubmit}>
						<div className="p-6 space-y-4">
							{/* Orden ID (no editable) */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									ID de Orden
								</label>
								<input
									type="text"
									value={orderId}
									disabled
									className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300"
								/>
							</div>

							{/* Número de Tracking */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Número de Seguimiento <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={trackingNumber}
									onChange={(e) => setTrackingNumber(e.target.value)}
									className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border ${
										errors.trackingNumber
											? "border-red-500"
											: "border-gray-300 dark:border-gray-600"
									} rounded-md text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
									placeholder="Ej. TRA123456789"
									disabled={isLoading}
								/>
								{errors.trackingNumber && (
									<p className="mt-1 text-sm text-red-500">
										{errors.trackingNumber}
									</p>
								)}
							</div>

							{/* Transportista */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Transportista <span className="text-red-500">*</span>
								</label>
								<select
									value={shippingCompany}
									onChange={(e) => setShippingCompany(e.target.value)}
									className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border ${
										errors.shippingCompany
											? "border-red-500"
											: "border-gray-300 dark:border-gray-600"
									} rounded-md text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
									disabled={isLoading}
								>
									<option value="">Seleccionar transportista</option>
									<option value="Correos Express">Correos Express</option>
									<option value="SEUR">SEUR</option>
									<option value="MRW">MRW</option>
									<option value="DHL">DHL</option>
									<option value="FedEx">FedEx</option>
									<option value="UPS">UPS</option>
									<option value="GLS">GLS</option>
									<option value="Correos">Correos</option>
								</select>
								{errors.shippingCompany && (
									<p className="mt-1 text-sm text-red-500">
										{errors.shippingCompany}
									</p>
								)}
							</div>

							{/* Fecha Estimada de Entrega */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Fecha Estimada de Entrega
								</label>
								<input
									type="date"
									value={estimatedDelivery}
									onChange={(e) => setEstimatedDelivery(e.target.value)}
									className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border ${
										errors.estimatedDelivery
											? "border-red-500"
											: "border-gray-300 dark:border-gray-600"
									} rounded-md text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
									disabled={isLoading}
								/>
								{errors.estimatedDelivery && (
									<p className="mt-1 text-sm text-red-500">
										{errors.estimatedDelivery}
									</p>
								)}
							</div>

							{/* Notas */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Notas
								</label>
								<textarea
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
									rows={3}
									placeholder="Instrucciones especiales de entrega..."
									disabled={isLoading}
								></textarea>
							</div>
						</div>

						{/* Pie del modal con botones */}
						<div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
							<button
								type="button"
								onClick={onClose}
								className="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
								disabled={isLoading}
							>
								Cancelar
							</button>
							<button
								type="submit"
								className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center"
								disabled={isLoading}
							>
								{isLoading && (
									<svg
										className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
										xmlns="http://www.w3.org/2000/svg"
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
								)}
								Guardar
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default ShippingFormModal;
