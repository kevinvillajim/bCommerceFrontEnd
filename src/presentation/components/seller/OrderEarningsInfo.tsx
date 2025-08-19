import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Info, AlertCircle } from 'lucide-react';
import FinancialConfigurationService from '@/core/services/FinancialConfigurationService';
import type { FinancialConfiguration } from '@/core/services/FinancialConfigurationService';

interface OrderEarningsInfoProps {
	subtotal: number;
	shippingCost: number;
	sellerIds: number[];
	currentSellerId?: number;
	showBreakdown?: boolean;
	className?: string;
}

interface EarningsBreakdown {
	gross_earnings: number;
	platform_commission: number;
	net_earnings: number;
	shipping_earnings: number;
	total_earnings: number;
	commission_rate: number;
}

/**
 * Componente que muestra información de ganancias para vendedores
 * Calcula comisiones y distribución de envíos según configuraciones del sistema
 */
const OrderEarningsInfo: React.FC<OrderEarningsInfoProps> = ({
	subtotal,
	shippingCost,
	sellerIds,
	currentSellerId,
	showBreakdown = false,
	className = ''
}) => {
	const [earnings, setEarnings] = useState<EarningsBreakdown | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [config, setConfig] = useState<FinancialConfiguration | null>(null);

	const financialService = FinancialConfigurationService.getInstance();

	useEffect(() => {
		calculateEarnings();
	}, [subtotal, shippingCost, sellerIds, currentSellerId]);

	const calculateEarnings = async () => {
		try {
			setLoading(true);
			setError(null);

			// Obtener configuraciones financieras
			const financialConfig = await financialService.getFinancialConfiguration();
			setConfig(financialConfig);

			// Calcular comisión sobre el subtotal
			const commission = await financialService.calculateCommission(subtotal);

			// Calcular distribución de envío
			const shippingDistribution = await financialService.calculateShippingDistribution(
				shippingCost,
				sellerIds
			);

			// Encontrar la ganancia de envío para el vendedor actual
			let shippingEarnings = 0;
			if (currentSellerId) {
				const sellerShipping = shippingDistribution.distribution.find(
					d => d.seller_id === currentSellerId
				);
				shippingEarnings = sellerShipping?.amount || 0;
			} else if (sellerIds.length === 1) {
				// Si solo hay un vendedor y no se especifica currentSellerId
				shippingEarnings = shippingDistribution.distribution[0]?.amount || 0;
			} else if (sellerIds.length > 1) {
				// Distribución equitativa entre vendedores
				shippingEarnings = shippingDistribution.distribution[0]?.amount || 0;
			}

			const earningsData: EarningsBreakdown = {
				gross_earnings: subtotal,
				platform_commission: commission.commission_amount,
				net_earnings: commission.seller_earnings,
				shipping_earnings: shippingEarnings,
				total_earnings: commission.seller_earnings + shippingEarnings,
				commission_rate: commission.commission_rate
			};

			setEarnings(earningsData);

		} catch (err) {
			console.error('Error calculando ganancias:', err);
			setError('Error al calcular ganancias');
		} finally {
			setLoading(false);
		}
	};

	const formatCurrency = (amount: number) => {
		return financialService.formatCurrency(amount);
	};

	const formatPercentage = (percentage: number) => {
		return financialService.formatPercentage(percentage);
	};

	if (loading) {
		return (
			<div className={`flex items-center gap-2 text-gray-500 ${className}`}>
				<DollarSign className="h-4 w-4 animate-pulse" />
				<span className="text-sm">Calculando...</span>
			</div>
		);
	}

	if (error || !earnings) {
		return (
			<div className={`flex items-center gap-2 text-red-500 ${className}`}>
				<AlertCircle className="h-4 w-4" />
				<span className="text-sm">{error || 'Error calculando ganancias'}</span>
			</div>
		);
	}

	if (!showBreakdown) {
		// Vista compacta para tablas
		return (
			<div className={`flex items-center gap-2 ${className}`}>
				<TrendingUp className="h-4 w-4 text-green-600" />
				<div className="text-right">
					<div className="font-semibold text-green-700">
						{formatCurrency(earnings.total_earnings)}
					</div>
					<div className="text-xs text-gray-500">
						(Comisión: {formatPercentage(earnings.commission_rate)})
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
					<span className="font-medium">{formatCurrency(earnings.gross_earnings)}</span>
				</div>

				{/* Comisión de plataforma */}
				<div className="flex justify-between text-red-600">
					<span>Comisión plataforma ({formatPercentage(earnings.commission_rate)}):</span>
					<span className="font-medium">-{formatCurrency(earnings.platform_commission)}</span>
				</div>

				{/* Ganancias netas de productos */}
				<div className="flex justify-between font-medium">
					<span className="text-gray-800">Ganancia neta de productos:</span>
					<span className="text-green-700">{formatCurrency(earnings.net_earnings)}</span>
				</div>

				{/* Ganancia por envío */}
				{earnings.shipping_earnings > 0 && (
					<div className="flex justify-between">
						<span className="text-gray-600">
							Ganancia por envío:
							{sellerIds.length > 1 && (
								<span className="text-xs ml-1">
									({sellerIds.length} vendedores)
								</span>
							)}
						</span>
						<span className="font-medium text-blue-700">
							+{formatCurrency(earnings.shipping_earnings)}
						</span>
					</div>
				)}

				{/* Separador */}
				<hr className="border-gray-300" />

				{/* Total */}
				<div className="flex justify-between font-bold text-lg">
					<span className="text-gray-800">Total a recibir:</span>
					<span className="text-green-700">{formatCurrency(earnings.total_earnings)}</span>
				</div>
			</div>

			{/* Información adicional */}
			{config && (
				<div className="mt-4 pt-3 border-t border-gray-300">
					<div className="flex items-start gap-2 text-xs text-gray-500">
						<Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
						<div>
							<p>Configuraciones actuales del sistema:</p>
							<ul className="mt-1 space-y-1">
								<li>• Comisión plataforma: {formatPercentage(config.platform_commission_rate)}</li>
								{sellerIds.length === 1 && (
									<li>• Envío un vendedor: {formatPercentage(config.shipping_seller_percentage)}</li>
								)}
								{sellerIds.length > 1 && (
									<li>• Envío máximo/vendedor: {formatPercentage(config.shipping_max_seller_percentage)}</li>
								)}
							</ul>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default OrderEarningsInfo;