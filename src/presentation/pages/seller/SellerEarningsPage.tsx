import React, { useState, useEffect } from "react";
import {
	DollarSign,
	TrendingUp,
	Calendar,
	RefreshCw,
	Download,
	CreditCard,
	ArrowRight,
	Wallet,
	PieChart,

	BarChart2,
} from "lucide-react";
import { formatCurrency } from "../../../utils/formatters/formatCurrency";
import DashboardCardList from "@/presentation/components/dashboard/DashboardCardList";

// Tipos
interface PaymentMethod {
  method: string;
  amount: number;
  percentage: number;
  color: string;
}

interface MonthlySales {
	month: string;
	sales: number;
	commissions: number;
	net: number;
}

interface CategorySales {
	category: string;
	amount: number;
	percentage: number;
	color: string;
}

interface PendingPayment {
  id: string;
  date: string;
  amount: number;
  status: "processing" | "scheduled";
  estimatedArrival?: string;
}

interface EarningsStats {
  totalEarnings: number;
  pendingPayments: number;
  salesThisMonth: number;
  salesGrowth: number;
  commissionsThisMonth: number;
  commissionsPercentage: number;
  netEarningsThisMonth: number;
  earningsGrowth: number;
  paymentMethods: PaymentMethod[];
  monthlySales: MonthlySales[];
  categorySales: CategorySales[];
  pendingPaymentsList: PendingPayment[];
}

// Componente principal
const SellerEarningsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: ""
  });
  const [stats, setStats] = useState<EarningsStats | null>(null);
  const [selectedChart, setSelectedChart] = useState<"sales" | "categories">("sales");

  // Cargar datos de ganancias (simulando una llamada a API)
  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = () => {
    setLoading(true);
    // Simulación de carga desde API
    setTimeout(() => {
      // Datos de ejemplo
	  const mockStats: EarningsStats = {
		totalEarnings: 12580.45,
		pendingPayments: 1458.32,
		salesThisMonth: 3450.8,
		salesGrowth: 12.5,
		commissionsThisMonth: 517.62,
		commissionsPercentage: 15,
		netEarningsThisMonth: 2933.18,
		earningsGrowth: 8.2,
		paymentMethods: [
		  { method: "Tarjeta de Crédito", amount: 7548.27, percentage: 60, color: "bg-blue-500" },
		  { method: "Transferencia", amount: 2516.09, percentage: 20, color: "bg-green-500" },
		  { method: "PayPal", amount: 1887.07, percentage: 15, color: "bg-indigo-500" },
		  { method: "Otros", amount: 629.02, percentage: 5, color: "bg-gray-500" }
		],
        monthlySales: [
          { month: "Enero", sales: 1850.50, commissions: 277.58, net: 1572.92 },
          { month: "Febrero", sales: 2105.30, commissions: 315.80, net: 1789.50 },
          { month: "Marzo", sales: 2300.75, commissions: 345.11, net: 1955.64 },
          { month: "Abril", sales: 2150.40, commissions: 322.56, net: 1827.84 },
          { month: "Mayo", sales: 2485.60, commissions: 372.84, net: 2112.76 },
          { month: "Junio", sales: 2890.25, commissions: 433.54, net: 2456.71 },
          { month: "Julio", sales: 3120.80, commissions: 468.12, net: 2652.68 },
          { month: "Agosto", sales: 3250.45, commissions: 487.57, net: 2762.88 },
          { month: "Septiembre", sales: 3125.30, commissions: 468.80, net: 2656.50 },
          { month: "Octubre", sales: 3450.80, commissions: 517.62, net: 2933.18 },
          { month: "Noviembre", sales: 0, commissions: 0, net: 0 },
          { month: "Diciembre", sales: 0, commissions: 0, net: 0 }
        ],
        categorySales: [
          { category: "Electrónica", amount: 4650.25, percentage: 37, color: "bg-blue-500" },
          { category: "Accesorios", amount: 3145.11, percentage: 25, color: "bg-green-500" },
          { category: "Moda", amount: 2516.09, percentage: 20, color: "bg-yellow-500" },
          { category: "Hogar", amount: 1258.05, percentage: 10, color: "bg-red-500" },
          { category: "Otros", amount: 1010.95, percentage: 8, color: "bg-purple-500" }
        ],
        pendingPaymentsList: [
          {
            id: "PAY-2023-001",
            date: "2023-11-05",
            amount: 958.32,
            status: "processing"
          },
          {
            id: "PAY-2023-002",
            date: "2023-11-10",
            amount: 500.00,
            status: "scheduled",
            estimatedArrival: "2023-11-15"
          }
        ]
      };

      setStats(mockStats);
      setLoading(false);
    }, 800);
	};
	

  // Renderiza un gráfico simple de barras para las ventas mensuales
  const renderSalesChart = (monthlySales: MonthlySales[]) => {
		if (!monthlySales || monthlySales.length === 0) return null;

		const data = monthlySales;
		// Encontrar el valor máximo para escalar correctamente las barras
		const maxSales = Math.max(...data.map((item) => item.sales));

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
							<span>{formatCurrency(maxSales)}</span>
							<span>{formatCurrency(maxSales * 0.75)}</span>
							<span>{formatCurrency(maxSales * 0.5)}</span>
							<span>{formatCurrency(maxSales * 0.25)}</span>
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
											maxSales > 0 ? (item.sales / maxSales) * 100 : 0;
										const commissionHeight =
											maxSales > 0 ? (item.commissions / maxSales) * 100 : 0;
										const netHeight =
											maxSales > 0 ? (item.net / maxSales) * 100 : 0;

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
											{item.month.substring(0, 3)}
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
  // Renderiza un gráfico circular para las categorías
  const renderCategoryChart = (categorySales: CategorySales[]) => {
		if (!categorySales || categorySales.length === 0) return null;

		return (
			<div className="mt-4">
				<h3 className="text-lg font-medium text-gray-900 mb-4">
					Ventas por Categoría
				</h3>
				<div className="flex flex-col md:flex-row">
					<div className="md:w-1/2 flex justify-center items-center">
						<div className="relative w-48 h-48 md:w-56 md:h-56">
							{/* Gráfico circular usando SVG */}
							<svg viewBox="0 0 100 100" className="w-full h-full">
								{/* Círculo de fondo */}
								<circle
									cx="50"
									cy="50"
									r="40"
									fill="#f3f4f6"
									className=""
								/>

								{/* Renderizamos cada segmento del círculo */}
								{categorySales.map((item, index) => {
									// Calculamos los ángulos inicial y final basados en porcentajes acumulados
									const previousSections = categorySales
										.slice(0, index)
										.reduce((sum, curr) => sum + curr.percentage, 0);

									const startAngle = (previousSections / 100) * 360;
									const endAngle = startAngle + (item.percentage / 100) * 360;

									// Convertimos grados a radianes
									const startRad = ((startAngle - 90) * Math.PI) / 180;
									const endRad = ((endAngle - 90) * Math.PI) / 180;

									// Calculamos las coordenadas de inicio y fin del arco
									const x1 = 50 + 40 * Math.cos(startRad);
									const y1 = 50 + 40 * Math.sin(startRad);
									const x2 = 50 + 40 * Math.cos(endRad);
									const y2 = 50 + 40 * Math.sin(endRad);

									// Determinamos si el arco debe ser mayor a 180 grados
									const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

									// Construimos el path del segmento
									const path = [
										`M 50 50`,
										`L ${x1} ${y1}`,
										`A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
										"Z",
									].join(" ");

									// Mapeamos colores de clases a colores SVG
									const colorMap: {[key: string]: string} = {
										"bg-blue-500": "#3b82f6",
										"bg-green-500": "#10b981",
										"bg-yellow-500": "#f59e0b",
										"bg-red-500": "#ef4444",
										"bg-purple-500": "#8b5cf6",
										"bg-indigo-500": "#6366f1",
										"bg-pink-500": "#ec4899",
										"bg-gray-500": "#6b7280",
									};

									const fillColor = colorMap[item.color] || "#6b7280";

									return (
										<g key={index} className="cursor-pointer">
											<path
												d={path}
												fill={fillColor}
												className="hover:opacity-80 transition-opacity"
												// onMouseOver={(e) => {
												// 	// Si quieres añadir interactividad como destacar al pasar el mouse
												// }}
											/>
											{/* Tooltip svg nativo */}
											<title>
												{item.category}: {item.percentage}% (
												{formatCurrency(item.amount)})
											</title>
										</g>
									);
								})}

								{/* Circulo central opcional para hacer un donut chart */}
								{/* <circle cx="50" cy="50" r="25" fill="white" className="" /> */}
							</svg>
						</div>
					</div>

					{/* Leyenda */}
					<div className="md:w-1/2 mt-4 md:mt-0">
						<div className="space-y-3">
							{categorySales.map((item, index) => (
								<div key={index} className="flex items-center group">
									<div
										className={`w-4 h-4 ${item.color} rounded-sm mr-2`}
									></div>
									<span className="text-sm text-gray-700 flex-1">
										{item.category}
									</span>
									<span className="text-sm font-medium text-gray-900">
										{formatCurrency(item.amount)}
									</span>
									<span className="text-xs text-gray-500 ml-2 w-12 text-right">
										({item.percentage}%)
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	};

	const statsE =
	{
		totalEarnings: 12580.45,
		pendingPayments: 1458.32,
		salesThisMonth: 3450.8,
		salesGrowth: 12.5,
		commissionsThisMonth: 517.62,
		commissionsPercentage: 15, // 15% de comisión
		netEarningsThisMonth: 2933.18,
		earningsGrowth: 8.2,
	};
	

	const cards = [
		{
			title: "Total Ganancias",
			value: formatCurrency(statsE.totalEarnings),
			change: 0,
			icon: DollarSign,
			iconBgColor: "bg-green-50",
			iconColor: "text-green-600",
		},
		{
			title: "Ventas este mes",
			value: formatCurrency(statsE.salesThisMonth),
			change: statsE.salesGrowth,
			text: `${Math.abs(statsE.salesGrowth)}% respecto al mes anterior`,
			icon: TrendingUp,
			iconBgColor: "bg-blue-50",
			iconColor: "text-blue-600",
		},
		{
			title: "Comisiones este mes",
			value: formatCurrency(statsE.commissionsThisMonth),
			change: 0,
			text: `${statsE.commissionsPercentage}% de comisión`,
			icon: CreditCard,
			iconBgColor: "bg-red-50",
			iconColor: "text-red-600",
		},
		{
			title: "Ganancias netas este mes",
			value: formatCurrency(statsE.netEarningsThisMonth),
			change: statsE.earningsGrowth,
			text: `${Math.abs(statsE.earningsGrowth)}% respecto al mes anterior`,
			icon: Wallet,
			iconBgColor: "bg-indigo-50",
			iconColor: "text-indigo-600",
		},
	];

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
						onClick={() => alert("Descargando reporte de ganancias...")}
						className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
					>
						<Download size={18} className="mr-2" />
						Exportar
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
						onClick={() =>
							console.log("Aplicando filtro de fechas:", dateRange)
						}
					>
						Aplicar
					</button>
				</div>
			</div>

			{loading ? (
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
				</div>
			) : stats ? (
				<>
					{/* Tarjetas de estadísticas principales */}
					<DashboardCardList cards={cards} />

					{/* Contenedor principal con gráficos y pagos */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Sección de gráficos */}
						<div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-lg font-medium text-gray-900">
									Análisis de Ventas
								</h2>
								<div className="flex border border-gray-300 rounded-lg overflow-hidden">
									<button
										className={`px-3 py-1 text-sm ${selectedChart === "sales" ? "bg-primary-600 text-white" : "bg-white text-gray-700"}`}
										onClick={() => setSelectedChart("sales")}
									>
										<BarChart2 size={16} className="inline mr-1" />
										Ventas mensuales
									</button>
									<button
										className={`px-3 py-1 text-sm ${selectedChart === "categories" ? "bg-primary-600 text-white" : "bg-white text-gray-700"}`}
										onClick={() => setSelectedChart("categories")}
									>
										<PieChart size={16} className="inline mr-1" />
										Categorías
									</button>
								</div>
							</div>

							{/* Contenido del gráfico seleccionado */}
							{selectedChart === "sales"
								? renderSalesChart(stats.monthlySales)
								: renderCategoryChart(stats.categorySales)}
						</div>

						{/* Sección de pagos pendientes */}
						<div className="bg-white rounded-lg shadow-sm p-6">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-lg font-medium text-gray-900 flex items-center">
									<CreditCard className="w-5 h-5 mr-2" />
									Pagos Pendientes
								</h2>
								<span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
									{formatCurrency(stats.pendingPayments)}
								</span>
							</div>

							{stats.pendingPaymentsList.length > 0 ? (
								<div className="space-y-4">
									{stats.pendingPaymentsList.map((payment, index) => (
										<div
											key={index}
											className="border border-gray-200rounded-lg p-4"
										>
											<div className="flex justify-between mb-2">
												<span className="text-sm font-medium text-gray-900">
													{payment.id}
												</span>
												<span
													className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
														payment.status === "processing"
															? "bg-amber-100 text-amber-800"
															: "bg-green-100 text-green-800"
													}`}
												>
													{payment.status === "processing"
														? "En proceso"
														: "Programado"}
												</span>
											</div>
											<div className="flex justify-between text-sm text-gray-500 mb-2">
												<span>Fecha:</span>
												<span>{payment.date}</span>
											</div>
											{payment.estimatedArrival && (
												<div className="flex justify-between text-sm text-gray-500 mb-2">
													<span>Llegada estimada:</span>
													<span>{payment.estimatedArrival}</span>
												</div>
											)}
											<div className="flex justify-between items-center mt-3">
												<span className="text-sm font-bold text-gray-900">
													{formatCurrency(payment.amount)}
												</span>
												<a
													href="#"
													className="text-primary-600 text-sm hover:underline flex items-center"
												>
													Detalles
													<ArrowRight size={14} className="ml-1" />
												</a>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8">
									<p className="text-gray-500">
										No hay pagos pendientes
									</p>
								</div>
							)}

							<div className="mt-6">
								<h3 className="text-md font-medium text-gray-900 mb-3">
									Métodos de Pago Recibidos
								</h3>
								<div className="space-y-2">
									{stats.paymentMethods.map((method, index) => (
										<div key={index}>
											<div className="flex justify-between text-sm">
												<span className="text-gray-600">
													{method.method}
												</span>
												<span className="text-gray-900 font-medium">
													{formatCurrency(method.amount)}
												</span>
											</div>
											<div className="w-full bg-gray-200 rounded-full h-2 mt-1">
												<div
													className={`${method.color} h-2 rounded-full`}
													style={{width: `${method.percentage}%`}}
												></div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Tabla de ventas mensuales */}
					<div className="bg-white rounded-lg shadow-sm overflow-hidden">
						<div className="px-6 py-4 border-b border-gray-200aaborder-gray-700">
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
											Comisiones
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Neto
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{stats.monthlySales.map((month, index) => (
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
												stats.monthlySales.reduce(
													(sum, month) => sum + month.sales,
													0
												)
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
											{formatCurrency(
												stats.monthlySales.reduce(
													(sum, month) => sum + month.commissions,
													0
												)
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
											{formatCurrency(
												stats.monthlySales.reduce(
													(sum, month) => sum + month.net,
													0
												)
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