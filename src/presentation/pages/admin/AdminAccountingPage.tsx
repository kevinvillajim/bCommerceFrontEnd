import React, {useState, useEffect} from "react";
import {
	DollarSign,
	Filter,
	BarChart2,
	X,
	Plus,
	Save,
	Archive,
	Eye,
	RefreshCw,
	Trash2,
	Edit2,
} from "lucide-react";
import Table from "../../components/dashboard/Table";
import type {
	AccountingTransaction,
	AccountingAccount,
	AccountingEntryCreationData,
} from "../../../core/domain/entities/Accounting";
import DashboardCardList from "../../components/dashboard/DashboardCardList";
import AccountingService, {
	type AccountingMetrics,
} from "../../../infrastructure/services/AccountingService";



/**
 * Página de administración de contabilidad
 * Muestra transacciones contables y resumen financiero
 */
const AdminAccountingPage: React.FC = () => {
	// ✅ CORREGIDO: AccountingService ahora es estático, no necesita instancia

	// Estados para las diferentes secciones
	const [activeTab, setActiveTab] = useState<
		"transactions" | "accounts" | "reports"
	>("transactions");
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	// ✅ Estados para datos reales de la API
	const [transactions, setTransactions] = useState<AccountingTransaction[]>([]);
	const [accounts, setAccounts] = useState<AccountingAccount[]>([]);
	const [metrics, setMetrics] = useState<AccountingMetrics | null>(null);
	const [paginationData, setPaginationData] = useState<{
		current_page: number;
		last_page: number;
		total: number;
		per_page: number;
	}>({
		current_page: 1,
		last_page: 1,
		total: 0,
		per_page: 15
	});

	// Estados para modales
	const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] =
		useState<boolean>(false);
	const [isNewAccountModalOpen, setIsNewAccountModalOpen] =
		useState<boolean>(false);
	const [isTransactionDetailModalOpen, setIsTransactionDetailModalOpen] =
		useState<boolean>(false);
	const [isAccountDetailModalOpen, setIsAccountDetailModalOpen] =
		useState<boolean>(false);
	const [selectedTransaction, setSelectedTransaction] =
		useState<AccountingTransaction | null>(null);
	const [selectedAccount, setSelectedAccount] =
		useState<AccountingAccount | null>(null);
	const [editingTransaction, setEditingTransaction] =
		useState<AccountingTransaction | null>(null);

	// Estados para formulario de nueva transacción
	const [newTransaction, setNewTransaction] = useState<{
		referenceNumber: string;
		transactionDate: string;
		description: string;
		type: string;
		entries: AccountingEntryCreationData[];
	}>({
		referenceNumber: "",
		transactionDate: new Date().toISOString().split("T")[0],
		description: "",
		type: "Venta",
		entries: [
			{account_id: 0, debit_amount: 0, credit_amount: 0, notes: ""},
			{account_id: 0, debit_amount: 0, credit_amount: 0, notes: ""},
		],
	});

	// Estados para formulario de nueva cuenta
	const [newAccount, setNewAccount] = useState<{
		code: string;
		name: string;
		type: string;
		description: string;
		isActive: boolean;
	}>({
		code: "",
		name: "",
		type: "Activo",
		description: "",
		isActive: true,
	});

	// Obtener fechas para el rango por defecto (1 mes atrás hasta hoy)
	const oneMonthAgo = new Date();
	oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
	const today = new Date();

	const [dateRange, setDateRange] = useState<{from: string; to: string}>({
		from: oneMonthAgo.toISOString().split("T")[0],
		to: today.toISOString().split("T")[0],
	});
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [filterType, setFilterType] = useState<string>("all");

	// ✅ NUEVA LÓGICA: Cargar datos reales desde la API
	const loadData = async () => {
		setLoading(true);
		setError(null);

		try {
			// ✅ CORREGIDO: Usar métodos estáticos de AccountingService
			const [metricsResponse, transactionsResponse, accountsResponse] = await Promise.all([
				AccountingService.getMetrics(dateRange.from, dateRange.to),
				AccountingService.getTransactions({
					start_date: dateRange.from,
					end_date: dateRange.to,
					type: filterType === "all" ? undefined : filterType,
					page: currentPage,
					per_page: paginationData.per_page
				}),
				AccountingService.getAccounts()
			]);

			setMetrics(metricsResponse);
			setTransactions(transactionsResponse.data);
			setPaginationData({
				current_page: transactionsResponse.current_page,
				last_page: transactionsResponse.last_page,
				total: transactionsResponse.total,
				per_page: transactionsResponse.per_page
			});
			setAccounts(accountsResponse);

		} catch (err: any) {
			console.error('Error cargando datos de contabilidad:', err);
			setError(err.message || 'Error al cargar los datos');
		} finally {
			setLoading(false);
		}
	};

	// ✅ Cargar datos al montar el componente y cuando cambien los filtros
	useEffect(() => {
		loadData();
	}, [currentPage, filterType, dateRange.from, dateRange.to]);

	// Función para abrir el modal de detalle de transacción
	const openTransactionDetail = (transaction: AccountingTransaction) => {
		setSelectedTransaction(transaction);
		setIsTransactionDetailModalOpen(true);
	};

	// Función para abrir el modal de detalle de cuenta
	const openAccountDetail = (account: AccountingAccount) => {
		setSelectedAccount(account);
		setIsAccountDetailModalOpen(true);
	};

	// Función para manejar cambios en el formulario de nueva transacción
	const handleTransactionChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const {name, value} = e.target;
		setNewTransaction({
			...newTransaction,
			[name]: value,
		});
	};

	// Función para manejar cambios en las entradas de la transacción
	const handleEntryChange = (
		index: number,
		field: keyof AccountingEntryCreationData,
		value: any
	) => {
		const updatedEntries = [...newTransaction.entries];

		// Convertir valores según el tipo de campo
		let convertedValue;
		if (field === "account_id") {
			convertedValue = Number(value);
		} else if (field === "debit_amount" || field === "credit_amount") {
			convertedValue = parseFloat(value) || 0;
		} else {
			// Para 'notes' y otros campos string
			convertedValue = value;
		}

		updatedEntries[index] = {
			...updatedEntries[index],
			[field]: convertedValue,
		};
		setNewTransaction({
			...newTransaction,
			entries: updatedEntries,
		});
	};

	// Función para añadir una nueva entrada a la transacción
	const addTransactionEntry = () => {
		setNewTransaction({
			...newTransaction,
			entries: [
				...newTransaction.entries,
				{account_id: 0, debit_amount: 0, credit_amount: 0, notes: ""},
			],
		});
	};

	// Función para eliminar una entrada de la transacción
	const removeTransactionEntry = (index: number) => {
		if (newTransaction.entries.length <= 2) {
			alert("Una transacción debe tener al menos dos entradas");
			return;
		}

		const updatedEntries = newTransaction.entries.filter((_, i) => i !== index);
		setNewTransaction({
			...newTransaction,
			entries: updatedEntries,
		});
	};

	// Función para manejar cambios en el formulario de nueva cuenta
	const handleAccountChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const {name, value, type} = e.target;
		const updatedValue =
			type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

		setNewAccount({
			...newAccount,
			[name]: updatedValue,
		});
	};

	// ✅ ACTUALIZADA: Función para guardar la nueva transacción usando API real
	const saveTransaction = async () => {
		try {
			setLoading(true);

			// ✅ CORREGIDO: Validar usando métodos estáticos
			const validation = AccountingService.validateTransactionBalance(newTransaction.entries);

			if (!validation.isBalanced) {
				alert(
					`Los totales de débito (${validation.totalDebits.toFixed(2)}) y crédito (${validation.totalCredits.toFixed(2)}) deben ser iguales`
				);
				return;
			}

			const transactionData = {
				reference_number: newTransaction.referenceNumber,
				transaction_date: newTransaction.transactionDate,
				description: newTransaction.description,
				type: newTransaction.type,
				entries: newTransaction.entries
			};

			let result;
			let successMessage;

			if (editingTransaction) {
				// Actualizar transacción existente
				result = await AccountingService.updateTransaction(editingTransaction.id!, transactionData);
				successMessage = 'Transacción actualizada exitosamente';
				console.log('Transacción actualizada exitosamente:', result);
			} else {
				// Crear nueva transacción
				result = await AccountingService.createTransaction(transactionData);
				successMessage = 'Transacción creada exitosamente';
				console.log('Transacción creada exitosamente:', result);
			}

			// Recargar datos para mostrar los cambios
			await loadData();

			// Cerrar modal y reiniciar formulario
			closeTransactionModal();

			alert(successMessage);

		} catch (error: any) {
			console.error('Error guardando transacción:', error);
			alert(`Error al guardar la transacción: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	// ✅ ACTUALIZADA: Función para guardar la nueva cuenta usando API real
	const saveAccount = async () => {
		try {
			setLoading(true);

			// ✅ CORREGIDO: Usar métodos estáticos
			const createdAccount = await AccountingService.createAccount({
				code: newAccount.code,
				name: newAccount.name,
				type: newAccount.type as any,
				description: newAccount.description,
				is_active: newAccount.isActive
			});

			console.log('Cuenta creada exitosamente:', createdAccount);

			// Recargar las cuentas para mostrar la nueva
			const updatedAccounts = await AccountingService.getAccounts();
			setAccounts(updatedAccounts);

			// Cerrar modal y reiniciar formulario
			setIsNewAccountModalOpen(false);
			setNewAccount({
				code: "",
				name: "",
				type: "Activo",
				description: "",
				isActive: true,
			});

			alert('Cuenta creada exitosamente');

		} catch (error: any) {
			console.error('Error guardando cuenta:', error);
			alert(`Error al guardar la cuenta: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	// ✅ NUEVA FUNCIÓN: Contabilizar una transacción
	const postTransaction = async (transaction: AccountingTransaction) => {
		if (!transaction.id) {
			alert('Error: ID de transacción no válido');
			return;
		}

		if (!confirm('¿Estás seguro de que deseas contabilizar esta transacción? Esta acción no se puede deshacer.')) {
			return;
		}

		setLoading(true);
		try {
			await AccountingService.postTransaction(transaction.id);
			alert('Transacción contabilizada exitosamente');
			await loadData(); // Recargar datos
		} catch (error: any) {
			console.error('Error contabilizando transacción:', error);
			alert(`Error al contabilizar la transacción: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	// ✅ NUEVA FUNCIÓN: Eliminar una transacción (para ajustes/devoluciones)
	const deleteTransaction = async (transaction: AccountingTransaction) => {
		if (!transaction.id) {
			alert('Error: ID de transacción no válido');
			return;
		}

		if (transaction.is_posted) {
			alert('No se puede eliminar una transacción que ya está contabilizada');
			return;
		}

		if (!confirm(`¿Estás seguro de que deseas eliminar la transacción ${transaction.reference_number}? Esta acción no se puede deshacer.`)) {
			return;
		}

		setLoading(true);
		try {
			await AccountingService.deleteTransaction(transaction.id);
			alert('Transacción eliminada exitosamente');
			await loadData(); // Recargar datos
		} catch (error: any) {
			console.error('Error eliminando transacción:', error);
			alert(`Error al eliminar la transacción: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	// ✅ NUEVA FUNCIÓN: Editar una transacción existente
	const editTransaction = (transaction: AccountingTransaction) => {
		if (transaction.is_posted) {
			alert('No se puede editar una transacción que ya está contabilizada');
			return;
		}

		// Cargar datos de la transacción en el formulario
		setNewTransaction({
			referenceNumber: transaction.reference_number,
			transactionDate: transaction.transaction_date,
			description: transaction.description,
			type: transaction.type,
			entries: transaction.entries.map(entry => ({
				account_id: entry.account_id,
				debit_amount: entry.debit_amount.toString(),
				credit_amount: entry.credit_amount.toString(),
				notes: entry.notes || '',
			})),
		});

		// Configurar como edición
		setEditingTransaction(transaction);
		setIsNewTransactionModalOpen(true);
	};

	// ✅ NUEVA FUNCIÓN: Cerrar modal de transacción y limpiar estado
	const closeTransactionModal = () => {
		setIsNewTransactionModalOpen(false);
		setEditingTransaction(null);
		setNewTransaction({
			referenceNumber: "",
			transactionDate: new Date().toISOString().split("T")[0],
			description: "",
			type: "Venta",
			entries: [
				{account_id: 0, debit_amount: 0, credit_amount: 0, notes: ""},
				{account_id: 0, debit_amount: 0, credit_amount: 0, notes: ""},
			],
		});
	};

	// Columnas para la tabla de transacciones
	const transactionColumns = [
		{
			key: "reference_number",
			header: "Referencia",
			render: (transaction: AccountingTransaction) => (
				<span className="font-medium text-primary-600">
					{transaction.reference_number}
				</span>
			),
			sortable: true,
		},
		{
			key: "transaction_date",
			header: "Fecha",
			render: (transaction: AccountingTransaction) => (
				<span>
					{new Date(transaction.transaction_date).toLocaleDateString("es-ES")}
				</span>
			),
			sortable: true,
		},
		{
			key: "description",
			header: "Descripción",
			sortable: true,
		},
		{
			key: "type",
			header: "Tipo",
			render: (transaction: AccountingTransaction) => {
				// Mapeo simple de tipos según la base de datos
				const typeLabels: Record<string, string> = {
					'SALE': 'Venta',
					'EXPENSE': 'Gasto',
					'ADJUSTMENT': 'Ajuste',
					'TRANSFER': 'Transferencia'
				};

				// Obtener el texto a mostrar - manejar strings vacíos
				const displayText = typeLabels[transaction.type] || (transaction.type && transaction.type.trim() !== '' ? transaction.type : 'Sin tipo');

				// Determinar color basado en el tipo
				let colorClass = "bg-gray-100 text-gray-800"; // por defecto
				if (transaction.type === "SALE") {
					colorClass = "bg-green-100 text-green-800";
				} else if (transaction.type === "EXPENSE") {
					colorClass = "bg-red-100 text-red-800";
				} else if (transaction.type === "ADJUSTMENT") {
					colorClass = "bg-yellow-100 text-yellow-800";
				} else if (transaction.type === "TRANSFER") {
					colorClass = "bg-purple-100 text-purple-800";
				}

				return (
					<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
						{displayText}
					</span>
				);
			},
			sortable: true,
		},
		{
			key: "is_posted",
			header: "Estado",
			render: (transaction: AccountingTransaction) => (
				<span
					className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${transaction.is_posted ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
				>
					{transaction.is_posted ? "Contabilizado" : "Pendiente"}
				</span>
			),
			sortable: true,
		},
		{
			key: "actions",
			header: "Acciones",
			render: (transaction: AccountingTransaction) => (
				<div className="flex space-x-2">
					<button
						onClick={() => openTransactionDetail(transaction)}
						className="text-primary-600 hover:text-primary-900"
						title="Ver detalles"
					>
						<Eye size={16} />
					</button>
					{!transaction.is_posted && (
						<button
							onClick={() => editTransaction(transaction)}
							className="text-blue-600 hover:text-blue-900"
							title="Editar transacción"
							disabled={loading}
						>
							<Edit2 size={16} />
						</button>
					)}
					{!transaction.is_posted && (
						<button
							onClick={() => postTransaction(transaction)}
							className="text-green-600 hover:text-green-900"
							title="Contabilizar"
							disabled={loading}
						>
							<Archive size={16} />
						</button>
					)}
					{!transaction.is_posted && (
						<button
							onClick={() => deleteTransaction(transaction)}
							className="text-red-600 hover:text-red-900"
							title="Eliminar transacción"
							disabled={loading}
						>
							<Trash2 size={16} />
						</button>
					)}
				</div>
			),
		},
	];

	// Columnas para la tabla de cuentas
	const accountColumns = [
		{
			key: "code",
			header: "Código",
			render: (account: AccountingAccount) => (
				<span className="font-medium text-primary-600">
					{account.code}
				</span>
			),
			sortable: true,
		},
		{
			key: "name",
			header: "Nombre",
			sortable: true,
		},
		{
			key: "type",
			header: "Tipo",
			render: (account: AccountingAccount) => {
				// Mapeo de tipos de cuentas contables
				const accountTypeLabels: Record<string, string> = {
					'ASSET': 'Activo',
					'LIABILITY': 'Pasivo',
					'EQUITY': 'Patrimonio',
					'REVENUE': 'Ingreso',
					'EXPENSE': 'Gasto'
				};

				// Obtener el texto a mostrar
				const displayText = accountTypeLabels[account.type] || (account.type && account.type.trim() !== '' ? account.type : 'Sin tipo');

				// Determinar color basado en el tipo
				let colorClass = "bg-gray-100 text-gray-800"; // por defecto
				if (account.type === "ASSET") {
					colorClass = "bg-blue-100 text-blue-800";
				} else if (account.type === "LIABILITY") {
					colorClass = "bg-yellow-100 text-yellow-800";
				} else if (account.type === "EQUITY") {
					colorClass = "bg-purple-100 text-purple-800";
				} else if (account.type === "REVENUE") {
					colorClass = "bg-green-100 text-green-800";
				} else if (account.type === "EXPENSE") {
					colorClass = "bg-red-100 text-red-800";
				}

				return (
					<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
						{displayText}
					</span>
				);
			},
			sortable: true,
		},
		{
			key: "balance",
			header: "Saldo",
			render: (account: AccountingAccount) => {
				// Verificar si balance existe y proporcionar un valor predeterminado
				const balance = account.balance ?? 0;
				return (
					<span
						className={`font-medium ${balance >= 0 ? "text-green-600" : "text-red-600"}`}
					>
						{formatCurrency(balance)}
					</span>
				);
			},
			sortable: true,
		},
		{
			key: "is_active",
			header: "Estado",
			render: (account: AccountingAccount) => (
				<span
					className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${account.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
				>
					{account.is_active ? "Activa" : "Inactiva"}
				</span>
			),
			sortable: true,
		},
		{
			key: "actions",
			header: "Acciones",
			render: (account: AccountingAccount) => (
				<div className="flex space-x-2">
					<button
						onClick={() => openAccountDetail(account)}
						className="text-primary-600 hover:text-primary-900"
						title="Ver detalles"
					>
						<Eye size={16} />
					</button>
				</div>
			),
		},
	];

	// ✅ ACTUALIZADA: Función para refrescar datos
	const refreshData = () => {
		loadData();
	};

	// Función para formatear los números como moneda
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("es-ES", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 2,
		}).format(amount);
	};

	// Calcular totales para la transacción actual
	const calculateTotals = () => {
		const totalDebit = newTransaction.entries.reduce(
			(sum, entry) => sum + parseFloat(entry.debit_amount || 0),
			0
		);
		const totalCredit = newTransaction.entries.reduce(
			(sum, entry) => sum + parseFloat(entry.credit_amount || 0),
			0
		);

		return {
			totalDebit,
			totalCredit,
			difference: totalDebit - totalCredit,
		};
	};

	const totals = calculateTotals();

	// ✅ ACTUALIZADA: Tarjetas usando datos reales de métricas
	const cards = metrics ? [
		{
		  title: "Ventas Totales",
		  value: formatCurrency(metrics.sales.total),
		  change: 0,
		  icon: DollarSign,
		  iconBgColor: "bg-green-50",
		  iconColor: "text-green-600",
		},
		{
		  title: "Gastos Totales",
		  value: formatCurrency(metrics.expenses.total),
		  change: 0,
		  icon: DollarSign,
		  iconBgColor: "bg-red-50",
		  iconColor: "text-red-600",
		},
		{
		  title: "Beneficio Bruto",
		  value: formatCurrency(metrics.profit.gross),
		  change: metrics.profit.margin_percentage,
		  icon: BarChart2,
		  iconBgColor: "bg-blue-50",
		  iconColor: "text-blue-600",
		},
		{
		  title: "Efectivo Disponible",
		  value: formatCurrency(metrics.cash.balance),
		  change: 0,
		  icon: DollarSign,
		  iconBgColor: "bg-purple-50",
		  iconColor: "text-purple-600",
		},
	  ] : [];

	return (
    <div>
      {/* ✅ Header con botón de refrescar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestión Contable
        </h1>
        <button
          onClick={refreshData}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* ✅ Mostrar errores si existen */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error al cargar los datos
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={refreshData}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Intentar de nuevo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-5">
        {/* Tarjetas de resumen */}
        <DashboardCardList cards={cards} />
      </div>
      {/* Pestañas */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("transactions")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "transactions"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Transacciones
            </button>
            <button
              onClick={() => setActiveTab("accounts")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "accounts"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Plan Contable
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "reports"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Reportes
            </button>
          </nav>
        </div>
      </div>

      {/* Filtros */}
      {activeTab === "transactions" && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-700">Filtrar:</span>
            </div>

            <div className="flex flex-wrap gap-4">
              <div>
                <label
                  htmlFor="dateFrom"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Fecha desde
                </label>
                <input
                  type="date"
                  id="dateFrom"
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, from: e.target.value })
                  }
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="dateTo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Fecha hasta
                </label>
                <input
                  type="date"
                  id="dateTo"
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, to: e.target.value })
                  }
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tipo
                </label>
                <select
                  id="type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="SALE">Venta</option>
                  <option value="EXPENSE">Gasto</option>
                  <option value="ADJUSTMENT">Ajuste</option>
                  <option value="TRANSFER">Transferencia</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Estado
                </label>
                <select
                  id="status"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="posted">Contabilizados</option>
                  <option value="pending">Pendientes</option>
                </select>
              </div>
            </div>

            <div className="ml-auto">
              <button
                type="button"
                onClick={() => setIsNewTransactionModalOpen(true)}
                className="px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-white shadow-sm hover:bg-primary-700"
              >
                Nueva Transacción
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido de pestañas */}
      <div className="bg-white rounded-lg shadow-sm">
        {activeTab === "transactions" && (
          <Table
            data={transactions}
            columns={transactionColumns}
            loading={loading}
            searchFields={["reference_number", "description", "type"]}
            emptyMessage="No hay transacciones disponibles para los filtros aplicados"
            pagination={{
              currentPage: paginationData.current_page,
              totalPages: paginationData.last_page,
              totalItems: paginationData.total,
              itemsPerPage: paginationData.per_page,
              onPageChange: setCurrentPage,
            }}
          />
        )}

        {activeTab === "accounts" && (
          <div>
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Plan de Cuentas
              </h2>
              <button
                type="button"
                onClick={() => setIsNewAccountModalOpen(true)}
                className="px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-white shadow-sm hover:bg-primary-700"
              >
                Nueva Cuenta
              </button>
            </div>
            <Table
              data={accounts}
              columns={accountColumns}
              loading={loading}
              searchFields={["code", "name", "type"]}
              emptyMessage="No hay cuentas disponibles"
              pagination={{
                currentPage,
                totalPages: Math.ceil(accounts.length / 10),
                totalItems: accounts.length,
                itemsPerPage: 10,
                onPageChange: setCurrentPage,
              }}
            />
          </div>
        )}

        {activeTab === "reports" && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Informes Financieros
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Balance General
                </h3>
                <p className="text-gray-600 mb-4">
                  Resumen de activos, pasivos y patrimonio de la empresa.
                </p>
                <button
                  type="button"
                  className="px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-white shadow-sm hover:bg-primary-700 w-full"
                >
                  Ver Balance General
                </button>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Estado de Resultados
                </h3>
                <p className="text-gray-600 mb-4">
                  Informe detallado de ingresos, gastos y beneficios.
                </p>
                <button
                  type="button"
                  className="px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-white shadow-sm hover:bg-primary-700 w-full"
                >
                  Ver Estado de Resultados
                </button>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Libro Mayor
                </h3>
                <p className="text-gray-600 mb-4">
                  Registro detallado de movimientos por cuenta.
                </p>
                <button
                  type="button"
                  className="px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-white shadow-sm hover:bg-primary-700 w-full"
                >
                  Ver Libro Mayor
                </button>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Generar Informes Personalizados
              </h3>

              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="reportType"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Tipo de Informe
                    </label>
                    <select
                      id="reportType"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                    >
                      <option value="balance">Balance General</option>
                      <option value="income">Estado de Resultados</option>
                      <option value="ledger">Libro Mayor</option>
                      <option value="tax">Informe de Impuestos</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="reportDateFrom"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Fecha desde
                    </label>
                    <input
                      type="date"
                      id="reportDateFrom"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="reportDateTo"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Fecha hasta
                    </label>
                    <input
                      type="date"
                      id="reportDateTo"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="reportFormat"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Formato
                    </label>
                    <select
                      id="reportFormat"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-white shadow-sm hover:bg-primary-700"
                  >
                    Generar Informe
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Nueva Transacción */}
      {isNewTransactionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeTransactionModal}></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingTransaction ? 'Editar Transacción Contable' : 'Nueva Transacción Contable'}
              </h3>
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={closeTransactionModal}
              >
                <span className="sr-only">Cerrar</span>
                <X className="h-6 w-6" />
              </button>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="referenceNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Número de Referencia
                  </label>
                  <input
                    type="text"
                    id="referenceNumber"
                    name="referenceNumber"
                    value={newTransaction.referenceNumber}
                    onChange={handleTransactionChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="TRANS-XXX"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="transactionDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Fecha de Transacción
                  </label>
                  <input
                    type="date"
                    id="transactionDate"
                    name="transactionDate"
                    value={newTransaction.transactionDate}
                    onChange={handleTransactionChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Tipo de Transacción
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={newTransaction.type}
                    onChange={handleTransactionChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="Venta">Venta</option>
                    <option value="Compra">Compra</option>
                    <option value="Gasto">Gasto</option>
                    <option value="Devolución">Devolución</option>
                    <option value="Ajuste">Ajuste</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Descripción
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={newTransaction.description}
                    onChange={handleTransactionChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Descripción de la transacción"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Entradas Contables
                  </label>
                  <button
                    type="button"
                    onClick={addTransactionEntry}
                    className="text-primary-600 hover:text-primary-700 flex items-center text-sm font-medium"
                  >
                    <Plus
                      size={16}
                      className="mr-1"
                    />{" "}
                    Añadir entrada
                  </button>
                </div>

                <div className="overflow-x-auto border border-gray-300 rounded-md shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cuenta
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Debe
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Haber
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notas
                        </th>
                        <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {newTransaction.entries.map((entry, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <select
                              value={entry.account_id}
                              onChange={(e) =>
                                handleEntryChange(
                                  index,
                                  "account_id",
                                  e.target.value
                                )
                              }
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                              required
                            >
                              <option value="">Seleccionar cuenta</option>
                              {accounts.map((account) => (
                                <option
                                  key={account.id}
                                  value={account.id}
                                >
                                  {account.code} - {account.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <input
                              type="number"
                              value={entry.debit_amount}
                              onChange={(e) =>
                                handleEntryChange(
                                  index,
                                  "debit_amount",
                                  e.target.value
                                )
                              }
                              step="0.01"
                              min="0"
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <input
                              type="number"
                              value={entry.credit_amount}
                              onChange={(e) =>
                                handleEntryChange(
                                  index,
                                  "credit_amount",
                                  e.target.value
                                )
                              }
                              step="0.01"
                              min="0"
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <input
                              type="text"
                              value={entry.notes || ""}
                              onChange={(e) =>
                                handleEntryChange(index, "notes", e.target.value)
                              }
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                              placeholder="Notas"
                            />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-center">
                            <button
                              type="button"
                              onClick={() => removeTransactionEntry(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <X size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          Totales
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(totals.totalDebit)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(totals.totalCredit)}
                        </td>
                        <td
                          colSpan={2}
                          className="px-3 py-2 whitespace-nowrap text-sm font-medium"
                        >
                          <span
                            className={`${totals.difference === 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {totals.difference === 0
                              ? "Transacción balanceada"
                              : `Diferencia: ${formatCurrency(Math.abs(totals.difference))}`}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsNewTransactionModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveTransaction}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
                >
                  <Save
                    size={16}
                    className="mr-2"
                  />{" "}
                  Guardar Transacción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Nueva Cuenta */}
      {isNewAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsNewAccountModalOpen(false)}></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Nueva Cuenta Contable
              </h2>
              <button
                onClick={() => setIsNewAccountModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Código de Cuenta
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={newAccount.code}
                    onChange={handleAccountChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej. 1000"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nombre de Cuenta
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newAccount.name}
                    onChange={handleAccountChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej. Efectivo"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="accountType"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Tipo de Cuenta
                  </label>
                  <select
                    id="accountType"
                    name="type"
                    value={newAccount.type}
                    onChange={handleAccountChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="Activo">Activo</option>
                    <option value="Pasivo">Pasivo</option>
                    <option value="Patrimonio">Patrimonio</option>
                    <option value="Ingreso">Ingreso</option>
                    <option value="Gasto">Gasto</option>
                    <option value="Costo">Costo</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="isActive"
                    className="flex items-center text-sm font-medium text-gray-700 mt-6"
                  >
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={newAccount.isActive}
                      onChange={handleAccountChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2">Cuenta Activa</span>
                  </label>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newAccount.description}
                  onChange={handleAccountChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Descripción detallada de la cuenta"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsNewAccountModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveAccount}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
                >
                  <Save
                    size={16}
                    className="mr-2"
                  />{" "}
                  Guardar Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Transacción */}
      {isTransactionDetailModalOpen && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsTransactionDetailModalOpen(false)}></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Detalles de Transacción: {selectedTransaction.reference_number}
              </h2>
              <button
                onClick={() => setIsTransactionDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase">
                      Referencia
                    </h4>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {selectedTransaction.reference_number}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase">
                      Fecha
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(
                        selectedTransaction.transaction_date
                      ).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase">
                      Tipo
                    </h4>
                    <p className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          (selectedTransaction.type === "SALE" || selectedTransaction.type === "Venta")
                            ? "bg-green-100 text-green-800"
                            : (selectedTransaction.type === "PURCHASE" || selectedTransaction.type === "Compra")
                              ? "bg-blue-100 text-blue-800"
                              : (selectedTransaction.type === "EXPENSE" || selectedTransaction.type === "Gasto")
                                ? "bg-red-100 text-red-800"
                                : (selectedTransaction.type === "REFUND" || selectedTransaction.type === "Devolución")
                                  ? "bg-orange-100 text-orange-800"
                                  : (selectedTransaction.type === "ADJUSTMENT" || selectedTransaction.type === "Ajuste")
                                    ? "bg-yellow-100 text-yellow-800"
                                    : (selectedTransaction.type === "TRANSFER" || selectedTransaction.type === "Transferencia")
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {{
                          'SALE': 'Venta',
                          'PURCHASE': 'Compra',
                          'EXPENSE': 'Gasto',
                          'REFUND': 'Devolución',
                          'ADJUSTMENT': 'Ajuste',
                          'TRANSFER': 'Transferencia',
                          'Venta': 'Venta',
                          'Compra': 'Compra',
                          'Gasto': 'Gasto',
                          'Devolución': 'Devolución',
                          'Ajuste': 'Ajuste',
                          'Transferencia': 'Transferencia'
                        }[selectedTransaction.type] || selectedTransaction.type}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-xs font-medium text-gray-500 uppercase">
                    Descripción
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedTransaction.description}
                  </p>
                </div>
                <div className="mt-4">
                  <h4 className="text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </h4>
                  <p className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${selectedTransaction.is_posted ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                    >
                      {selectedTransaction.is_posted
                        ? "Contabilizado"
                        : "Pendiente"}
                    </span>
                  </p>
                </div>
                {selectedTransaction.order_id && (
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-gray-500 uppercase">
                      Orden relacionada
                    </h4>
                    <p className="mt-1 text-sm text-primary-600 font-medium">
                      #{selectedTransaction.order_id}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3">
                  Entradas Contables
                </h3>
                <div className="overflow-x-auto border border-gray-300 rounded-md shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cuenta
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Debe
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Haber
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notas
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedTransaction.entries.map((entry) => {
                        // Encontrar la cuenta correspondiente
                        const account = accounts.find(
                          (a) => a.id === entry.account_id
                        );

                        return (
                          <tr key={entry.id}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {account
                                ? `${account.code} - ${account.name}`
                                : `Cuenta ID: ${entry.account_id}`}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">
                              {parseFloat(entry.debit_amount) > 0
                                ? formatCurrency(parseFloat(entry.debit_amount))
                                : ""}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">
                              {parseFloat(entry.credit_amount) > 0
                                ? formatCurrency(parseFloat(entry.credit_amount))
                                : ""}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {entry.notes}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Fila de totales */}
                      <tr className="bg-gray-50 font-medium">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          Totales
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          {formatCurrency(
                            selectedTransaction.entries.reduce(
                              (sum, entry) => sum + parseFloat(entry.debit_amount || 0),
                              0
                            )
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          {formatCurrency(
                            selectedTransaction.entries.reduce(
                              (sum, entry) => sum + parseFloat(entry.credit_amount || 0),
                              0
                            )
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {(() => {
                            // Calcular balance localmente para verificar
                            const totalDebits = selectedTransaction.entries.reduce(
                              (sum, entry) => sum + parseFloat(entry.debit_amount || 0),
                              0
                            );
                            const totalCredits = selectedTransaction.entries.reduce(
                              (sum, entry) => sum + parseFloat(entry.credit_amount || 0),
                              0
                            );
                            const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

                            return isBalanced ? (
                              <span className="text-green-600">
                                Transacción balanceada
                              </span>
                            ) : (
                              <span className="text-red-600">
                                Transacción no balanceada (Dif: {formatCurrency(Math.abs(totalDebits - totalCredits))})
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                {!selectedTransaction.is_posted && (
                  <button
                    type="button"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
                  >
                    <Archive
                      size={16}
                      className="mr-2"
                    />{" "}
                    Contabilizar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsTransactionDetailModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Cuenta */}
      {isAccountDetailModalOpen && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsAccountDetailModalOpen(false)}></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Detalles de Cuenta: {selectedAccount.code} - {selectedAccount.name}
              </h2>
              <button
                onClick={() => setIsAccountDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase">
                      Código
                    </h4>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {selectedAccount.code}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase">
                      Nombre
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedAccount.name}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase">
                      Tipo
                    </h4>
                    <p className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          selectedAccount.type === "Activo"
                            ? "bg-blue-100 text-blue-800"
                            : selectedAccount.type === "Pasivo"
                              ? "bg-yellow-100 text-yellow-800"
                              : selectedAccount.type === "Ingreso"
                                ? "bg-green-100 text-green-800"
                                : selectedAccount.type === "Gasto"
                                  ? "bg-red-100 text-red-800"
                                  : selectedAccount.type === "Costo"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedAccount.type}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase">
                      Saldo
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      <span
                        className={`font-medium ${selectedAccount.balance && selectedAccount.balance >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatCurrency(selectedAccount.balance || 0)}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </h4>
                  <p className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${selectedAccount.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {selectedAccount.is_active ? "Activa" : "Inactiva"}
                    </span>
                  </p>
                </div>
                <div className="mt-4">
                  <h4 className="text-xs font-medium text-gray-500 uppercase">
                    Descripción
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedAccount.description || "Sin descripción"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3">
                  Movimientos Recientes
                </h3>
                <div className="border border-gray-300 rounded-md shadow-sm p-4 text-center text-gray-500">
                  <p>
                    Para ver los movimientos detallados de esta cuenta, genere un
                    informe de Libro Mayor.
                  </p>
                  <button
                    type="button"
                    className="mt-3 px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-white shadow-sm hover:bg-primary-700"
                  >
                    Ver Libro Mayor
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setIsAccountDetailModalOpen(false)}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
                >
                  Editar Cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccountingPage;
