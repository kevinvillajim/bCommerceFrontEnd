import React, {useState} from "react";
import {Ban, CheckCircle, Eye} from "lucide-react";

interface StatusUpdateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (status: string, reason: string) => void;
	sellerName: string;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	sellerName,
}) => {
	const [selectedStatus, setSelectedStatus] = useState("active");
	const [reason, setReason] = useState("");

	if (!isOpen) return null;

	const handleConfirm = () => {
		onConfirm(selectedStatus, selectedStatus === "active" ? "" : reason);
		setReason("");
		setSelectedStatus("active");
		onClose();
	};

	const getStatusIcon = () => {
		switch (selectedStatus) {
			case "suspended":
				return <Ban className="h-12 w-12 text-yellow-500" />;
			case "inactive":
				return <Eye className="h-12 w-12 text-red-500" />;
			case "active":
				return <CheckCircle className="h-12 w-12 text-green-500" />;
			default:
				return <CheckCircle className="h-12 w-12 text-green-500" />;
		}
	};

	const getButtonClass = () => {
		switch (selectedStatus) {
			case "suspended":
				return "bg-yellow-600 hover:bg-yellow-700";
			case "inactive":
				return "bg-red-600 hover:bg-red-700";
			case "active":
				return "bg-green-600 hover:bg-green-700";
			default:
				return "bg-blue-600 hover:bg-blue-700";
		}
	};

	const getStatusInfo = () => {
		switch (selectedStatus) {
			case "active":
				return {
					title: "Estado Activo",
					description: "El vendedor tendrá acceso completo. Sus productos aparecerán en la tienda y podrá vender normalmente."
				};
			case "suspended":
				return {
					title: "Estado Suspendido", 
					description: "El vendedor podrá ver su información histórica pero sus productos no aparecerán en la tienda. No podrá realizar ventas."
				};
			case "inactive":
				return {
					title: "Estado Inactivo",
					description: "El vendedor podrá ingresar pero verá todos sus datos en cero. Sus productos no aparecerán en la tienda."
				};
			default:
				return {title: "", description: ""};
		}
	};

	const statusOptions = [
		{ value: "active", label: "Activo" },
		{ value: "suspended", label: "Suspendido" },
		{ value: "inactive", label: "Inactivo" }
	];

	const statusInfo = getStatusInfo();

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Overlay */}
			<div
				className="fixed inset-0 bg-black bg-opacity-50"
				onClick={onClose}
			></div>

			{/* Modal */}
			<div className="bg-white rounded-lg p-6 w-full max-w-md z-10">
				<div className="flex flex-col items-center mb-4">
					{getStatusIcon()}
					<h3 className="text-xl font-semibold mt-2 text-gray-900">
						Cambiar Estado de Vendedor
					</h3>
				</div>

				<p className="text-gray-700 mb-4 text-center">
					Vendedor: <strong>{sellerName}</strong>
				</p>

				{/* Dropdown de Estado */}
				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Nuevo Estado:
					</label>
					<select
						className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
						value={selectedStatus}
						onChange={(e) => setSelectedStatus(e.target.value)}
					>
						{statusOptions.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>

				{/* Información del Estado Seleccionado */}
				{statusInfo.title && (
					<div className="mb-4 p-3 bg-gray-50 rounded-md border">
						<h4 className="font-medium text-gray-900 mb-1">{statusInfo.title}</h4>
						<p className="text-sm text-gray-600">{statusInfo.description}</p>
					</div>
				)}

				{/* Campo de Motivo (solo si no es activo) */}
				{selectedStatus !== "active" && (
					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Motivo <span className="text-red-500">*</span>:
						</label>
						<textarea
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
							rows={3}
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder="Explique brevemente la razón de esta acción..."
							required
						/>
					</div>
				)}

				<div className="flex justify-end space-x-3">
					<button
						className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
						onClick={onClose}
					>
						Cancelar
					</button>

					<button
						className={`px-4 py-2 text-white rounded-md transition-colors ${getButtonClass()}`}
						onClick={handleConfirm}
						disabled={selectedStatus !== "active" && !reason.trim()}
					>
						Confirmar Cambio
					</button>
				</div>
			</div>
		</div>
	);
};

export default StatusUpdateModal;
