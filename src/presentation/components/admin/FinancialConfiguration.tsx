import React, { useState, useEffect } from 'react';
import { Save, DollarSign, TrendingUp, Shield, AlertTriangle, RefreshCw } from 'lucide-react';
import apiClient from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';

interface FinancialConfig {
	platform_commission_rate: string;
	shipping_seller_percentage: string;
	shipping_max_seller_percentage: string;
}

/**
 * Componente para configuraciones financieras críticas del sistema
 * Maneja comisiones de plataforma y porcentajes de envío
 */
const FinancialConfiguration: React.FC = () => {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const [config, setConfig] = useState<FinancialConfig>({
		platform_commission_rate: '10.0',
		shipping_seller_percentage: '80.0',
		shipping_max_seller_percentage: '40.0',
	});

	const [originalConfig, setOriginalConfig] = useState<FinancialConfig>({
		platform_commission_rate: '10.0',
		shipping_seller_percentage: '80.0',
		shipping_max_seller_percentage: '40.0',
	});

	useEffect(() => {
		loadConfiguration();
	}, []);

	const loadConfiguration = async () => {
		setLoading(true);
		setError(null);

		try {
			console.log('📊 Cargando configuraciones financieras...');
			
			// Usar el endpoint correcto para configuraciones financieras
			const response = await apiClient.get(API_ENDPOINTS.ADMIN.CONFIGURATIONS.FINANCIAL);
			
			console.log('✅ Respuesta del servidor:', response);

			// Verificar si la respuesta es válida
			if (response && typeof response === 'object') {
				const responseData = response as any;
				const loadedConfig = {
					platform_commission_rate: String(responseData.platform_commission_rate || '10.0'),
					shipping_seller_percentage: String(responseData.shipping_seller_percentage || '80.0'),
					shipping_max_seller_percentage: String(responseData.shipping_max_seller_percentage || '40.0'),
				};

				setConfig(loadedConfig);
				setOriginalConfig(loadedConfig);
				console.log('✅ Configuraciones cargadas:', loadedConfig);
			} else {
				throw new Error('Respuesta inválida del servidor');
			}
		} catch (err) {
			console.error('❌ Error loading financial configurations:', err);
			setError('No se pudieron cargar las configuraciones financieras. Usando valores por defecto.');
			
			// Si hay error, usar valores por defecto
			const defaultConfig = {
				platform_commission_rate: '10.0',
				shipping_seller_percentage: '80.0',
				shipping_max_seller_percentage: '40.0',
			};
			
			setConfig(defaultConfig);
			setOriginalConfig(defaultConfig);
		} finally {
			setLoading(false);
		}
	};

	const handleConfigChange = (field: keyof FinancialConfig, value: string) => {
		// Limpiar caracteres no válidos (solo números, punto decimal)
		const sanitizedValue = value.replace(/[^0-9.]/g, '');
		
		// Verificar que no haya más de un punto decimal
		const parts = sanitizedValue.split('.');
		if (parts.length > 2) return;
		
		// Limitar decimales a 2 dígitos
		if (parts.length === 2 && parts[1].length > 2) return;

		setConfig(prev => ({
			...prev,
			[field]: sanitizedValue
		}));

		// Limpiar mensajes de error
		setError(null);
	};

	const validateConfiguration = (): string | null => {
		const platformCommission = parseFloat(config.platform_commission_rate);
		const singleSellerPercentage = parseFloat(config.shipping_seller_percentage);
		const maxSellerPercentage = parseFloat(config.shipping_max_seller_percentage);

		// Validar que sean números válidos
		if (isNaN(platformCommission) || isNaN(singleSellerPercentage) || isNaN(maxSellerPercentage)) {
			return 'Todos los campos deben contener números válidos';
		}

		// Validar rangos
		if (platformCommission < 0 || platformCommission > 50) {
			return 'La comisión de plataforma debe estar entre 0% y 50%';
		}

		if (singleSellerPercentage < 0 || singleSellerPercentage > 100) {
			return 'El porcentaje de envío para un vendedor debe estar entre 0% y 100%';
		}

		if (maxSellerPercentage < 0 || maxSellerPercentage > 100) {
			return 'El porcentaje máximo de envío debe estar entre 0% y 100%';
		}

		// Validar lógica de negocio
		if (maxSellerPercentage >= singleSellerPercentage) {
			return 'El porcentaje máximo debe ser menor al porcentaje para un vendedor';
		}

		return null;
	};

	const saveConfiguration = async () => {
		const validationError = validateConfiguration();
		if (validationError) {
			setError(validationError);
			return;
		}

		setSaving(true);
		setError(null);
		setSuccess(null);

		try {
			console.log('💾 Guardando configuraciones financieras...');

			// Preparar datos para envío
			const configToSave = {
				platform_commission_rate: parseFloat(config.platform_commission_rate),
				shipping_seller_percentage: parseFloat(config.shipping_seller_percentage),
				shipping_max_seller_percentage: parseFloat(config.shipping_max_seller_percentage),
			};

			const response = await apiClient.put(API_ENDPOINTS.ADMIN.CONFIGURATIONS.FINANCIAL, configToSave);

			console.log('✅ Configuraciones guardadas:', response);

			// Actualizar estado original
			setOriginalConfig(config);
			setSuccess('Configuraciones guardadas exitosamente');
			
			// Limpiar mensaje de éxito después de 3 segundos
			setTimeout(() => setSuccess(null), 3000);

		} catch (err) {
			console.error('❌ Error al guardar configuraciones:', err);
			setError('Error al guardar las configuraciones. Por favor, inténtalo de nuevo.');
		} finally {
			setSaving(false);
		}
	};

	const hasChanges = () => {
		return JSON.stringify(config) !== JSON.stringify(originalConfig);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<RefreshCw className="animate-spin h-8 w-8 text-primary-600 mr-3" />
				<span className="text-gray-600">Cargando configuraciones financieras...</span>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Encabezado */}
			<div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
				<div className="flex items-center gap-3 mb-4">
					<div className="p-2 bg-primary-100 rounded-lg">
						<DollarSign className="h-6 w-6 text-primary-600" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-gray-900">Configuraciones Financieras</h3>
						<p className="text-sm text-gray-600">
							Gestiona las comisiones de la plataforma y distribución de envíos
						</p>
					</div>
				</div>

				{/* Alertas */}
				{error && (
					<div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
						<div className="flex items-center">
							<AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
							<p className="text-red-700 text-sm">{error}</p>
						</div>
					</div>
				)}

				{success && (
					<div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
						<div className="flex items-center">
							<TrendingUp className="h-5 w-5 text-green-500 mr-2" />
							<p className="text-green-700 text-sm font-medium">{success}</p>
						</div>
					</div>
				)}

				{/* Formulario */}
				<div className="space-y-6">
					{/* Comisión de Plataforma */}
					<div>
						<label htmlFor="platform_commission_rate" className="flex items-center text-sm font-medium text-gray-700 mb-2">
							<Shield className="h-4 w-4 text-primary-600 mr-2" />
							Comisión de Plataforma (%)
						</label>
						<div className="relative">
							<input
								id="platform_commission_rate"
								type="text"
								value={config.platform_commission_rate}
								onChange={(e) => handleConfigChange('platform_commission_rate', e.target.value)}
								className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
								placeholder="10.0"
							/>
							<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
								<span className="text-gray-500 text-sm">%</span>
							</div>
						</div>
						<p className="mt-1 text-xs text-gray-500">
							Porcentaje que la plataforma retiene de cada venta (0% - 50%)
						</p>
					</div>

					{/* Envío Vendedor Único */}
					<div>
						<label htmlFor="shipping_seller_percentage" className="flex items-center text-sm font-medium text-gray-700 mb-2">
							<TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
							Envío Vendedor Único (%)
						</label>
						<div className="relative">
							<input
								id="shipping_seller_percentage"
								type="text"
								value={config.shipping_seller_percentage}
								onChange={(e) => handleConfigChange('shipping_seller_percentage', e.target.value)}
								className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
								placeholder="80.0"
							/>
							<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
								<span className="text-gray-500 text-sm">%</span>
							</div>
						</div>
						<p className="mt-1 text-xs text-gray-500">
							Porcentaje del envío que recibe el vendedor cuando es el único (0% - 100%)
						</p>
					</div>

					{/* Envío Máximo Múltiples Vendedores */}
					<div>
						<label htmlFor="shipping_max_seller_percentage" className="flex items-center text-sm font-medium text-gray-700 mb-2">
							<TrendingUp className="h-4 w-4 text-orange-600 mr-2" />
							Envío Máximo Múltiples Vendedores (%)
						</label>
						<div className="relative">
							<input
								id="shipping_max_seller_percentage"
								type="text"
								value={config.shipping_max_seller_percentage}
								onChange={(e) => handleConfigChange('shipping_max_seller_percentage', e.target.value)}
								className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
								placeholder="40.0"
							/>
							<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
								<span className="text-gray-500 text-sm">%</span>
							</div>
						</div>
						<p className="mt-1 text-xs text-gray-500">
							Porcentaje máximo del envío por vendedor con múltiples vendedores (0% - 100%)
						</p>
					</div>

					{/* Información de seguridad */}
					<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
						<div className="flex items-start gap-3">
							<AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
							<div className="text-sm text-amber-800">
								<p className="font-medium mb-2">⚠️ Configuraciones Críticas</p>
								<ul className="list-disc list-inside space-y-1 text-xs">
									<li>Estos cambios afectan todos los cálculos financieros de la plataforma</li>
									<li>Recomendamos hacer cambios gradualmente y monitorear los resultados</li>
								</ul>
							</div>
						</div>
					</div>
				</div>

				{/* Botones */}
				<div className="mt-6 flex justify-end space-x-3">
					<button
						type="button"
						onClick={() => setConfig(originalConfig)}
						disabled={!hasChanges() || saving}
						className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Cancelar
					</button>
					<button
						type="button"
						onClick={saveConfiguration}
						disabled={!hasChanges() || saving}
						className="px-6 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
					>
						{saving ? (
							<>
								<RefreshCw className="animate-spin h-4 w-4 mr-2" />
								Guardando...
							</>
						) : (
							<>
								<Save className="h-4 w-4 mr-2" />
								Guardar Cambios
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

export default FinancialConfiguration;