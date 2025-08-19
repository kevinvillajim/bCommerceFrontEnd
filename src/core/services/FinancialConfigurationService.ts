import apiClient from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';

/**
 * Configuraciones financieras del sistema
 */
export interface FinancialConfiguration {
	platform_commission_rate: number;
	shipping_seller_percentage: number;
	shipping_max_seller_percentage: number;
	last_updated?: string;
}

/**
 * Datos para cálculos de comisiones y envíos
 */
export interface CommissionCalculation {
	subtotal: number;
	commission_rate: number;
	commission_amount: number;
	seller_earnings: number;
}

export interface ShippingDistribution {
	total_shipping: number;
	seller_count: number;
	distribution: Array<{
		seller_id: number;
		amount: number;
		percentage: number;
	}>;
}

/**
 * Servicio para gestionar configuraciones financieras
 * Maneja comisiones de plataforma y distribución de envíos
 */
class FinancialConfigurationService {
	private static instance: FinancialConfigurationService;
	private configCache: FinancialConfiguration | null = null;
	private cacheExpiry: number | null = null;
	private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

	private constructor() {}

	public static getInstance(): FinancialConfigurationService {
		if (!FinancialConfigurationService.instance) {
			FinancialConfigurationService.instance = new FinancialConfigurationService();
		}
		return FinancialConfigurationService.instance;
	}

	/**
	 * Obtiene las configuraciones financieras (con caché)
	 */
	public async getFinancialConfiguration(): Promise<FinancialConfiguration> {
		// Verificar si el caché es válido
		if (this.configCache && this.cacheExpiry && Date.now() < this.cacheExpiry) {
			return this.configCache;
		}

		try {
			console.log('📊 Obteniendo configuraciones financieras del servidor');

			const response = await apiClient.get<FinancialConfiguration>(
				API_ENDPOINTS.ADMIN.CONFIGURATIONS.FINANCIAL
			);

			// Actualizar caché
			this.configCache = {
				platform_commission_rate: Number(response.platform_commission_rate) || 10.0,
				shipping_seller_percentage: Number(response.shipping_seller_percentage) || 80.0,
				shipping_max_seller_percentage: Number(response.shipping_max_seller_percentage) || 40.0,
				last_updated: response.last_updated
			};

			this.cacheExpiry = Date.now() + this.CACHE_DURATION;

			console.log('✅ Configuraciones financieras cargadas:', this.configCache);
			return this.configCache;

		} catch (error) {
			console.error('❌ Error obteniendo configuraciones financieras:', error);
			
			// Devolver valores por defecto si falla
			const defaultConfig: FinancialConfiguration = {
				platform_commission_rate: 10.0,
				shipping_seller_percentage: 80.0,
				shipping_max_seller_percentage: 40.0
			};

			return defaultConfig;
		}
	}

	/**
	 * Invalida el caché (usar después de cambios en configuraciones)
	 */
	public invalidateCache(): void {
		this.configCache = null;
		this.cacheExpiry = null;
		console.log('🔄 Caché de configuraciones financieras invalidado');
	}

	/**
	 * Calcula la comisión de plataforma para una venta
	 */
	public async calculateCommission(subtotal: number): Promise<CommissionCalculation> {
		const config = await this.getFinancialConfiguration();
		
		const commission_rate = config.platform_commission_rate / 100; // Convertir a decimal
		const commission_amount = subtotal * commission_rate;
		const seller_earnings = subtotal - commission_amount;

		return {
			subtotal,
			commission_rate: config.platform_commission_rate,
			commission_amount: Number(commission_amount.toFixed(2)),
			seller_earnings: Number(seller_earnings.toFixed(2))
		};
	}

	/**
	 * Calcula la distribución de costos de envío entre vendedores
	 */
	public async calculateShippingDistribution(
		total_shipping: number, 
		seller_ids: number[]
	): Promise<ShippingDistribution> {
		const config = await this.getFinancialConfiguration();
		const seller_count = seller_ids.length;

		let distribution: Array<{ seller_id: number; amount: number; percentage: number }> = [];

		if (seller_count === 1) {
			// Un solo vendedor: recibe el porcentaje configurado
			const percentage = config.shipping_seller_percentage;
			const amount = (total_shipping * percentage) / 100;
			
			distribution = [{
				seller_id: seller_ids[0],
				amount: Number(amount.toFixed(2)),
				percentage
			}];

		} else if (seller_count > 1) {
			// Múltiples vendedores: aplicar porcentaje máximo dividido equitativamente
			const max_percentage = config.shipping_max_seller_percentage;
			const percentage_per_seller = max_percentage / seller_count;
			const amount_per_seller = (total_shipping * percentage_per_seller) / 100;

			distribution = seller_ids.map(seller_id => ({
				seller_id,
				amount: Number(amount_per_seller.toFixed(2)),
				percentage: Number(percentage_per_seller.toFixed(2))
			}));
		}

		return {
			total_shipping,
			seller_count,
			distribution
		};
	}

	/**
	 * Obtiene un resumen financiero completo para un pedido
	 */
	public async getOrderFinancialSummary(
		subtotal: number,
		shipping_cost: number,
		seller_ids: number[]
	): Promise<{
		commission: CommissionCalculation;
		shipping: ShippingDistribution;
		platform_earnings: {
			commission: number;
			shipping_retained: number;
			total: number;
		};
	}> {
		const [commission, shipping] = await Promise.all([
			this.calculateCommission(subtotal),
			this.calculateShippingDistribution(shipping_cost, seller_ids)
		]);

		// Calcular lo que retiene la plataforma del envío
		const total_shipping_distributed = shipping.distribution.reduce(
			(sum, item) => sum + item.amount, 0
		);
		const shipping_retained = shipping_cost - total_shipping_distributed;

		return {
			commission,
			shipping,
			platform_earnings: {
				commission: commission.commission_amount,
				shipping_retained: Number(shipping_retained.toFixed(2)),
				total: Number((commission.commission_amount + shipping_retained).toFixed(2))
			}
		};
	}

	/**
	 * Valida que las configuraciones sean coherentes
	 */
	public async validateConfiguration(): Promise<{
		isValid: boolean;
		errors: string[];
	}> {
		const config = await this.getFinancialConfiguration();
		const errors: string[] = [];

		// Validar rangos
		if (config.platform_commission_rate < 0 || config.platform_commission_rate > 50) {
			errors.push('La comisión de plataforma debe estar entre 0% y 50%');
		}

		if (config.shipping_seller_percentage < 0 || config.shipping_seller_percentage > 100) {
			errors.push('El porcentaje de envío para un vendedor debe estar entre 0% y 100%');
		}

		if (config.shipping_max_seller_percentage < 0 || config.shipping_max_seller_percentage > 100) {
			errors.push('El porcentaje máximo de envío debe estar entre 0% y 100%');
		}

		// Validar lógica de negocio
		if (config.shipping_max_seller_percentage >= config.shipping_seller_percentage) {
			errors.push('El porcentaje máximo debe ser menor al porcentaje para un solo vendedor');
		}

		return {
			isValid: errors.length === 0,
			errors
		};
	}

	/**
	 * Formatea un monto para mostrar
	 */
	public formatCurrency(amount: number): string {
		return new Intl.NumberFormat('es-EC', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	}

	/**
	 * Formatea un porcentaje para mostrar
	 */
	public formatPercentage(percentage: number): string {
		return `${percentage.toFixed(1)}%`;
	}
}

export default FinancialConfigurationService;