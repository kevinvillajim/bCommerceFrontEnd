import {useState, useEffect, useCallback} from "react";
import {useSearchParams} from "react-router-dom";

export const useProductSearch = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [searchTerm, setSearchTerm] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);

	// Inicializar desde URL
	useEffect(() => {
		const searchParam = searchParams.get("search");
		if (searchParam) {
			setSearchTerm(searchParam);
		}
		setIsInitialized(true);
	}, [searchParams]);

	// Manejar cambios en el campo de búsqueda (sin debounce)
	const handleSearchChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setSearchTerm(value);
			// Ya no actualizamos la URL automáticamente
		},
		[]
	);

	// Actualizar la URL con el término de búsqueda
	const updateSearchInUrl = useCallback(
		(term: string) => {
			setIsSearching(true);

			const newParams = new URLSearchParams(searchParams);

			if (term) {
				newParams.set("search", term);
			} else {
				newParams.delete("search");
			}

			// Resetear a la página 1 cuando se busca
			newParams.delete("page");

			setSearchParams(newParams, {replace: true});

			// Dar tiempo para que la URL se actualice antes de permitir nuevas búsquedas
			setTimeout(() => {
				setIsSearching(false);
			}, 300);
		},
		[searchParams, setSearchParams]
	);

	// Manejar envío del formulario (búsqueda inmediata)
	const handleSearchSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();

			// Solo actualizar si hay un término de búsqueda o si había uno antes (para borrarlo)
			if (searchTerm || searchParams.has("search")) {
				updateSearchInUrl(searchTerm);
			}
		},
		[searchTerm, searchParams, updateSearchInUrl]
	);

	// Limpiar la búsqueda
	const clearSearch = useCallback(() => {
		setSearchTerm("");

		const newParams = new URLSearchParams(searchParams);
		if (newParams.has("search")) {
			newParams.delete("search");
			setSearchParams(newParams, {replace: true});
		}
	}, [searchParams, setSearchParams]);

	return {
		searchTerm,
		isSearching,
		handleSearchChange,
		handleSearchSubmit,
		clearSearch,
	};
};

export default useProductSearch;
