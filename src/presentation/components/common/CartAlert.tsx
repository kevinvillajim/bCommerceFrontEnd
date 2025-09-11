import React, {useState, useEffect} from "react";
import {ShoppingCart, X, Check, AlertCircle} from "lucide-react";

interface CartAlertProps {
	type: "success" | "error" | "info";
	message: string;
	onClose?: () => void;
	autoClose?: boolean;
	autoCloseTime?: number;
}

const CartAlert: React.FC<CartAlertProps> = ({
	type,
	message,
	onClose,
	autoClose = true,
	autoCloseTime = 3000,
}) => {
	const [visible, setVisible] = useState(true);

	// Auto-cerrar después de cierto tiempo
	useEffect(() => {
		if (autoClose && visible) {
			const timer = setTimeout(() => {
				setVisible(false);
				if (onClose) onClose();
			}, autoCloseTime);

			return () => clearTimeout(timer);
		}
	}, [autoClose, autoCloseTime, visible, onClose]);

	// Cerrar la alerta
	const handleClose = () => {
		setVisible(false);
		if (onClose) onClose();
	};

	// No renderizar si no es visible
	if (!visible) return null;

	// Clases y colores según el tipo
	const bgColors = {
		success: "bg-green-50 border-green-200 text-green-700",
		error: "bg-red-50 border-red-200 text-red-700",
		info: "bg-primary-50 border-primary-200 text-primary-700",
	};

	// Icono según el tipo
	const icons = {
		success: <Check size={20} className="text-green-500" />,
		error: <AlertCircle size={20} className="text-red-500" />,
		info: <ShoppingCart size={20} className="text-primary-500" />,
	};

	return (
		<div
			className={`fixed bottom-4 right-4 z-50 max-w-md w-full md:w-auto py-3 px-4 rounded-lg border shadow-lg transition-all ${bgColors[type]}`}
		>
			<div className="flex items-center">
				<div className="flex-shrink-0 mr-3">{icons[type]}</div>
				<div className="flex-1 mr-2">
					<p className="text-sm font-medium">{message}</p>
				</div>
				<button
					onClick={handleClose}
					className={`p-1 rounded-full hover:bg-opacity-20 hover:bg-gray-700 transition-colors`}
				>
					<X size={16} />
				</button>
			</div>
		</div>
	);
};

export default CartAlert;
