import { useState, useCallback, useMemo, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import ApiClient from "../../infrastructure/api/apiClient";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import { usePasswordValidation } from "./usePasswordValidation";

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

interface SellerInfo {
	seller: {
		id: number;
		store_name: string;
		description: string;
		status: string;
		verification_level: string;
		avatar?: string;
	};
	data?: any;
}

export const useSellerProfile = () => {
	const { user, updateUser } = useAuth();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
	
	// Hook para validación dinámica de contraseñas
	const { validatePassword } = usePasswordValidation();
	const [sellerInfoLoaded, setSellerInfoLoaded] = useState(false);

	// ✅ NUEVO: Obtener información del seller al cargar el hook
	useEffect(() => {
		console.log('🔄 useEffect fetchSellerInfo - Conditions:', {
			hasUser: !!user,
			sellerInfoLoaded,
			userId: user?.id
		});
		
		if (user && !sellerInfoLoaded) {
			console.log('✅ Conditions met, calling fetchSellerInfo...');
			fetchSellerInfo();
		}
	}, [user, sellerInfoLoaded]);

	// ✅ NUEVO: Función para obtener información del seller
	const fetchSellerInfo = async () => {
		try {
			console.log('🔍 fetchSellerInfo started - calling API_ENDPOINTS.SELLER.INFO:', API_ENDPOINTS.SELLER.INFO);
			
			const response = await ApiClient.get<SellerInfo>(API_ENDPOINTS.SELLER.INFO);
			
			console.log('📥 RAW API Response:', response);
			console.log('📥 Response type:', typeof response);
			console.log('📥 Response.data:', response?.data);
			console.log('📥 Response.seller:', response?.seller);
			
			// ✅ DEBUGGING: Verificar diferentes estructuras de respuesta
			if (response) {
				// Caso 1: response.seller directamente
				if (response.seller) {
					console.log('✅ Case 1: response.seller found:', response.seller);
					setSellerInfo(response);
				}
				// Caso 2: response.data.seller
				else if (response.data && response.data.seller) {
					console.log('✅ Case 2: response.data.seller found:', response.data.seller);
					setSellerInfo(response.data);
				}
				// Caso 3: response.data directly (sin nested seller)
				else if (response.data) {
					console.log('✅ Case 3: response.data found:', response.data);
					// Crear estructura compatible
					setSellerInfo({
						seller: response.data
					});
				}
				// Caso 4: response directamente es el seller data
				// ✅ CORREGIDO: Cast de tipo para acceder a propiedades
				else if ((response as any).store_name) {
					console.log('✅ Case 4: response is seller data directly:', response);
					const responseData = response as any;
					setSellerInfo({
						seller: {
							id: responseData.id || 0,
							store_name: responseData.store_name || "",
							description: responseData.description || "",
							status: responseData.status || "active",
							verification_level: responseData.verification_level || "none"
						}
					} as SellerInfo);
				}
				else {
					console.log('⚠️ Unknown response structure:', response);
				}
			} else {
				console.log('❌ No response received');
			}
		} catch (err) {
			console.error('❌ Error obteniendo información del seller:', err);
			// ✅ CORREGIDO: Manejo seguro de errores usando 'err' en lugar de 'error'
			const errorObj = err as any;
			console.error('❌ Error details:', {
				message: errorObj?.message,
				status: errorObj?.response?.status,
				data: errorObj?.response?.data
			});
		} finally {
			console.log('🏁 fetchSellerInfo finished, setting sellerInfoLoaded = true');
			setSellerInfoLoaded(true);
		}
	};

	// ✅ CORREGIDO: Ahora usa tanto datos del user como del seller
	const profileData = useMemo((): SellerProfileData => {
		console.log('🎯 profileData useMemo calculating with:', {
			user: user ? {
				name: user.name,
				email: user.email,
				location: user.location,
				avatar: user.avatar
			} : 'NO USER',
			sellerInfo: sellerInfo ? {
				seller: sellerInfo.seller
			} : 'NO SELLER INFO',
			sellerInfoLoaded
		});

		const data = {
			name: user?.name || "",
			email: user?.email || "",
			phone: user?.phone || "",
			location: user?.location || "",
			storeName: sellerInfo?.seller?.store_name || "",           // ✅ AHORA desde sellerInfo
			storeDescription: sellerInfo?.seller?.description || "",   // ✅ AHORA desde sellerInfo
			avatar: user?.avatar || "",
		};
		
		console.log('🔍 ProfileData calculado con seller info:', data);
		console.log('🔍 storeName source value:', sellerInfo?.seller?.store_name);
		console.log('🔍 storeDescription source value:', sellerInfo?.seller?.description);
		
		return data;
	}, [
		user?.name, 
		user?.email, 
		user?.phone, 
		user?.location, 
		user?.avatar,
		sellerInfo?.seller?.store_name,    // ✅ CORREGIDO: Ahora desde sellerInfo
		sellerInfo?.seller?.description,   // ✅ CORREGIDO: Ahora desde sellerInfo
	]);

	// Actualizar perfil del usuario (tabla users)
	const updateUserProfile = useCallback(async (userData: { name?: string; location?: string }) => {
		setLoading(true);
		setError(null);
		setSuccess(null);

		try {
			console.log('📤 Actualizando datos de usuario:', userData);
			
			// Limpiar campos undefined
			const cleanData = Object.fromEntries(
				Object.entries(userData).filter(([_, value]) => 
					value !== undefined && value !== null && value !== ""
				)
			);

			if (Object.keys(cleanData).length === 0) {
				console.log('⚠️ No hay datos de usuario para actualizar');
				return true; // No hay nada que actualizar, considerarlo éxito
			}

			const response = await ApiClient.put(API_ENDPOINTS.PROFILE.UPDATE, cleanData);
			
			console.log('📥 Respuesta actualización usuario:', response);
			
			if (response) {
				// ✅ CORREGIDO: Verificar que updateUser existe antes de usarlo
				if (updateUser) {
					updateUser(response);
				}
				return true;
			}
			
			throw new Error("No se pudo actualizar el perfil del usuario");
		} catch (err) {
			console.error('❌ Error al actualizar perfil de usuario:', err);
			const errorMessage = err instanceof Error ? err.message : "Error al actualizar perfil";
			setError(errorMessage);
			return false;
		} finally {
			setLoading(false);
		}
	}, [updateUser]);

	// Actualizar información de la tienda (tabla sellers)
	const updateStoreInfo = useCallback(async (storeData: { storeName?: string; storeDescription?: string }) => {
		setLoading(true);
		setError(null);
		setSuccess(null);

		try {
			console.log('📤 Actualizando datos de tienda:', storeData);

			const updateData = {
				store_name: storeData.storeName,
				description: storeData.storeDescription,
			};

			// Limpiar campos undefined
			const cleanData = Object.fromEntries(
				Object.entries(updateData).filter(([_, value]) => 
					value !== undefined && value !== null && value !== ""
				)
			);

			if (Object.keys(cleanData).length === 0) {
				console.log('⚠️ No hay datos de tienda para actualizar');
				return true; // No hay nada que actualizar, considerarlo éxito
			}

			console.log('📤 Enviando datos limpios de tienda:', cleanData);

			const response = await ApiClient.put(API_ENDPOINTS.SELLER.UPDATE_STORE_INFO, cleanData);
			
			console.log('📥 Respuesta actualización tienda:', response);
			
			// ✅ CORREGIDO: Cast de tipo para acceder a response.data
			const responseData = response as any;
			if (responseData && responseData.data) {
				// ✅ CORREGIDO: Actualizar la información del seller localmente con tipos seguros
				setSellerInfo(prev => {
					if (!prev) return null;
					return {
						...prev,
						seller: {
							...prev.seller,
							id: prev.seller.id, // ✅ CORREGIDO: Mantener id requerido
							store_name: responseData.data.store_name || prev.seller.store_name || "",
							description: responseData.data.description || prev.seller.description || "",
							status: prev.seller.status,
							verification_level: prev.seller.verification_level,
							avatar: prev.seller.avatar,
						}
					};
				});
				return true;
			}
			
			throw new Error("No se pudo actualizar la información de la tienda");
		} catch (err) {
			console.error('❌ Error al actualizar información de tienda:', err);
			const errorMessage = err instanceof Error ? err.message : "Error al actualizar información de tienda";
			setError(errorMessage);
			return false;
		} finally {
			setLoading(false);
		}
	}, []);

	// ✅ CORREGIDO: Función combinada para actualizar ambos
	const updateProfile = useCallback(async (profileDataUpdate: Partial<SellerProfileData>) => {
		console.log('🔄 Iniciando actualización de perfil completo:', profileDataUpdate);
		
		setLoading(true);
		setError(null);
		setSuccess(null);
		
		let allSuccess = true;
		let hasAnyChanges = false;

		// Separar datos de usuario y tienda
		const userData = {
			name: profileDataUpdate.name,
			location: profileDataUpdate.location,
		};

		const storeData = {
			storeName: profileDataUpdate.storeName,
			storeDescription: profileDataUpdate.storeDescription,
		};

		// Verificar si hay cambios en datos de usuario
		const hasUserChanges = Object.values(userData).some(value => 
			value !== undefined && value !== null && value !== ""
		);
		
		// Verificar si hay cambios en datos de tienda
		const hasStoreChanges = Object.values(storeData).some(value => 
			value !== undefined && value !== null && value !== ""
		);

		// Actualizar datos de usuario si hay cambios
		if (hasUserChanges) {
			console.log('👤 Actualizando datos de usuario...');
			hasAnyChanges = true;
			const userSuccess = await updateUserProfile(userData);
			allSuccess = allSuccess && userSuccess;
		}

		// Actualizar datos de tienda si hay cambios
		if (hasStoreChanges) {
			console.log('🏪 Actualizando datos de tienda...');
			hasAnyChanges = true;
			const storeSuccess = await updateStoreInfo(storeData);
			allSuccess = allSuccess && storeSuccess;
		}

		if (!hasAnyChanges) {
			console.log('⚠️ No hay cambios para actualizar');
			setError("No hay cambios para actualizar");
			setLoading(false);
			return false;
		}

		if (allSuccess) {
			console.log('✅ Perfil actualizado exitosamente');
			setSuccess("Perfil actualizado correctamente");
		} else {
			console.log('❌ Error en la actualización del perfil');
		}

		setLoading(false);
		return allSuccess;
	}, [updateUserProfile, updateStoreInfo]);

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

			const response = await ApiClient.uploadFile(API_ENDPOINTS.PROFILE.UPLOAD_AVATAR, formData);

			console.log('📥 Respuesta del avatar:', response);

			if (response) {
				// ✅ CORREGIDO: Verificar que updateUser existe antes de usarlo
				if (updateUser) {
					updateUser(response);
				}
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

			// Usar validación dinámica basada en configuración del admin
			const passwordValidation = validatePassword(passwordData.newPassword);
			if (!passwordValidation.isValid) {
				throw new Error(passwordValidation.errors[0]); // Mostrar el primer error
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
		profileData,
		loading: loading || !sellerInfoLoaded, // ✅ NUEVO: También considerar si está cargando seller info
		error,
		success,
		updateProfile,
		updateUserProfile,
		updateStoreInfo, 
		uploadAvatar,
		changePassword,
		clearMessages,
		sellerInfo, 
		refetchSellerInfo: fetchSellerInfo, 
	};
};