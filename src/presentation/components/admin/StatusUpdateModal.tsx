import React, {useState} from "react";
import {Ban, CheckCircle, AlertTriangle} from "lucide-react";

interface StatusUpdateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (reason: string) => void;
	title: string;
	message: string;
	confirmButtonText: string;
	status: "suspend" | "activate" | "deactivate";
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmButtonText,
	status,
}) => {
	const [reason, setReason] = useState("");

	if (!isOpen) return null;

	const handleConfirm = () => {
		onConfirm(reason);
		setReason("");
	};

	const getStatusIcon = () => {
		switch (status) {
			case "suspend":
				return <Ban className="h-12 w-12 text-yellow-500" />;
			case "deactivate":
				return <Ban className="h-12 w-12 text-red-500" />;
			case "activate":
				return <CheckCircle className="h-12 w-12 text-green-500" />;
			default:
				return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
		}
	};

	const getButtonClass = () => {
		switch (status) {
			case "suspend":
				return "bg-yellow-600 hover:bg-yellow-700";
			case "deactivate":
				return "bg-red-600 hover:bg-red-700";
			case "activate":
				return "bg-green-600 hover:bg-green-700";
			default:
				return "bg-blue-600 hover:bg-blue-700";
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
			<div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md z-10">
				<div className="flex flex-col items-center mb-4">
					{getStatusIcon()}
					<h3 className="text-xl font-semibold mt-2 text-gray-900 dark:text-white">
						{title}
					</h3>
				</div>

				<p className="text-gray-700 dark:text-gray-300 mb-4">{message}</p>

				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Razón (opcional):
					</label>
					<textarea
						className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
						rows={3}
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						placeholder="Explique brevemente la razón de esta acción..."
					/>
				</div>

				<div className="flex justify-end space-x-3">
					<button
						className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
						onClick={onClose}
					>
						Cancelar
					</button>

					<button
						className={`px-4 py-2 text-white rounded-md transition-colors ${getButtonClass()}`}
						onClick={handleConfirm}
					>
						{confirmButtonText}
					</button>
				</div>
			</div>
		</div>
	);
};

export default StatusUpdateModal;
