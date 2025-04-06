import React from "react";

interface DashboardFooterProps {
	/**
	 * Tipo de dashboard para mostrar texto apropiado
	 */
	type: "admin" | "seller" | "customer";

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
				return "Panel de Administración BCommerce";
			case "seller":
				return "Portal de Vendedor BCommerce";
			case "customer":
				return "BCommerce";
			default:
				return "BCommerce";
		}
	};

	return (
		<footer className="bg-white dark:bg-gray-800 py-3 px-4 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
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
