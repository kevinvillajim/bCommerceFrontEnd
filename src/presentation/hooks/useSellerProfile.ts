import { useState, useCallback, useMemo } from "react";
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

	// ✅ ARREGLADO: Usar useMemo para evitar recalculo constante de profileData
	const profileData = useMemo((): SellerProfileData => {
		const data = {
			name: user?.name || "",
			email: user?.email || "",
			phone: user?.phone || "",
			location: user?.location || "",
			storeName: user?.store_name || "",
			storeDescription: user?.store_description || "",
			avatar: user?.avatar || "",
		};
		
		// Solo logear cuando realmente cambien los valores relevantes
		if (user?.name) {
			console.log('🔍 ProfileData calculado:', data);
		}
		
		return data;
	}, [
		user?.name, 
		user?.email, 
		user?.phone, 
		user?.location, 
		user?.store_name, 
		user?.store_description, 
		user?.avatar
	]);

	// Actualizar perfil básico
	const updateProfile = useCallback(async (profileDataUpdate: Partial<SellerProfileData>) => {
		setLoading(true);
		setError(null);
		setSuccess(null);

		try {
			console.log('📤 Enviando datos del perfil:', profileDataUpdate);

			// Preparar datos completos incluyendo campos de seller
			const updateData = {
				name: profileDataUpdate.name,
				phone: profileDataUpdate.phone,
				location: profileDataUpdate.location,
				store_name: profileDataUpdate.storeName,
				store_description: profileDataUpdate.storeDescription,
			};

			// Limpiar campos undefined/null innecesarios
			Object.keys(updateData).forEach(key => {
				if (updateData[key] === undefined || updateData[key] === null || updateData[key] === "") {
					delete updateData[key];
				}
			});

			console.log('📤 Datos limpiados para enviar:', updateData);

			const response = await ApiClient.put(API_ENDPOINTS.PROFILE.UPDATE, updateData);
			
			console.log('📥 Respuesta del servidor:', response);

			if (response) {
				// Actualizar contexto de autenticación con nuevos datos
				updateUser(response);
				setSuccess("Perfil actualizado correctamente");
				return true;
			}
			
			throw new Error("No se pudo actualizar el perfil");
		} catch (err) {
			console.error('❌ Error completo al actualizar perfil:', err);
			const errorMessage = err instanceof Error ? err.message : "Error al actualizar perfil";
			setError(errorMessage);
			return false;
		} finally {
			setLoading(false);
		}
	}, [updateUser]);

	// Subir avatar
	const uploadAvatar = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
        console.log('📤 Subiendo avatar:', file.name, 'Tamaño:', file.size, 'Tipo:', file.type);

        const formData = new FormData();
        formData.append('avatar', file);

        console.log('📤 Enviando a:', API_ENDPOINTS.PROFILE.UPLOAD_AVATAR);

        // ✅ ARREGLADO: Usar uploadFile específico en lugar de post
        const response = await ApiClient.uploadFile(API_ENDPOINTS.PROFILE.UPLOAD_AVATAR, formData);

        console.log('📥 Respuesta del avatar:', response);

        if (response) {
            updateUser(response);
            setSuccess("Avatar actualizado correctamente");
            return true;
        }

        throw new Error("No se pudo subir el avatar");
    } catch (err: any) {
        console.error('❌ Error completo al subir avatar:', err);
        
        // Manejo específico de errores de validación
        if (err.response?.status === 422) {
            const errors = err.response?.data?.errors;
            if (errors?.avatar) {
                setError(`Error de validación: ${errors.avatar[0]}`);
            } else {
                setError('Error de validación en el archivo de imagen');
            }
        } else {
            const errorMessage = err instanceof Error ? err.message : "Error al subir avatar";
            setError(errorMessage);
        }
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

			console.log('📤 Cambiando contraseña...');

			const response = await ApiClient.put(API_ENDPOINTS.PROFILE.CHANGE_PASSWORD, {
				current_password: passwordData.currentPassword,
				password: passwordData.newPassword,
				password_confirmation: passwordData.confirmPassword,
			});

			console.log('📥 Respuesta del cambio de contraseña:', response);

			if (response) {
				setSuccess("Contraseña actualizada correctamente");
				return true;
			}

			throw new Error("No se pudo actualizar la contraseña");
		} catch (err) {
			console.error('❌ Error al cambiar contraseña:', err);
			const errorMessage = err instanceof Error ? err.message : "Error al cambiar contraseña";
			setError(errorMessage);
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
		profileData, // ✅ ARREGLADO: Ahora es un objeto memoizado estable
		loading,
		error,
		success,
		updateProfile,
		uploadAvatar,
		changePassword,
		clearMessages,
	};
};