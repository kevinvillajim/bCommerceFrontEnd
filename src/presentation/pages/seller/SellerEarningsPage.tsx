import React, { useState, useEffect } from "react";
import {
	DollarSign,
	TrendingUp,
	Calendar,
	RefreshCw,
	Download,
	CreditCard,
	Wallet,
	BarChart2,
} from "lucide-react";
import { formatCurrency } from "../../../utils/formatters/formatCurrency";
import DashboardCardList from "@/presentation/components/dashboard/DashboardCardList";
import SellerEarningsService from "../../../infrastructure/services/SellerEarningsService";
import type { EarningsStats, MonthlyEarnings } from "../../../infrastructure/services/SellerEarningsService";

// Tipos locales (solo para la UI)

// Componente principal
const SellerEarningsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: ""
  });
  const [stats, setStats] = useState<EarningsStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyEarnings[]>([]);
  const [error, setError] = useState<string>("");
  const [exporting, setExporting] = useState<boolean>(false);

  // Cargar datos de ganancias
  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    setLoading(true);
    setError("");
    try {
      // Cargar datos principales de earnings
      const earningsData = await SellerEarningsService.getEarnings(
        dateRange.start ? { start_date: dateRange.start, end_date: dateRange.end } : undefined
      );

      // Cargar desglose mensual
      const monthlyBreakdown = await SellerEarningsService.getMonthlyBreakdown(
        dateRange.start ? { start_date: dateRange.start, end_date: dateRange.end } : undefined
      );

      setStats(earningsData);
      setMonthlyData(monthlyBreakdown);
    } catch (error: any) {
      console.error('Error loading earnings data:', error);
      setError(error.message || 'Error al cargar los datos de ganancias');
    } finally {
      setLoading(false);
    }
  };

  // Función para exportar PDF
  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const exportData = await SellerEarningsService.exportPdf(
        dateRange.start && dateRange.end
          ? { start_date: dateRange.start, end_date: dateRange.end }
          : undefined
      );

      // Descargar PDF directamente
      const blob = await SellerEarningsService.downloadPdf(exportData.file_path);

      // Crear enlace temporal para descarga automática
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = exportData.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpiar URL del blob
      URL.revokeObjectURL(link.href);

    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      setError(error.message || 'Error al exportar el reporte PDF');
    } finally {
      setExporting(false);
    }
  };
	

  // Renderiza un gráfico simple de barras para las ventas mensuales
  const renderSalesChart = (monthlySales: MonthlyEarnings[]) => {
		if (!monthlySales || monthlySales.length === 0) return null;

		const data = monthlySales;
		// Encontrar el valor máximo entre todas las métricas para escalar correctamente las barras
		const maxValue = Math.max(
			...data.map((item) => Math.max(item.sales, item.commissions, item.net))
		);

		return (
			<div className="mt-4">
				<div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
					<h3 className="text-lg font-medium text-gray-900">
						Ventas Mensuales
					</h3>
					<div className="mt-2 sm:mt-0 sm:ml-4 flex flex-wrap gap-3">
						<div className="flex items-center">
							<div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
							<span className="text-xs text-gray-500">
								Ventas
							</span>
						</div>
						<div className="flex items-center">
							<div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
							<span className="text-xs text-gray-500">
								Comisiones
							</span>
						</div>
						<div className="flex items-center">
							<div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
							<span className="text-xs text-gray-500">
								Ganancias netas
							</span>
						</div>
					</div>
				</div>

				<div className="h-64 w-full">
					{/* Etiquetas eje Y (valores) */}
					<div className="flex h-full">
						<div className="w-12 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
							<span>{formatCurrency(maxValue)}</span>
							<span>{formatCurrency(maxValue * 0.75)}</span>
							<span>{formatCurrency(maxValue * 0.5)}</span>
							<span>{formatCurrency(maxValue * 0.25)}</span>
							<span>{formatCurrency(0)}</span>
						</div>

						{/* Contenedor principal del gráfico */}
						<div className="flex-1 h-full">
							{/* Líneas de referencia horizontales */}
							<div className="h-full flex flex-col justify-between relative">
								<div className="border-t border-gray-200absolute top-0 w-full"></div>
								<div className="border-t border-gray-200absolute top-1/4 w-full"></div>
								<div className="border-t border-gray-200absolute top-2/4 w-full"></div>
								<div className="border-t border-gray-200absolute top-3/4 w-full"></div>
								<div className="border-t border-gray-200absolute bottom-0 w-full"></div>

								{/* Barras agrupadas */}
								<div className="absolute inset-0 flex items-end">
									{data.map((item, index) => {
										const salesHeight =
											maxValue > 0 ? (item.sales / maxValue) * 100 : 0;
										const commissionHeight =
											maxValue > 0 ? (item.commissions / maxValue) * 100 : 0;
										const netHeight =
											maxValue > 0 ? (item.net / maxValue) * 100 : 0;

										return (
											<div
												key={index}
												className="flex-1 flex justify-center h-full px-1"
											>
												<div className="w-full max-w-[30px] flex justify-between items-end h-full">
													{/* Barra de ventas */}
													<div
														className="w-2 bg-blue-500 rounded-t relative group cursor-pointer"
														style={{
															height: `${salesHeight}%`,
															minHeight: salesHeight > 0 ? "4px" : "0",
														}}
													>
														<div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
															Ventas: {formatCurrency(item.sales)}
														</div>
													</div>

													{/* Barra de comisiones */}
													<div
														className="w-2 bg-red-500 rounded-t relative group cursor-pointer"
														style={{
															height: `${commissionHeight}%`,
															minHeight: commissionHeight > 0 ? "4px" : "0",
														}}
													>
														<div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
															Comisiones: {formatCurrency(item.commissions)}
														</div>
													</div>

													{/* Barra de ganancias netas */}
													<div
														className="w-2 bg-green-500 rounded-t relative group cursor-pointer"
														style={{
															height: `${netHeight}%`,
															minHeight: netHeight > 0 ? "4px" : "0",
														}}
													>
														<div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
															Neto: {formatCurrency(item.net)}
														</div>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</div>

							{/* Etiquetas eje X (meses) */}
							<div className="flex mt-2">
								{data.map((item, index) => (
									<div key={index} className="flex-1 text-center">
										<div className="text-xs text-gray-500">
											{item.month_short}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	// Crear tarjetas de estadísticas basadas en datos reales
	const cards = stats ? [
		{
			title: "Total Ganancias",
			value: formatCurrency(stats.total_earnings),
			change: 0,
			icon: DollarSign,
			iconBgColor: "bg-green-50",
			iconColor: "text-green-600",
		},
		{
			title: "Ventas este período",
			value: formatCurrency(stats.sales_this_period),
			change: stats.sales_growth,
			text: `${Math.abs(stats.sales_growth)}% respecto al período anterior`,
			icon: TrendingUp,
			iconBgColor: "bg-blue-50",
			iconColor: "text-blue-600",
		},
		{
			title: "Comisiones este período",
			value: formatCurrency(stats.commissions_this_period),
			change: 0,
			text: `${stats.commissions_percentage}% de comisión`,
			icon: CreditCard,
			iconBgColor: "bg-red-50",
			iconColor: "text-red-600",
		},
		{
			title: "Ganancias netas este período",
			value: formatCurrency(stats.net_earnings_this_period),
			change: stats.earnings_growth,
			text: `${Math.abs(stats.earnings_growth)}% respecto al período anterior`,
			icon: Wallet,
			iconBgColor: "bg-indigo-50",
			iconColor: "text-indigo-600",
		},
	] : [];

  return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 flex items-center">
					<DollarSign className="w-6 h-6 mr-2" />
					Ganancias
				</h1>
				<div className="flex space-x-2">
					<button
						onClick={fetchEarningsData}
						className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
						disabled={loading}
					>
						<RefreshCw
							size={18}
							className={`mr-2 ${loading ? "animate-spin" : ""}`}
						/>
						{loading ? "Cargando..." : "Actualizar"}
					</button>
					<button
						onClick={handleExportPdf}
						disabled={exporting || loading}
						className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Download size={18} className={`mr-2 ${exporting ? 'animate-spin' : ''}`} />
						{exporting ? 'Exportando...' : 'Exportar PDF'}
					</button>
				</div>
			</div>

			{/* Filtros de fecha */}
			<div className="bg-white rounded-lg shadow-sm p-4">
				<div className="flex flex-col md:flex-row md:items-center gap-4">
					<div className="text-sm text-gray-700 font-medium">
						Rango de fechas:
					</div>
					<div className="flex items-center space-x-2">
						<Calendar className="h-5 w-5 text-gray-500" />
						<input
							type="date"
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={dateRange.start}
							onChange={(e) =>
								setDateRange((prev) => ({...prev, start: e.target.value}))
							}
						/>
						<span className="text-gray-500">a</span>
						<input
							type="date"
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={dateRange.end}
							onChange={(e) =>
								setDateRange((prev) => ({...prev, end: e.target.value}))
							}
						/>
					</div>
					<button
						className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
						onClick={fetchEarningsData}
						disabled={loading}
					>
						{loading ? "Aplicando..." : "Aplicar"}
					</button>
				</div>
			</div>

			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<div className="flex">
						<div className="ml-3">
							<h3 className="text-sm font-medium text-red-800">
								Error al cargar datos
							</h3>
							<div className="mt-2 text-sm text-red-700">
								{error}
							</div>
							<div className="mt-4">
								<button
									onClick={fetchEarningsData}
									className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
								>
									Reintentar
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{loading ? (
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
				</div>
			) : stats && !error ? (
				<>
					{/* Tarjetas de estadísticas principales */}
					<DashboardCardList cards={cards} />

					{/* Gráfico de ventas mensuales */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-lg font-medium text-gray-900 flex items-center">
								<BarChart2 size={20} className="mr-2" />
								Ventas por Período
							</h2>
							<div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
								{dateRange.start && dateRange.end ? 'Período personalizado' : 'Últimos 12 meses'}
							</div>
						</div>
						{renderSalesChart(monthlyData)}
					</div>


					{/* Tabla de ventas mensuales */}
					<div className="bg-white rounded-lg shadow-sm overflow-hidden">
						<div className="px-6 py-4 border-b border-gray-200">
							<h2 className="text-lg font-medium text-gray-900">
								Desglose de Ventas Mensuales
							</h2>
						</div>
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Mes
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Ventas
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Comisiones
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Neto
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Órdenes
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{monthlyData.map((month, index) => (
										<tr
											key={index}
											className="hover:bg-gray-50"
										>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
												{month.month}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{formatCurrency(month.sales)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
												{formatCurrency(month.commissions)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
												{formatCurrency(month.net)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{month.orders_count}
											</td>
										</tr>
									))}
								</tbody>
								<tfoot className="bg-gray-50">
									<tr>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											Total
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{formatCurrency(
												monthlyData.reduce(
													(sum, month) => sum + month.sales,
													0
												)
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
											{formatCurrency(
												monthlyData.reduce(
													(sum, month) => sum + month.commissions,
													0
												)
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
											{formatCurrency(
												monthlyData.reduce(
													(sum, month) => sum + month.net,
													0
												)
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{monthlyData.reduce(
												(sum, month) => sum + month.orders_count,
												0
											)}
										</td>
									</tr>
								</tfoot>
							</table>
						</div>
					</div>
				</>
			) : (
				<div className="text-center py-12">
					<p className="text-gray-500">
						No se pudieron cargar los datos de ganancias.
					</p>
					<button
						onClick={fetchEarningsData}
						className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
					>
						Reintentar
					</button>
				</div>
			)}
		</div>
	);
};

export default SellerEarningsPage;