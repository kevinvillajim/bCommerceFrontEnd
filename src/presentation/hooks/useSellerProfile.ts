import { useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import ApiClient from "../../infrastructure/api/apiClient";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";

interface SellerProfileData {
	name: string;
	email: string;
	phone?: string;
	location?: string;
	storeName?: string;
	storeDescription?: string;
	avatar?: string;
}

interface PasswordChangeData {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}

export const useSellerProfile = () => {
	const { user, updateUser } = useAuth();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	// Obtener datos del perfil (usar datos del contexto de auth)
	const getProfileData = useCallback((): SellerProfileData => {
		return {
			name: user?.name || "",
			email: user?.email || "",
			phone: user?.phone || "",
			location: user?.location || "",
			storeName: user?.store_name || "",
			storeDescription: user?.store_description || "",
			avatar: user?.avatar || "",
		};
	}, [user]);

	// Actualizar perfil básico
	const updateProfile = useCallback(async (profileData: Partial<SellerProfileData>) => {
		setLoading(true);
		setError(null);
		setSuccess(null);

		try {
			const response = await ApiClient.put(API_ENDPOINTS.PROFILE.UPDATE, profileData);
			
			if (response) {
				// Actualizar contexto de autenticación con nuevos datos
				updateUser(response);
				setSuccess("Perfil actualizado correctamente");
				return true;
			}
			
			throw new Error("No se pudo actualizar el perfil");
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Error al actualizar perfil";
			setError(errorMessage);
			console.error("Error al actualizar perfil:", err);
			return false;
		} finally {
			setLoading(false);
		}
	}, [updateUser]);

	// Cambiar contraseña
	const changePassword = useCallback(async (passwordData: PasswordChangeData) => {
		setLoading(true);
		setError(null);
		setSuccess(null);

		try {
			// Validar que las contraseñas coincidan
			if (passwordData.newPassword !== passwordData.confirmPassword) {
				throw new Error("Las contraseñas no coinciden");
			}

			// Validar longitud mínima
			if (passwordData.newPassword.length < 6) {
				throw new Error("La contraseña debe tener al menos 6 caracteres");
			}

			const response = await ApiClient.put(API_ENDPOINTS.PROFILE.UPDATE, {
				current_password: passwordData.currentPassword,
				password: passwordData.newPassword,
				password_confirmation: passwordData.confirmPassword,
			});

			if (response) {
				setSuccess("Contraseña actualizada correctamente");
				return true;
			}

			throw new Error("No se pudo actualizar la contraseña");
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Error al cambiar contraseña";
			setError(errorMessage);
			console.error("Error al cambiar contraseña:", err);
			return false;
		} finally {
			setLoading(false);
		}
	}, []);

	// Limpiar mensajes
	const clearMessages = useCallback(() => {
		setError(null);
		setSuccess(null);
	}, []);

	return {
		profileData: getProfileData(),
		loading,
		error,
		success,
		updateProfile,
		changePassword,
		clearMessages,
	};
};