import React, {useState, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {
	ArrowLeft,
	Save,
	X,
	Folder,
	Tag,
	FileText,
	Hash,
	Star,
	Eye,
	ArrowUpDown,
	Loader,
} from "lucide-react";
import {Link} from "react-router-dom";

// Hooks personalizados
import {useAdminCategories} from "../../hooks/useAdminCategories";

// Types
import type {CategoryUpdateData} from "../../../core/domain/entities/Category";

const AdminEditCategoryPage: React.FC = () => {
	const navigate = useNavigate();
	const {id} = useParams<{id: string}>();
	const categoryId = Number(id);

	// Hook de administración de categorías
	const {
		loading,
		error,
		categoryDetail,
		mainCategories,
		fetchCategoryById,
		fetchMainCategories,
		updateCategory,
		setError,
	} = useAdminCategories();

	// Estado del formulario
	const [formData, setFormData] = useState<CategoryUpdateData>({
		id: categoryId,
		name: "",
		slug: "",
		description: "",
		parent_id: undefined,
		icon: "",
		order: 0,
		is_active: true,
		featured: false,
	});

	// Estado de validación y carga
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [originalSlug, setOriginalSlug] = useState("");

	// Cargar datos iniciales
	useEffect(() => {
		loadData();
	}, [categoryId]);

	/**
	 * Carga los datos de la categoría y las categorías principales
	 */
	const loadData = async () => {
		if (!categoryId || isNaN(categoryId)) {
			setError("ID de categoría inválido");
			navigate("/admin/categories");
			return;
		}

		setIsLoading(true);
		try {
			// Cargar categoría específica y categorías principales en paralelo
			const [category] = await Promise.all([
				fetchCategoryById(categoryId),
				fetchMainCategories(true),
			]);

			if (!category) {
				setError("Categoría no encontrada");
				navigate("/admin/categories");
				return;
			}

			// Llenar el formulario con los datos de la categoría
			setFormData({
				id: category.id!,
				name: category.name,
				slug: category.slug,
				description: category.description || "",
				parent_id: category.parent_id || undefined,
				icon: category.icon || "",
				order: category.order || 0,
				is_active: category.is_active,
				featured: category.featured,
			});

			setOriginalSlug(category.slug);
		} catch (error) {
			console.error("Error al cargar datos de categoría:", error);
			setError("Error al cargar los datos de la categoría");
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Genera el slug automáticamente a partir del nombre
	 */
	const generateSlug = (name: string): string => {
		return name
			.toLowerCase()
			.trim()
			.replace(/[áàäâ]/g, "a")
			.replace(/[éèëê]/g, "e")
			.replace(/[íìïî]/g, "i")
			.replace(/[óòöô]/g, "o")
			.replace(/[úùüû]/g, "u")
			.replace(/[ñ]/g, "n")
			.replace(/[ç]/g, "c")
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "");
	};

	/**
	 * Maneja los cambios en los campos del formulario
	 */
	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const {name, value, type} = e.target;

		let processedValue: any = value;

		// Manejar checkboxes
		if (type === "checkbox") {
			processedValue = (e.target as HTMLInputElement).checked;
		}

		// Manejar números
		if (name === "order" || name === "parent_id") {
			processedValue = value === "" ? 0 : Number(value);
		}

		setFormData((prev) => ({
			...prev,
			[name]: processedValue,
		}));

		// Generar slug automáticamente cuando cambie el nombre (solo si el slug no se ha modificado manualmente)
		if (name === "name" && value && formData.slug === originalSlug) {
			const autoSlug = generateSlug(value);
			setFormData((prev) => ({
				...prev,
				slug: autoSlug,
			}));
		}

		// Limpiar error de validación
		if (validationErrors[name]) {
			setValidationErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	/**
	 * Valida el formulario
	 */
	const validateForm = (): boolean => {
		const errors: Record<string, string> = {};

		// Validar nombre
		if (!formData.name.trim()) {
			errors.name = "El nombre es obligatorio";
		} else if (formData.name.length < 2) {
			errors.name = "El nombre debe tener al menos 2 caracteres";
		} else if (formData.name.length > 100) {
			errors.name = "El nombre no puede tener más de 100 caracteres";
		}

		// Validar slug
		if (!formData.slug.trim()) {
			errors.slug = "El slug es obligatorio";
		} else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
			errors.slug =
				"El slug solo puede contener letras minúsculas, números y guiones";
		} else if (formData.slug.length > 150) {
			errors.slug = "El slug no puede tener más de 150 caracteres";
		}

		// Validar descripción (opcional pero con límite)
		if (formData.description && formData.description.length > 500) {
			errors.description =
				"La descripción no puede tener más de 500 caracteres";
		}

		// Validar orden
		if (
			formData.order !== undefined &&
			(formData.order < 0 || formData.order > 999)
		) {
			errors.order = "El orden debe estar entre 0 y 999";
		}

		// Validar que no se asigne como padre de sí misma
		if (formData.parent_id === categoryId) {
			errors.parent_id = "Una categoría no puede ser padre de sí misma";
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	/**
	 * Maneja el envío del formulario
	 */
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			// Preparar datos para envío
			const dataToSubmit: CategoryUpdateData = {
				...formData,
				// Limpiar campos vacíos
				description: formData.description?.trim() || undefined,
				icon: formData.icon?.trim() || undefined,
				parent_id: formData.parent_id === 0 ? undefined : formData.parent_id,
			};

			console.log("📤 Enviando datos de categoría:", dataToSubmit);

			const result = await updateCategory(dataToSubmit);

			if (result) {
				console.log("✅ Categoría actualizada exitosamente:", result);
				// Redirigir a la lista de categorías
				navigate("/admin/categories", {
					state: {
						message: `Categoría "${result.name}" actualizada exitosamente`,
					},
				});
			} else {
				setError("Error al actualizar la categoría. Inténtalo de nuevo.");
			}
		} catch (error) {
			console.error("❌ Error al actualizar categoría:", error);
			setError(
				error instanceof Error
					? error.message
					: "Error inesperado al actualizar la categoría"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	/**
	 * Obtiene el nombre de la categoría padre
	 */
	const getParentCategoryName = (parentId?: number): string => {
		if (!parentId) return "Sin categoría padre";
		const parent = mainCategories.find((c) => c.id === parentId);
		return parent ? parent.name : "Categoría padre desconocida";
	};

	// Filtrar categorías principales (excluir la categoría actual y sus hijas)
	const availableParentCategories = mainCategories.filter(
		(category) => category.id !== categoryId
	);

	// Mostrar loading mientras carga
	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-64">
				<div className="text-center">
					<Loader className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
					<p className="text-gray-600">Cargando datos de la categoría...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Link
						to="/admin/categories"
						className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
						title="Volver a categorías"
					>
						<ArrowLeft size={20} />
					</Link>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							Editar Categoría
						</h1>
						{categoryDetail && (
							<p className="text-sm text-gray-600 mt-1">
								Editando: {categoryDetail.name}
								{categoryDetail.parent_id && (
									<span className="ml-2">
										(Subcategoría de:{" "}
										{getParentCategoryName(categoryDetail.parent_id)})
									</span>
								)}
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Mostrar errores */}
			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
					{error}
				</div>
			)}

			{/* Formulario */}
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="bg-white rounded-lg shadow-sm p-6">
					<h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
						<Folder className="h-5 w-5 mr-2" />
						Información Básica
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Nombre */}
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Nombre *
							</label>
							<div className="relative">
								<Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<input
									type="text"
									id="name"
									name="name"
									value={formData.name}
									onChange={handleInputChange}
									className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
										validationErrors.name ? "border-red-300" : "border-gray-300"
									}`}
									placeholder="Nombre de la categoría"
									maxLength={100}
									required
								/>
							</div>
							{validationErrors.name && (
								<p className="mt-1 text-sm text-red-600">
									{validationErrors.name}
								</p>
							)}
						</div>

						{/* Slug */}
						<div>
							<label
								htmlFor="slug"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Slug *
							</label>
							<div className="relative">
								<Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<input
									type="text"
									id="slug"
									name="slug"
									value={formData.slug}
									onChange={handleInputChange}
									className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
										validationErrors.slug ? "border-red-300" : "border-gray-300"
									}`}
									placeholder="slug-de-la-categoria"
									maxLength={150}
									pattern="^[a-z0-9-]+$"
									required
								/>
							</div>
							{validationErrors.slug && (
								<p className="mt-1 text-sm text-red-600">
									{validationErrors.slug}
								</p>
							)}
							<p className="mt-1 text-xs text-gray-500">
								Solo letras minúsculas, números y guiones. Cambiar el slug puede
								afectar URLs existentes.
							</p>
						</div>

						{/* Categoría Padre */}
						<div>
							<label
								htmlFor="parent_id"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Categoría Padre
							</label>
							<select
								id="parent_id"
								name="parent_id"
								value={formData.parent_id || 0}
								onChange={handleInputChange}
								className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
									validationErrors.parent_id
										? "border-red-300"
										: "border-gray-300"
								}`}
							>
								<option value={0}>Sin categoría padre (principal)</option>
								{availableParentCategories.map((category) => (
									<option key={category.id} value={category.id}>
										{category.name}
									</option>
								))}
							</select>
							{validationErrors.parent_id && (
								<p className="mt-1 text-sm text-red-600">
									{validationErrors.parent_id}
								</p>
							)}
						</div>

						{/* Orden */}
						<div>
							<label
								htmlFor="order"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Orden
							</label>
							<div className="relative">
								<ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<input
									type="number"
									id="order"
									name="order"
									value={formData.order}
									onChange={handleInputChange}
									className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
										validationErrors.order
											? "border-red-300"
											: "border-gray-300"
									}`}
									placeholder="0"
									min="0"
									max="999"
								/>
							</div>
							{validationErrors.order && (
								<p className="mt-1 text-sm text-red-600">
									{validationErrors.order}
								</p>
							)}
							<p className="mt-1 text-xs text-gray-500">
								Orden de aparición (0 = primero)
							</p>
						</div>
					</div>

					{/* Descripción */}
					<div className="mt-6">
						<label
							htmlFor="description"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Descripción
						</label>
						<div className="relative">
							<FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
							<textarea
								id="description"
								name="description"
								value={formData.description || ""}
								onChange={handleInputChange}
								rows={4}
								className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
									validationErrors.description
										? "border-red-300"
										: "border-gray-300"
								}`}
								placeholder="Descripción de la categoría (opcional)"
								maxLength={500}
							/>
						</div>
						{validationErrors.description && (
							<p className="mt-1 text-sm text-red-600">
								{validationErrors.description}
							</p>
						)}
						<p className="mt-1 text-xs text-gray-500">
							{(formData.description || "").length}/500 caracteres
						</p>
					</div>

					{/* Icono */}
					<div className="mt-6">
						<label
							htmlFor="icon"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Icono (opcional)
						</label>
						<input
							type="text"
							id="icon"
							name="icon"
							value={formData.icon || ""}
							onChange={handleInputChange}
							className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
							placeholder="Ej: fas fa-laptop, lucide:computer, etc."
						/>
						<p className="mt-1 text-xs text-gray-500">
							Clase CSS del icono o nombre del icono a mostrar
						</p>
					</div>
				</div>

				{/* Estados */}
				<div className="bg-white rounded-lg shadow-sm p-6">
					<h2 className="text-lg font-medium text-gray-900 mb-6">Estados</h2>

					<div className="space-y-4">
						{/* Estado Activo */}
						<div className="flex items-center">
							<input
								type="checkbox"
								id="is_active"
								name="is_active"
								checked={formData.is_active}
								onChange={handleInputChange}
								className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
							/>
							<label
								htmlFor="is_active"
								className="ml-2 block text-sm text-gray-900 flex items-center"
							>
								<Eye className="h-4 w-4 mr-1" />
								Categoría activa
							</label>
						</div>
						<p className="text-xs text-gray-500 ml-6">
							Las categorías inactivas no aparecen en la tienda
						</p>

						{/* Estado Destacado */}
						<div className="flex items-center">
							<input
								type="checkbox"
								id="featured"
								name="featured"
								checked={formData.featured}
								onChange={handleInputChange}
								className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
							/>
							<label
								htmlFor="featured"
								className="ml-2 block text-sm text-gray-900 flex items-center"
							>
								<Star className="h-4 w-4 mr-1" />
								Categoría destacada
							</label>
						</div>
						<p className="text-xs text-gray-500 ml-6">
							Las categorías destacadas aparecen en secciones especiales
						</p>
					</div>
				</div>

				{/* Botones de acción */}
				<div className="bg-white rounded-lg shadow-sm p-6">
					<div className="flex justify-end space-x-4">
						<Link
							to="/admin/categories"
							className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
						>
							<X className="h-4 w-4 mr-2" />
							Cancelar
						</Link>
						<button
							type="submit"
							disabled={isSubmitting || loading}
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<Save className="h-4 w-4 mr-2" />
							{isSubmitting ? "Guardando..." : "Guardar Cambios"}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default AdminEditCategoryPage;
