// src/presentation/components/shipping/ShippingFormModal.tsx
import React, { useState } from "react";
import { X, Package, Truck, Calendar } from "lucide-react";

export interface ShippingFormData {
	tracking_number: string;
	shipping_company: string;
	estimated_delivery?: string;
	notes?: string;
}

interface ShippingFormModalProps {
	orderId: string;
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: ShippingFormData) => Promise<void>;
	isLoading?: boolean;
}

const ShippingFormModal: React.FC<ShippingFormModalProps> = ({
	orderId,
	isOpen,
	onClose,
	onSubmit,
	isLoading = false,
}) => {
	const [formData, setFormData] = useState<ShippingFormData>({
		tracking_number: "",
		shipping_company: "",
		estimated_delivery: "",
		notes: "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	// Resetear formulario cuando se cierra el modal
	React.useEffect(() => {
		if (!isOpen) {
			setFormData({
				tracking_number: "",
				shipping_company: "",
				estimated_delivery: "",
				notes: "",
			});
			setErrors({});
		}
	}, [isOpen]);

	// Validar formulario
	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.tracking_number.trim()) {
			newErrors.tracking_number = "El número de seguimiento es requerido";
		}

		if (!formData.shipping_company.trim()) {
			newErrors.shipping_company = "La empresa de envío es requerida";
		}

		// Validar fecha de entrega estimada (opcional pero si se proporciona debe ser válida)
		if (formData.estimated_delivery) {
			const selectedDate = new Date(formData.estimated_delivery);
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			if (selectedDate < today) {
				newErrors.estimated_delivery = "La fecha de entrega debe ser futura";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Manejar envío del formulario
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			await onSubmit(formData);
		} catch (error) {
			console.error("Error al enviar formulario de shipping:", error);
		}
	};

	// Manejar cambios en los inputs
	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Limpiar error del campo cuando el usuario empiece a escribir
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
				{/* Overlay */}
				<div
					className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
					onClick={onClose}
				></div>

				{/* Modal */}
				<div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
					{/* Header */}
					<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center">
								<div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
									<Package className="h-6 w-6 text-blue-600" />
								</div>
								<div className="ml-3">
									<h3 className="text-lg leading-6 font-medium text-gray-900">
										Asignar Número de Seguimiento
									</h3>
									<p className="text-sm text-gray-500">
										Pedido #{orderId}
									</p>
								</div>
							</div>
							<button
								onClick={onClose}
								className="text-gray-400 hover:text-gray-600"
								disabled={isLoading}
							>
								<X size={24} />
							</button>
						</div>

						{/* Formulario */}
						<form onSubmit={handleSubmit} className="space-y-4">
							{/* Número de seguimiento */}
							<div>
								<label
									htmlFor="tracking_number"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Número de Seguimiento *
								</label>
								<input
									type="text"
									id="tracking_number"
									name="tracking_number"
									value={formData.tracking_number}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
										errors.tracking_number
											? "border-red-500"
											: "border-gray-300"
									}`}
									placeholder="Ejemplo: 1Z999AA1234567890"
									disabled={isLoading}
								/>
								{errors.tracking_number && (
									<p className="mt-1 text-sm text-red-600">
										{errors.tracking_number}
									</p>
								)}
							</div>

							{/* Empresa de envío */}
							<div>
								<label
									htmlFor="shipping_company"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Empresa de Envío *
								</label>
								<select
									id="shipping_company"
									name="shipping_company"
									value={formData.shipping_company}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
										errors.shipping_company
											? "border-red-500"
											: "border-gray-300"
									}`}
									disabled={isLoading}
								>
									<option value="">Seleccionar empresa...</option>
									<option value="Correos Express">Correos Express</option>
									<option value="SEUR">SEUR</option>
									<option value="MRW">MRW</option>
									<option value="DHL">DHL</option>
									<option value="FedEx">FedEx</option>
									<option value="UPS">UPS</option>
									<option value="Nacex">Nacex</option>
									<option value="GLS">GLS</option>
									<option value="Envialia">Envialia</option>
									<option value="Otro">Otro</option>
								</select>
								{errors.shipping_company && (
									<p className="mt-1 text-sm text-red-600">
										{errors.shipping_company}
									</p>
								)}
							</div>

							{/* Fecha de entrega estimada */}
							<div>
								<label
									htmlFor="estimated_delivery"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Fecha de Entrega Estimada
								</label>
								<div className="relative">
									<input
										type="date"
										id="estimated_delivery"
										name="estimated_delivery"
										value={formData.estimated_delivery}
										onChange={handleInputChange}
										min={new Date().toISOString().split('T')[0]}
										className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
											errors.estimated_delivery
												? "border-red-500"
												: "border-gray-300"
										}`}
										disabled={isLoading}
									/>
									<Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
								</div>
								{errors.estimated_delivery && (
									<p className="mt-1 text-sm text-red-600">
										{errors.estimated_delivery}
									</p>
								)}
							</div>

							{/* Notas adicionales */}
							<div>
								<label
									htmlFor="notes"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Notas Adicionales
								</label>
								<textarea
									id="notes"
									name="notes"
									value={formData.notes}
									onChange={handleInputChange}
									rows={3}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Información adicional sobre el envío..."
									disabled={isLoading}
								/>
							</div>
						</form>
					</div>

					{/* Footer */}
					<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
						<button
							type="submit"
							onClick={handleSubmit}
							disabled={isLoading}
							className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? (
								<div className="flex items-center">
									<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
									Procesando...
								</div>
							) : (
								<div className="flex items-center">
									<Truck size={16} className="mr-2" />
									Asignar y Enviar
								</div>
							)}
						</button>
						<button
							type="button"
							onClick={onClose}
							disabled={isLoading}
							className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
						>
							Cancelar
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ShippingFormModal;