// src/presentation/hooks/useFavorites.ts - SIMPLIFICADO
import {useContext} from "react";
import {FavoriteContext} from "../contexts/FavoriteContext";

export const useFavorites = () => {
	const context = useContext(FavoriteContext);
	if (!context) {
		throw new Error("useFavorites debe usarse dentro de un FavoriteProvider");
	}
	return context;
};

export default useFavorites;
