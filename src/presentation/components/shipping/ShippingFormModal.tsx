import React, {useState} from "react";
import {Truck, X} from "lucide-react";

interface ShippingFormModalProps {
	orderId: string;
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (shippingData: ShippingFormData) => void;
	isLoading?: boolean;
}

export interface ShippingFormData {
	tracking_number?: string;
	shipping_company?: string;
	estimated_delivery?: string;
	notes?: string;
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

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const {name, value} = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md relative">
				<div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
					<h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
						<Truck className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
						Información de envío
					</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-4 space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Número de seguimiento*
						</label>
						<input
							type="text"
							name="tracking_number"
							value={formData.tracking_number}
							onChange={handleChange}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
							required
							placeholder="Ej: TRP1234567890"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Empresa de transporte
						</label>
						<select
							name="shipping_company"
							value={formData.shipping_company}
							onChange={handleChange}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
						>
							<option value="">Seleccionar transportista</option>
							<option value="Correos Express">Correos Express</option>
							<option value="SEUR">SEUR</option>
							<option value="MRW">MRW</option>
							<option value="DHL">DHL</option>
							<option value="FedEx">FedEx</option>
							<option value="UPS">UPS</option>
							<option value="Otro">Otro</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Fecha estimada de entrega
						</label>
						<input
							type="date"
							name="estimated_delivery"
							value={formData.estimated_delivery}
							onChange={handleChange}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
							min={new Date().toISOString().split("T")[0]} // Fecha mínima = hoy
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Notas adicionales
						</label>
						<textarea
							name="notes"
							value={formData.notes}
							onChange={handleChange}
							rows={3}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
							placeholder="Información adicional sobre el envío..."
						/>
					</div>

					<div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
							disabled={isLoading}
						>
							Cancelar
						</button>
						<button
							type="submit"
							className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
							disabled={isLoading}
						>
							{isLoading ? (
								<div className="flex items-center">
									<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
									Guardando...
								</div>
							) : (
								"Marcar como enviado"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ShippingFormModal;
