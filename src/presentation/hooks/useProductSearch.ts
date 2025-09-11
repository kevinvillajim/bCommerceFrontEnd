import {useState, useCallback} from "react";

export const useProductSearch = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [isSearching, setIsSearching] = useState(false);

	// Manejar cambios en el campo de búsqueda (sin actualizar URL automáticamente)
	const handleSearchChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setSearchTerm(value);
		},
		[]
	);

	// Función para establecer el término de búsqueda externamente (desde URL)
	const setSearchTermExternal = useCallback((term: string) => {
		setSearchTerm(term);
	}, []);

	// Función para manejar envío del formulario
	const handleSearchSubmit = useCallback(
		(onSearchSubmit: (searchTerm: string) => void) => (e: React.FormEvent) => {
			e.preventDefault();
			setIsSearching(true);
			
			// Llamar a la función proporcionada para manejar la búsqueda
			onSearchSubmit(searchTerm);
			
			// Dar tiempo para que la búsqueda se procese
			setTimeout(() => {
				setIsSearching(false);
			}, 300);
		},
		[searchTerm]
	);

	// Limpiar la búsqueda
	const clearSearch = useCallback((onClearSearch: () => void) => {
		setSearchTerm("");
		onClearSearch();
	}, []);

	return {
		searchTerm,
		isSearching,
		handleSearchChange,
		handleSearchSubmit,
		clearSearch,
		setSearchTermExternal,
	};
};

export default useProductSearch;