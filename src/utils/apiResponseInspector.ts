/**
 * Utilidad para inspeccionar y analizar respuestas de API
 * Ayuda a entender la estructura de datos y detectar problemas
 */
export class ApiResponseInspector {
	/**
	 * Analiza e imprime la estructura de un objeto de respuesta de API
	 * @param response El objeto de respuesta a analizar
	 * @param label Etiqueta opcional para identificar la inspección
	 */
	static inspectResponse(
		response: any,
		label: string = "Inspección de respuesta API"
	): void {
		console.group(label);

		try {
			if (response === null || response === undefined) {
				console.warn("⚠️ La respuesta es nula o indefinida");
				console.groupEnd();
				return;
			}

			console.log("Tipo de respuesta:", typeof response);

			if (typeof response === "object") {
				if (Array.isArray(response)) {
					console.log(
						"📊 La respuesta es un array con",
						response.length,
						"elementos"
					);

					if (response.length > 0) {
						console.log("Muestra del primer elemento:");
						console.dir(response[0], {depth: 2});

						// Detectar propiedades en snake_case vs camelCase
						this.analyzeNamingConvention(response[0]);
					}
				} else {
					console.log("🔍 La respuesta es un objeto");

					// Analizar estructura de datos
					const structure = this.analyzeObjectStructure(response);
					console.log("Estructura:", structure);

					// Detectar si hay una estructura anidada tipo data.data
					if (response.data) {
						console.log('⚠️ La respuesta contiene una propiedad "data":');

						if (Array.isArray(response.data)) {
							console.log(
								"📊 response.data es un array con",
								response.data.length,
								"elementos"
							);

							if (response.data.length > 0) {
								console.log("Muestra del primer elemento de response.data:");
								console.dir(response.data[0], {depth: 2});

								// Detectar propiedades en snake_case vs camelCase
								this.analyzeNamingConvention(response.data[0]);
							}
						} else if (
							typeof response.data === "object" &&
							response.data !== null
						) {
							console.log("🔍 response.data es un objeto");
							console.dir(response.data, {depth: 2});

							// Verificar si hay datos anidados aún más profundos
							if (response.data.data) {
								console.log("⚠️⚠️ Se detectó una estructura anidada data.data");

								if (Array.isArray(response.data.data)) {
									console.log(
										"📊 response.data.data es un array con",
										response.data.data.length,
										"elementos"
									);

									if (response.data.data.length > 0) {
										console.log(
											"Muestra del primer elemento de response.data.data:"
										);
										console.dir(response.data.data[0], {depth: 2});

										// Detectar propiedades en snake_case vs camelCase
										this.analyzeNamingConvention(response.data.data[0]);
									}
								}
							}
						}
					}

					// Verificar si hay una propiedad meta
					if (response.meta) {
						console.log("📝 La respuesta contiene metadatos:");
						console.dir(response.meta, {depth: 2});
					}

					// Detectar propiedades en snake_case vs camelCase
					this.analyzeNamingConvention(response);
				}
			} else {
				console.log("⚠️ La respuesta no es un objeto ni un array:", response);
			}
		} catch (error) {
			console.error("Error durante la inspección:", error);
		}

		console.groupEnd();
	}

	/**
	 * Analiza la estructura general de un objeto
	 * @param obj Objeto a analizar
	 * @returns Descripción de la estructura
	 */
	private static analyzeObjectStructure(obj: any): string {
		if (!obj || typeof obj !== "object") {
			return "No es un objeto";
		}

		const keys = Object.keys(obj);

		if (keys.length === 0) {
			return "Objeto vacío {}";
		}

		return `Objeto con ${keys.length} propiedades: [${keys.join(", ")}]`;
	}

	/**
	 * Analiza si las propiedades del objeto usan snake_case o camelCase
	 * @param obj Objeto a analizar
	 */
	private static analyzeNamingConvention(obj: any): void {
		if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
			return;
		}

		const keys = Object.keys(obj);

		if (keys.length === 0) {
			return;
		}

		const snakeCaseKeys = keys.filter((key) => key.includes("_"));
		const camelCaseKeys = keys.filter((key) => /[a-z][A-Z]/.test(key));

		console.log("Análisis de convención de nombres:");
		console.log(
			`- Propiedades en snake_case: ${snakeCaseKeys.length} (${snakeCaseKeys.slice(0, 5).join(", ")}${snakeCaseKeys.length > 5 ? "..." : ""})`
		);
		console.log(
			`- Propiedades en camelCase: ${camelCaseKeys.length} (${camelCaseKeys.slice(0, 5).join(", ")}${camelCaseKeys.length > 5 ? "..." : ""})`
		);

		if (snakeCaseKeys.length > 0 && camelCaseKeys.length > 0) {
			console.warn("⚠️ El objeto mezcla convenciones snake_case y camelCase");
		} else if (snakeCaseKeys.length > 0) {
			console.log("✅ El objeto usa consistentemente snake_case");
		} else if (camelCaseKeys.length > 0) {
			console.log("✅ El objeto usa consistentemente camelCase");
		}
	}
}

export default ApiResponseInspector;
