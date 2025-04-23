/**
 * Formatea un valor numérico a formato de moneda ($)
 * @param amount - Cantidad a formatear
 * @returns Texto formateado con formato de moneda
 */
export function formatCurrency(amount: number | null | undefined): string {
	// Si el valor es nulo, indefinido o no es un número válido, devolver $0.00
	if (typeof amount !== "number" || isNaN(amount)) return "$0.00";

	// Redondear a 2 decimales para evitar problemas con valores flotantes
	const roundedAmount = Math.round(amount * 100) / 100;

	// Usar Intl.NumberFormat para formatear correctamente según la localización
	return new Intl.NumberFormat("es-EC", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(roundedAmount);
}

export default formatCurrency;
