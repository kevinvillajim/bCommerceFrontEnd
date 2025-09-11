import {useEffect, useState} from "react";
import environment from "../../../config/environment";

const ApiChecker = () => {
	const [status, setStatus] = useState<{
		loading: boolean;
		connected: boolean;
		message: string;
		details?: any;
	}>({
		loading: true,
		connected: false,
		message: "Verificando conexión...",
	});

	useEffect(() => {
		const checkApi = async () => {
			try {
				// Obtener la URL base de la API del entorno
				const baseUrl = environment.apiBaseUrl;

				// Intentar una solicitud simple usando fetch
				const start = Date.now();
				const response = await fetch(`${baseUrl}/api/products?limit=1`, {
					method: "GET",
					headers: {
						Accept: "application/json",
					},
				});

				const duration = Date.now() - start;

				if (response.ok) {
					const data = await response.json();

					setStatus({
						loading: false,
						connected: true,
						message: `Conectado correctamente (${duration}ms)`,
						details: {
							status: response.status,
							dataFormat: detectDataFormat(data),
							itemsCount: getItemsCount(data),
						},
					});
				} else {
					setStatus({
						loading: false,
						connected: false,
						message: `Respuesta inesperada: ${response.status}`,
						details: {
							status: response.status,
						},
					});
				}
			} catch (error) {
				console.error("Error verificando API:", error);

				setStatus({
					loading: false,
					connected: false,
					message: "Error de conexión",
					details: {
						error: String(error),
					},
				});
			}
		};

		checkApi();
	}, []);

	// Función para detectar el formato de datos
	const detectDataFormat = (data: any): string => {
		if (!data) return "Sin datos";
		if (Array.isArray(data)) return "Array directo";
		if (data.data && Array.isArray(data.data)) return "Objeto con data[]";
		if (
			data.data &&
			typeof data.data === "object" &&
			data.data.data &&
			Array.isArray(data.data.data)
		)
			return "Objeto con data.data[]";
		if (typeof data === "object") return "Objeto";
		return "Formato desconocido";
	};

	// Función para contar elementos
	const getItemsCount = (data: any): number => {
		if (!data) return 0;
		if (Array.isArray(data)) return data.length;
		if (data.data && Array.isArray(data.data)) return data.data.length;
		if (
			data.data &&
			typeof data.data === "object" &&
			data.data.data &&
			Array.isArray(data.data.data)
		)
			return data.data.data.length;
		return 0;
	};

	// Función para limpiar la caché
	const handleClearCache = () => {
		const allKeys = Object.keys(localStorage);
		const cacheKeys = allKeys.filter(
			(key) =>
				key.includes("product") ||
				key.includes("category") ||
				key.startsWith("cache_")
		);

		cacheKeys.forEach((key) => {
			localStorage.removeItem(key);
		});

		alert(`Caché limpiada. Se eliminaron ${cacheKeys.length} ítems.`);
	};

	return (
		<div className="p-3 bg-white shadow rounded-lg max-w-md mx-auto">
			<h3 className="text-lg font-medium mb-2">Estado de la API</h3>

			{status.loading ? (
				<div className="flex items-center justify-center py-3">
					<div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
				</div>
			) : (
				<div className="space-y-3">
					<div className="flex items-center">
						<div
							className={`w-3 h-3 rounded-full mr-2 ${status.connected ? "bg-green-500" : "bg-red-500"}`}
						></div>
						<span>{status.connected ? "Conectado" : "Desconectado"}</span>
					</div>

					<p className="text-sm">{status.message}</p>

					{status.details && (
						<div className="text-xs bg-gray-50 p-2 rounded">
							{Object.entries(status.details).map(([key, value]) => (
								<div key={key} className="grid grid-cols-2 gap-2">
									<span className="text-gray-600">{key}:</span>
									<span>{String(value)}</span>
								</div>
							))}
						</div>
					)}

					<div className="pt-2">
						<button
							onClick={handleClearCache}
							className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
						>
							Limpiar Caché
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default ApiChecker;
