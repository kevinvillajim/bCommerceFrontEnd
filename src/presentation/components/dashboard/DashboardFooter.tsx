import React from "react";

interface DashboardFooterProps {
	/**
	 * Tipo de dashboard para mostrar texto apropiado
	 */
	type: "admin" | "seller" | "customer" | "payment";

	/**
	 * Año actual (por defecto usa el año actual)
	 */
	year?: number;

	/**
	 * Texto adicional opcional
	 */
	additionalText?: string;
}

/**
 * Componente Footer reutilizable para todos los dashboards
 */
const DashboardFooter: React.FC<DashboardFooterProps> = ({
	type = "admin",
	year = new Date().getFullYear(),
	additionalText,
}) => {
	// Determinar el texto según el tipo de dashboard
	const getFooterText = () => {
		switch (type) {
			case "admin":
				return "Panel de Administración Comersia";
			case "seller":
				return "Portal de Vendedor Comersia";
			case "customer":
				return "Comersia";
			case "payment":
				return "Panel de Pagos Comersia";
			default:
				return "Comersia";
		}
	};

	return (
		<footer className="bg-white py-3 px-4 text-center text-sm text-gray-500 border-t border-gray-200">
			<p>
				&copy; {year} {getFooterText()}.
				{additionalText
					? ` ${additionalText}`
					: " Todos los derechos reservados."}
			</p>
		</footer>
	);
};

export default DashboardFooter;
