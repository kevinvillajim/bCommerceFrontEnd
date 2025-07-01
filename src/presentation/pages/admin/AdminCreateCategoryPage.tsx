import React, {useState, useEffect} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
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
} from "lucide-react";
import {Link} from "react-router-dom";

// Hooks personalizados
import {useAdminCategories} from "../../hooks/useAdminCategories";

// Types
import type {CategoryCreationData} from "../../../core/domain/entities/Category";

const AdminCreateCategoryPage: React.FC = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const parentId = searchParams.get("parent");

	// Hook de administración de categorías
	const {
		loading,
		error,
		mainCategories,
		fetchMainCategories,
		createCategory,
		setError,
	} = useAdminCategories();

	// Estado del formulario
	const [formData, setFormData] = useState<CategoryCreationData>({
		name: "",
		slug: "",
		description: "",
		parent_id: parentId ? Number(parentId) : undefined,
		icon: "",
		order: 0,
		is_active: true,
		featured: false,
	});

	// Estado de validación
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Cargar datos iniciales
	useEffect(() => {
		loadMainCategories();
	}, []);

	/**
	 * Carga las categorías principales para el selector de padre
	 */
	const loadMainCategories = async () => {
		try {
			await fetchMainCategories(true);
		} catch (error) {
			console.error("Error al cargar categorías principales:", error);
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

		// Generar slug automáticamente cuando cambie el nombre
		if (name === "name" && value) {
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
			const dataToSubmit: CategoryCreationData = {
				...formData,
				// Limpiar campos vacíos
				description: formData.description?.trim() || undefined,
				icon: formData.icon?.trim() || undefined,
				parent_id: formData.parent_id === 0 ? undefined : formData.parent_id,
			};

			console.log("📤 Enviando datos de categoría:", dataToSubmit);

			const result = await createCategory(dataToSubmit);

			if (result) {
				console.log("✅ Categoría creada exitosamente:", result);
				// Redirigir a la lista de categorías
				navigate("/admin/categories", {
					state: {message: `Categoría "${result.name}" creada exitosamente`},
				});
			} else {
				setError("Error al crear la categoría. Inténtalo de nuevo.");
			}
		} catch (error) {
			console.error("❌ Error al crear categoría:", error);
			setError(
				error instanceof Error
					? error.message
					: "Error inesperado al crear la categoría"
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
							Nueva Categoría
						</h1>
						{parentId && (
							<p className="text-sm text-gray-600 mt-1">
								Subcategoría de: {getParentCategoryName(Number(parentId))}
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
								Se genera automáticamente desde el nombre. Solo letras
								minúsculas, números y guiones.
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
								className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
							>
								<option value={0}>Sin categoría padre (principal)</option>
								{mainCategories.map((category) => (
									<option key={category.id} value={category.id}>
										{category.name}
									</option>
								))}
							</select>
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
							className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<Save className="h-4 w-4 mr-2" />
							{isSubmitting ? "Creando..." : "Crear Categoría"}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default AdminCreateCategoryPage;
