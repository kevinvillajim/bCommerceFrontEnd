// src/presentation/components/shipping/ShippingFromModal.tsx
import React, { useState, useEffect } from "react";
import { X, Truck, Package, CheckCircle } from "lucide-react";
import { COURIER_CONFIG, generateTrackingNumber } from "../../../constants/courierConfig";

export interface ShippingFormData {
	tracking_number: string;
	shipping_company: string;
	estimated_delivery?: string;
	notes?: string;
}

interface ShippingFromModalProps {
	orderId: string;
	orderNumber?: string;
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: ShippingFormData) => Promise<void>;
	isLoading?: boolean;
}

const ShippingFromModal: React.FC<ShippingFromModalProps> = ({
	orderId,
	orderNumber,
	isOpen,
	onClose,
	onSubmit,
	isLoading = false,
}) => {
	const [formData, setFormData] = useState<ShippingFormData>({
		tracking_number: "",
		shipping_company: "Correos Express",
		estimated_delivery: "",
		notes: "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});


	useEffect(() => {
		if (isOpen) {
			const trackingNumber = generateTrackingNumber("Correos Express");

			const estimatedDate = new Date();
			estimatedDate.setDate(estimatedDate.getDate() + 4);

			setFormData({
				tracking_number: trackingNumber,
				shipping_company: "Correos Express",
				estimated_delivery: estimatedDate.toISOString().split("T")[0],
				notes: "",
			});
			setErrors({});
		}
	}, [isOpen]);

	const handleCompanyChange = (company: string) => {
		const newTracking = generateTrackingNumber(company);
		setFormData((prev) => ({
			...prev,
			shipping_company: company,
			tracking_number: newTracking,
		}));
	};

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.tracking_number.trim()) {
			newErrors.tracking_number = "El número de seguimiento es requerido";
		}
		if (!formData.shipping_company.trim()) {
			newErrors.shipping_company = "La empresa de envío es requerida";
		}
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;
		try {
			await onSubmit(formData);
		} catch (error) {
			console.error("Error al procesar envío:", error);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;

		if (name === "shipping_company") {
			handleCompanyChange(value);
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}

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
      <div className="flex items-center justify-center min-h-screen px-4 py-10 text-center sm:p-0">
        {/* Overlay */}
        <div
  className="fixed inset-0 bg-black-30 backdrop-blur-sm transition-opacity z-40"
  onClick={onClose}
/>

        {/* Modal */}
        <div
          role="dialog"
          aria-modal="true"
          className="z-50 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-white bg-opacity-20">
                  <Truck className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg leading-6 font-semibold text-white">
                    Procesar Envío
                  </h3>
                  <p className="text-sm text-primary-100">
                    {orderNumber
                      ? `Pedido ${orderNumber}`
                      : `Pedido #${orderId}`}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-primary-200 transition-colors"
                disabled={isLoading}
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa de Envío
                </label>
                <select
                  name="shipping_company"
                  value={formData.shipping_company}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={isLoading}
                >
                  {COURIER_CONFIG.map((courier) => (
                    <option key={courier.value} value={courier.value}>
                      {courier.name}
                    </option>
                  ))}
                </select>
                {errors.shipping_company && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.shipping_company}
                  </p>
                )}
              </div>

              {/* Tracking */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Seguimiento
                  <span className="text-green-600 text-xs ml-2">
                    (Generado automáticamente)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="tracking_number"
                    value={formData.tracking_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={isLoading}
                  />
                  <CheckCircle className="absolute right-3 top-2.5 h-5 w-5 text-green-500" />
                </div>
                {errors.tracking_number && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.tracking_number}
                  </p>
                )}
              </div>

              {/* Fecha estimada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Entrega Estimada
                </label>
                <input
                  type="date"
                  name="estimated_delivery"
                  value={formData.estimated_delivery}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={isLoading}
                />
                {errors.estimated_delivery && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.estimated_delivery}
                  </p>
                )}
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (Opcional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Información adicional sobre el envío..."
                  disabled={isLoading}
                />
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <Package
                    size={16}
                    className="mr-2"
                  />
                  Procesar Envío
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingFromModal;
