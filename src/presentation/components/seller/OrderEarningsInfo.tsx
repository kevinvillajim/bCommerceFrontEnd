import React from 'react';
import { DollarSign, TrendingUp, Info } from 'lucide-react';

interface OrderEarningsInfoProps {
	grossEarnings: number;        // subtotal total del seller
	platformCommission: number;  // ya calculado en backend  
	netEarnings: number;         // ya calculado en backend
	shippingEarnings: number;    // ya calculado en backend
	totalEarnings: number;       // ya calculado en backend
	commissionRate: number;      // solo para mostrar %
	sellerCount?: number;        // número de sellers para mostrar info
	showBreakdown?: boolean;
	className?: string;
}

/**
 * Componente que muestra información de ganancias para vendedores
 * Usa datos ya calculados del backend (no hace llamadas a API)
 */
const OrderEarningsInfo: React.FC<OrderEarningsInfoProps> = ({
	grossEarnings,
	platformCommission,
	netEarnings,
	shippingEarnings,
	totalEarnings,
	commissionRate,
	sellerCount = 1,
	showBreakdown = false,
	className = ''
}) => {

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
		}).format(amount);
	};

	const formatPercentage = (percentage: number) => {
		return `${percentage.toFixed(1)}%`;
	};

	if (!showBreakdown) {
		// Vista compacta para tablas
		return (
			<div className={`flex items-center gap-2 ${className}`}>
				<TrendingUp className="h-4 w-4 text-green-600" />
				<div className="text-right">
					<div className="font-semibold text-green-700">
						{formatCurrency(totalEarnings)}
					</div>
					<div className="text-xs text-gray-500">
						(Comisión: {formatPercentage(commissionRate)})
					</div>
				</div>
			</div>
		);
	}

	// Vista detallada con desglose
	return (
		<div className={`bg-gray-50 rounded-lg p-4 space-y-3 ${className}`}>
			<div className="flex items-center gap-2 font-semibold text-gray-800">
				<DollarSign className="h-5 w-5 text-green-600" />
				<span>Desglose de Ganancias</span>
			</div>

			<div className="space-y-2 text-sm">
				{/* Ganancias brutas */}
				<div className="flex justify-between">
					<span className="text-gray-600">Subtotal de productos:</span>
					<span className="font-medium">{formatCurrency(grossEarnings)}</span>
				</div>

				{/* Comisión de plataforma */}
				<div className="flex justify-between text-red-600">
					<span>Comisión plataforma ({formatPercentage(commissionRate)}):</span>
					<span className="font-medium">-{formatCurrency(platformCommission)}</span>
				</div>

				{/* Ganancias netas de productos */}
				<div className="flex justify-between font-medium">
					<span className="text-gray-800">Ganancia neta de productos:</span>
					<span className="text-green-700">{formatCurrency(netEarnings)}</span>
				</div>

				{/* Ganancia por envío */}
				{shippingEarnings > 0 && (
					<div className="flex justify-between">
						<span className="text-gray-600">
							Ganancia por envío:
							{sellerCount > 1 && (
								<span className="text-xs ml-1">
									({sellerCount} vendedores)
								</span>
							)}
						</span>
						<span className="font-medium text-blue-700">
							+{formatCurrency(shippingEarnings)}
						</span>
					</div>
				)}

				{/* Separador */}
				<hr className="border-gray-300" />

				{/* Total */}
				<div className="flex justify-between font-bold text-lg">
					<span className="text-gray-800">Total a recibir:</span>
					<span className="text-green-700">{formatCurrency(totalEarnings)}</span>
				</div>
			</div>

			{/* Información adicional */}
			<div className="mt-4 pt-3 border-t border-gray-300">
				<div className="flex items-start gap-2 text-xs text-gray-500">
					<Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
					<div>
						<p>Configuraciones actuales del sistema:</p>
						<ul className="mt-1 space-y-1">
							<li>• Comisión plataforma: {formatPercentage(commissionRate)}</li>
							{sellerCount === 1 && (
								<li>• Envío un vendedor: 80.0%</li>
							)}
							{sellerCount > 1 && (
								<li>• Envío máximo/vendedor: 50.0%</li>
							)}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrderEarningsInfo;