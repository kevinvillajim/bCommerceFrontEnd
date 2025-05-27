import React from "react";
import type {OrderStatus} from "../../../core/domain/entities/Order";

// Definir el tipo PaymentStatus con todos los valores posibles
type PaymentStatus =
	| "pending"
	| "completed" // Añadido "completed" que viene de la API
	| "paid"
	| "failed"
	| "rejected"
	| null
	| undefined;

interface OrderStatusBadgeProps {
	status: OrderStatus | PaymentStatus | string;
	type?: "order" | "payment";
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
	status,
	type = "order",
}) => {
	let statusClass = "";
	let statusText = "";

	if (type === "order") {
		switch (status) {
			case "pending":
				statusClass =
					"bg-yellow-100 text-yellow-800";
				statusText = "Pendiente";
				break;
			case "processing":
				statusClass =
					"bg-blue-100 text-blue-800";
				statusText = "En Proceso";
				break;
			case "paid":
				statusClass =
					"bg-teal-100 text-teal-800";
				statusText = "Pagado";
				break;
			case "shipped":
				statusClass =
					"bg-indigo-100 text-indigo-800";
				statusText = "Enviado";
				break;
			case "delivered":
				statusClass =
					"bg-purple-100 text-purple-800";
				statusText = "Entregado";
				break;
			case "completed":
				statusClass =
					"bg-green-100 text-green-800";
				statusText = "Completado";
				break;
			case "cancelled":
				statusClass =
					"bg-red-100 text-red-800";
				statusText = "Cancelado";
				break;
			default:
				statusClass =
					"bg-gray-100 text-gray-800";
				statusText = status?.toString() || "Desconocido";
		}
	} else if (type === "payment") {
		switch (status) {
			case "pending":
				statusClass =
					"bg-yellow-100 text-yellow-800";
				statusText = "Pendiente";
				break;
			case "completed":
			case "paid":
				statusClass =
					"bg-green-100 text-green-800";
				statusText = "Completado";
				break;
			case "failed":
			case "rejected":
				statusClass =
					"bg-red-100 text-red-800";
				statusText = "Fallido";
				break;
			default:
				statusClass =
					"bg-gray-100 text-gray-800";
				statusText = status?.toString() || "Desconocido";
		}
	}

	return (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}
		>
			{statusText}
		</span>
	);
};

export default OrderStatusBadge;
