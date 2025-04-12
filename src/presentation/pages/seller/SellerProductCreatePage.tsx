import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  X,
  Upload,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Palette,
  Ruler,
  Tag,
  DollarSign,
  PackageOpen,
  FileText,
  Image,
  Store,
  AlertTriangle
} from "lucide-react";
import useSellerProducts from "../../hooks/useSellerProducts";
import useCategoriesSelect from "../../hooks/useCategoriesSelect";

const SellerProductCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const { createProduct } = useSellerProducts();
  const {
    parentCategoryOptions,
    subcategoryOptions,
    selectedParentId,
    setSelectedParentId,
    loading: loadingCategories,
  } = useCategoriesSelect();

  // Estados para controlar las secciones expandidas
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    pricing: true,
    categorization: true,
    physical: false,
    variations: false,
    media: true,
    seo: false,
    advanced: false,
  });

  // Estado del formulario con todos los campos posibles
  const [formData, setFormData] = useState({
		// Información básica (requerida)
		name: "",
		description: "",
		short_description: "",

		// Categorización
		parentCategory: "",
		category: "",
		tags: [] as string[],
		currentTag: "",

		// Precios y stock
		price: "",
		stock: "",
		discount_percentage: "",

		// Características físicas
		weight: "",
		width: "",
		height: "",
		depth: "",
		dimensions: "",

		// Variaciones
		colors: [] as string[],
		currentColor: "",
		sizes: [] as string[],
		currentSize: "",

		// Atributos personalizados
		attributes: [] as Array<{key: string; value: string}>,
		currentAttributeKey: "",
		currentAttributeValue: "",

		// Multimedia
		images: [] as File[],
		previewImages: [] as string[],

		// Configuración avanzada
		status: "active",
		featured: false,
		published: true,
	});

  // Validación de campos requeridos
  const requiredFields = ["name", "description", "price", "stock", "category"];
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Toggle para expandir/colapsar secciones
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle input changes para campos simples
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Manejar checkboxes
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));

    // Si cambia la categoría padre, actualizar el estado para el filtrado de subcategorías
    if (name === "parentCategory" && value) {
      setSelectedParentId(parseInt(value));
      // Resetear la selección de subcategoría
      setFormData(prev => ({ ...prev, category: "" }));
    }
    
    // Limpiar errores de validación al cambiar un campo
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      const newPreviews = newImages.map(file => URL.createObjectURL(file));

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages],
        previewImages: [...prev.previewImages, ...newPreviews]
      }));
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    const newPreviews = [...formData.previewImages];

    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(newPreviews[index]);

    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    setFormData(prev => ({
      ...prev,
      images: newImages,
      previewImages: newPreviews
    }));
  };

  // Add tag
  const addTag = () => {
    if (
      formData.currentTag.trim() &&
      !formData.tags.includes(formData.currentTag.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.currentTag.trim()],
        currentTag: ""
      }));
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Handle tag input keydown
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  // Add color
  const addColor = () => {
    if (
      formData.currentColor.trim() &&
      !formData.colors.includes(formData.currentColor.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, prev.currentColor.trim()],
        currentColor: ""
      }));
    }
  };

  // Remove color
  const removeColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color)
    }));
  };

  // Handle color input keydown
  const handleColorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addColor();
    }
  };

  // Add size
  const addSize = () => {
    if (
      formData.currentSize.trim() &&
      !formData.sizes.includes(formData.currentSize.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, prev.currentSize.trim()],
        currentSize: ""
      }));
    }
  };

  // Remove size
  const removeSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(s => s !== size)
    }));
  };

  // Handle size input keydown
  const handleSizeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSize();
    }
  };

  // Add attribute
  const addAttribute = () => {
		const key = formData.currentAttributeKey.trim();
		const value = formData.currentAttributeValue.trim();

		if (key && value) {
			setFormData((prev) => ({
				...prev,
				attributes: [...prev.attributes, {key, value}],
				currentAttributeKey: "",
				currentAttributeValue: "",
			}));
		}
	};

  // Remove attribute
	const removeAttribute = (index: number) => {
		setFormData((prev) => {
			const newAttributes = [...prev.attributes];
			newAttributes.splice(index, 1);
			return {
				...prev,
				attributes: newAttributes,
			};
		});
	};
  // Handle attribute input keydown
  const handleAttributeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Mover el foco al campo de valor
      const valueInput = document.getElementById("attributeValue");
      if (valueInput) {
        valueInput.focus();
      }
    }
  };

  const handleAttributeValueKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAttribute();
    }
  };

  // Validar el formulario
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validar campos requeridos
    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        errors[field] = `El campo ${field} es obligatorio`;
      }
    });
    
    // Validar que el precio sea un número positivo
    if (formData.price && (isNaN(Number(formData.price)) || Number(formData.price) <= 0)) {
      errors.price = "El precio debe ser un número mayor que cero";
    }
    
    // Validar que el stock sea un número no negativo
    if (formData.stock && (isNaN(Number(formData.stock)) || Number(formData.stock) < 0)) {
      errors.stock = "El stock debe ser un número no negativo";
    }
    
    // Validar que el descuento sea un número entre 0 y 100
    if (formData.discount_percentage && 
       (isNaN(Number(formData.discount_percentage)) || 
        Number(formData.discount_percentage) < 0 || 
        Number(formData.discount_percentage) > 100)) {
      errors.discount_percentage = "El descuento debe ser un porcentaje entre 0 y 100";
    }
    
    // Validar dimensiones numéricas si se proporcionan
    ['weight', 'width', 'height', 'depth'].forEach(field => {
      const value = formData[field as keyof typeof formData] as string;
      if (value && isNaN(Number(value))) {
        errors[field] = `El campo ${field} debe ser un número`;
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario
    if (!validateForm()) {
      // Mostrar mensaje de error y detener la presentación
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      return;
    }
    
    setSaving(true);

    try {
      // Preparar datos para enviar a la API
      const productData = {
				name: formData.name,
				description: formData.description,
				short_description: formData.short_description || undefined,
				price: parseFloat(formData.price),
				stock: parseInt(formData.stock),
				category_id: parseInt(formData.category),
				categoryId: parseInt(formData.category), // Para compatibilidad con ambos formatos
				status: formData.status,
				tags: formData.tags.length > 0 ? formData.tags : undefined,
				images: formData.images.length > 0 ? formData.images : undefined,

				// Campos opcionales adicionales
				discount_percentage: formData.discount_percentage
					? parseFloat(formData.discount_percentage)
					: undefined,
				weight: formData.weight ? parseFloat(formData.weight) : undefined,
				width: formData.width ? parseFloat(formData.width) : undefined,
				height: formData.height ? parseFloat(formData.height) : undefined,
				depth: formData.depth ? parseFloat(formData.depth) : undefined,
				dimensions: formData.dimensions || undefined,
				colors: formData.colors.length > 0 ? formData.colors : undefined,
				sizes: formData.sizes.length > 0 ? formData.sizes : undefined,
				attributes:formData.attributes.length > 0 ? formData.attributes : undefined,
				featured: formData.featured,
				published: formData.published,
			};

      // Log para depuración
      console.log("Enviando datos de producto:", productData);

      // Crear producto
      const result = await createProduct(productData);

      if (result) {
        // Redirigir a la lista de productos
        navigate("/seller/products");
      } else {
        throw new Error("No se pudo crear el producto");
      }
    } catch (error) {
      console.error("Error al crear producto:", error);
      alert(error instanceof Error ? error.message : "Error al crear producto");
    } finally {
      setSaving(false);
    }
  };

  // Componente para los encabezados de sección
  const SectionHeader = ({ 
    title, 
    section, 
    icon: Icon 
  }: { 
    title: string; 
    section: keyof typeof expandedSections; 
    icon: React.ElementType 
  }) => (
    <div 
      className="flex items-center justify-between cursor-pointer py-3 border-b border-gray-200 dark:border-gray-700"
      onClick={() => toggleSection(section)}
    >
      <div className="flex items-center">
        <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      )}
    </div>
  );

  return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Añadir Nuevo Producto
				</h1>
				<div className="flex space-x-2">
					<button
						type="button"
						onClick={() => navigate("/seller/products")}
						className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
					>
						<X size={18} className="inline mr-1" /> Cancelar
					</button>
					<button
						type="button"
						onClick={handleSubmit}
						disabled={saving}
						className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{saving ? (
							<>
								<span className="inline-block animate-spin mr-1">⟳</span>{" "}
								Guardando...
							</>
						) : (
							<>
								<Save size={18} className="inline mr-1" /> Guardar Producto
							</>
						)}
					</button>
				</div>
			</div>

			{/* Tarjeta de campos requeridos */}
			<div className="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 p-4 rounded-r-lg mb-6">
				<div className="flex">
					<div className="flex-shrink-0">
						<AlertTriangle className="h-5 w-5 text-amber-500" />
					</div>
					<div className="ml-3">
						<h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
							Campos requeridos
						</h3>
						<div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
							<p>
								Los campos marcados con <span className="text-red-500">*</span>{" "}
								son obligatorios para crear el producto.
							</p>
						</div>
					</div>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Información Básica */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					<SectionHeader
						title="Información Básica"
						section="basic"
						icon={FileText}
					/>

					{expandedSections.basic && (
						<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Nombre del Producto */}
							<div className="md:col-span-2">
								<label
									htmlFor="name"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Nombre del Producto <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									id="name"
									name="name"
									value={formData.name}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border ${
										validationErrors.name
											? "border-red-500"
											: "border-gray-300 dark:border-gray-600"
									} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
								/>
								{validationErrors.name && (
									<p className="mt-1 text-sm text-red-500">
										{validationErrors.name}
									</p>
								)}
							</div>

							{/* Descripción Corta */}
							<div className="md:col-span-2">
								<label
									htmlFor="short_description"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Descripción Corta
								</label>
								<input
									type="text"
									id="short_description"
									name="short_description"
									value={formData.short_description}
									onChange={handleInputChange}
									placeholder="Resumen breve del producto (para listados y búsquedas)"
									className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
								/>
							</div>

							{/* Descripción Completa */}
							<div className="md:col-span-2">
								<label
									htmlFor="description"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Descripción Completa <span className="text-red-500">*</span>
								</label>
								<textarea
									id="description"
									name="description"
									rows={4}
									value={formData.description}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border ${
										validationErrors.description
											? "border-red-500"
											: "border-gray-300 dark:border-gray-600"
									} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
								/>
								{validationErrors.description && (
									<p className="mt-1 text-sm text-red-500">
										{validationErrors.description}
									</p>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Precios y Stock */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					<SectionHeader
						title="Precios y Stock"
						section="pricing"
						icon={DollarSign}
					/>

					{expandedSections.pricing && (
						<div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
							{/* Precio */}
							<div>
								<label
									htmlFor="price"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Precio ($) <span className="text-red-500">*</span>
								</label>
								<input
									type="number"
									id="price"
									name="price"
									min="0"
									step="0.01"
									value={formData.price}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border ${
										validationErrors.price
											? "border-red-500"
											: "border-gray-300 dark:border-gray-600"
									} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
								/>
								{validationErrors.price && (
									<p className="mt-1 text-sm text-red-500">
										{validationErrors.price}
									</p>
								)}
							</div>

							{/* Descuento */}
							<div>
								<label
									htmlFor="discount_percentage"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Descuento (%)
								</label>
								<input
									type="number"
									id="discount_percentage"
									name="discount_percentage"
									min="0"
									max="100"
									step="0.1"
									value={formData.discount_percentage}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border ${
										validationErrors.discount_percentage
											? "border-red-500"
											: "border-gray-300 dark:border-gray-600"
									} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
								/>
								{validationErrors.discount_percentage && (
									<p className="mt-1 text-sm text-red-500">
										{validationErrors.discount_percentage}
									</p>
								)}
							</div>

							{/* Stock */}
							<div>
								<label
									htmlFor="stock"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Cantidad en Stock <span className="text-red-500">*</span>
								</label>
								<input
									type="number"
									id="stock"
									name="stock"
									min="0"
									value={formData.stock}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border ${
										validationErrors.stock
											? "border-red-500"
											: "border-gray-300 dark:border-gray-600"
									} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
								/>
								{validationErrors.stock && (
									<p className="mt-1 text-sm text-red-500">
										{validationErrors.stock}
									</p>
								)}
							</div>

							{/* Estado del producto */}
							<div>
								<label
									htmlFor="status"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Estado del Producto
								</label>
								<select
									id="status"
									name="status"
									value={formData.status}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
								>
									<option value="active">Activo</option>
									<option value="inactive">Inactivo</option>
									<option value="draft">Borrador</option>
								</select>
							</div>
						</div>
					)}
				</div>

				{/* Categorización */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					<SectionHeader
						title="Categorización"
						section="categorization"
						icon={Tag}
					/>

					{expandedSections.categorization && (
						<div className="mt-4 space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Categoría Principal */}
								<div>
									<label
										htmlFor="parentCategory"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Categoría Principal <span className="text-red-500">*</span>
									</label>
									{loadingCategories ? (
										<div className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
											Cargando categorías...
										</div>
									) : (
										<select
											id="parentCategory"
											name="parentCategory"
											value={formData.parentCategory}
											onChange={handleInputChange}
											className={`w-full px-3 py-2 border ${
												validationErrors.parentCategory
													? "border-red-500"
													: "border-gray-300 dark:border-gray-600"
											} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
										>
											<option value="">Seleccionar Categoría Principal</option>
											{parentCategoryOptions.map((option) => (
												<option key={option.value} value={option.value}>
													{option.label}
												</option>
											))}
										</select>
									)}
									{validationErrors.parentCategory && (
										<p className="mt-1 text-sm text-red-500">
											{validationErrors.parentCategory}
										</p>
									)}
								</div>

								{/* Subcategoría */}
								<div className={formData.parentCategory ? "" : "opacity-50"}>
									<label
										htmlFor="category"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Subcategoría <span className="text-red-500">*</span>
									</label>
									<select
										id="category"
										name="category"
										value={formData.category}
										onChange={handleInputChange}
										disabled={!formData.parentCategory}
										className={`w-full px-3 py-2 border ${
											validationErrors.category
												? "border-red-500"
												: "border-gray-300 dark:border-gray-600"
										} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-700`}
									>
										<option value="">
											{formData.parentCategory
												? subcategoryOptions.length > 0
													? "Seleccionar Subcategoría"
													: "No hay subcategorías disponibles"
												: "Primero selecciona una categoría principal"}
										</option>
										{subcategoryOptions.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
										{/* Opción para usar la categoría principal si no hay subcategorías */}
										{formData.parentCategory &&
											subcategoryOptions.length === 0 && (
												<option value={formData.parentCategory}>
													Usar categoría principal
												</option>
											)}
									</select>
									{validationErrors.category && (
										<p className="mt-1 text-sm text-red-500">
											{validationErrors.category}
										</p>
									)}
								</div>
							</div>

							{/* Etiquetas (Tags) */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Etiquetas (Tags)
								</label>
								<div className="flex">
									<input
										type="text"
										placeholder="Añade una etiqueta y presiona Enter"
										value={formData.currentTag}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												currentTag: e.target.value,
											}))
										}
										onKeyDown={handleTagKeyDown}
										className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
									/>
									<button
										type="button"
										onClick={addTag}
										className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
									>
										<Plus size={18} />
									</button>
								</div>
								<div className="flex flex-wrap gap-2 mt-2">
									{formData.tags.map((tag) => (
										<div
											key={tag}
											className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-md flex items-center"
										>
											<span>{tag}</span>
											<button
												type="button"
												onClick={() => removeTag(tag)}
												className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
											>
												<X size={14} />
											</button>
										</div>
									))}
									{formData.tags.length === 0 && (
										<p className="text-sm text-gray-500 dark:text-gray-400">
											Aún no se han añadido etiquetas
										</p>
									)}
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Características Físicas */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					<SectionHeader
						title="Características Físicas"
						section="physical"
						icon={PackageOpen}
					/>

					{expandedSections.physical && (
						<div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{/* Peso */}
							<div>
								<label
									htmlFor="weight"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Peso (kg)
								</label>
								<input
									type="number"
									id="weight"
									name="weight"
									min="0"
									step="0.001"
									value={formData.weight}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border ${
										validationErrors.weight
											? "border-red-500"
											: "border-gray-300 dark:border-gray-600"
									} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
								/>
								{validationErrors.weight && (
									<p className="mt-1 text-sm text-red-500">
										{validationErrors.weight}
									</p>
								)}
							</div>

							{/* Ancho */}
							<div>
								<label
									htmlFor="width"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Ancho (cm)
								</label>
								<input
									type="number"
									id="width"
									name="width"
									min="0"
									step="0.1"
									value={formData.width}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border ${
										validationErrors.width
											? "border-red-500"
											: "border-gray-300 dark:border-gray-600"
									} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
								/>
								{validationErrors.width && (
									<p className="mt-1 text-sm text-red-500">
										{validationErrors.width}
									</p>
								)}
							</div>

							{/* Alto */}
							<div>
								<label
									htmlFor="height"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Alto (cm)
								</label>
								<input
									type="number"
									id="height"
									name="height"
									min="0"
									step="0.1"
									value={formData.height}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border ${
										validationErrors.height
											? "border-red-500"
											: "border-gray-300 dark:border-gray-600"
									} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
								/>
								{validationErrors.height && (
									<p className="mt-1 text-sm text-red-500">
										{validationErrors.height}
									</p>
								)}
							</div>

							{/* Profundidad */}
							<div>
								<label
									htmlFor="depth"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Profundidad (cm)
								</label>
								<input
									type="number"
									id="depth"
									name="depth"
									min="0"
									step="0.1"
									value={formData.depth}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border ${
										validationErrors.depth
											? "border-red-500"
											: "border-gray-300 dark:border-gray-600"
									} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
								/>
								{validationErrors.depth && (
									<p className="mt-1 text-sm text-red-500">
										{validationErrors.depth}
									</p>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Variaciones */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					<SectionHeader
						title="Variaciones y Atributos"
						section="variations"
						icon={Palette}
					/>

					{expandedSections.variations && (
						<div className="mt-4 space-y-8">
							{/* Colores */}
							<div>
								<h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
									<Palette className="w-4 h-4 mr-1" /> Colores Disponibles
								</h4>
								<div className="flex">
									<input
										type="text"
										placeholder="Añade un color y presiona Enter"
										value={formData.currentColor}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												currentColor: e.target.value,
											}))
										}
										onKeyDown={handleColorKeyDown}
										className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
									/>
									<button
										type="button"
										onClick={addColor}
										className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
									>
										<Plus size={18} />
									</button>
								</div>
								<div className="flex flex-wrap gap-2 mt-2">
									{formData.colors.map((color) => (
										<div
											key={color}
											className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-md flex items-center"
										>
											<span>{color}</span>
											<button
												type="button"
												onClick={() => removeColor(color)}
												className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
											>
												<X size={14} />
											</button>
										</div>
									))}
									{formData.colors.length === 0 && (
										<p className="text-sm text-gray-500 dark:text-gray-400">
											Aún no se han añadido colores
										</p>
									)}
								</div>
							</div>

							{/* Tallas */}
							<div>
								<h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
									<Ruler className="w-4 h-4 mr-1" /> Tallas Disponibles
								</h4>
								<div className="flex">
									<input
										type="text"
										placeholder="Añade una talla y presiona Enter"
										value={formData.currentSize}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												currentSize: e.target.value,
											}))
										}
										onKeyDown={handleSizeKeyDown}
										className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
									/>
									<button
										type="button"
										onClick={addSize}
										className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
									>
										<Plus size={18} />
									</button>
								</div>
								<div className="flex flex-wrap gap-2 mt-2">
									{formData.sizes.map((size) => (
										<div
											key={size}
											className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-md flex items-center"
										>
											<span>{size}</span>
											<button
												type="button"
												onClick={() => removeSize(size)}
												className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
											>
												<X size={14} />
											</button>
										</div>
									))}
									{formData.sizes.length === 0 && (
										<p className="text-sm text-gray-500 dark:text-gray-400">
											Aún no se han añadido tallas
										</p>
									)}
								</div>
							</div>

							{/* Atributos personalizados */}
							<div>
								<h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
									<Store className="w-4 h-4 mr-1" /> Atributos Personalizados
								</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
									<input
										type="text"
										id="attributeKey"
										placeholder="Nombre del atributo (ej: Material)"
										value={formData.currentAttributeKey}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												currentAttributeKey: e.target.value,
											}))
										}
										onKeyDown={handleAttributeKeyDown}
										className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
									/>
									<div className="flex">
										<input
											type="text"
											id="attributeValue"
											placeholder="Valor (ej: Algodón)"
											value={formData.currentAttributeValue}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													currentAttributeValue: e.target.value,
												}))
											}
											onKeyDown={handleAttributeValueKeyDown}
											className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
										/>
										<button
											type="button"
											onClick={addAttribute}
											className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
										>
											<Plus size={18} />
										</button>
									</div>
								</div>

								{/* Lista de atributos */}
								<div className="mt-4">
									{formData.attributes.length > 0 ? (
										<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
											<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
												<thead>
													<tr>
														<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
															Atributo
														</th>
														<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
															Valor
														</th>
														<th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
															Acción
														</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-gray-200 dark:divide-gray-600">
													{formData.attributes.map((attr, index) => (
														<tr key={index}>
															<td className="px-3 py-2 text-sm text-gray-800 dark:text-gray-200">
																{attr.key}
															</td>
															<td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
																{attr.value}
															</td>
															<td className="px-3 py-2 text-right">
																<button
																	type="button"
																	onClick={() => removeAttribute(index)}
																	className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
																>
																	<X size={16} />
																</button>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									) : (
										<p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
											Aún no se han añadido atributos personalizados
										</p>
									)}
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Imágenes */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					<SectionHeader
						title="Imágenes del Producto"
						section="media"
						icon={Image}
					/>

					{expandedSections.media && (
						<div className="mt-4 space-y-4">
							{/* Image Uploader */}
							<div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
								<input
									type="file"
									id="images"
									accept="image/*"
									multiple
									onChange={handleImageUpload}
									className="hidden"
								/>
								<label
									htmlFor="images"
									className="cursor-pointer flex flex-col items-center justify-center"
								>
									<Upload className="h-12 w-12 text-gray-400 mb-2" />
									<p className="text-gray-600 dark:text-gray-400 mb-1">
										Arrastra y suelta imágenes aquí o haz clic para subir
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-500">
										JPEG, PNG, WebP hasta 5MB
									</p>
								</label>
							</div>

							{/* Image Previews */}
							{formData.previewImages.length > 0 && (
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
									{formData.previewImages.map((preview, index) => (
										<div key={index} className="relative group">
											<div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
												<img
													src={preview}
													alt={`Vista previa ${index + 1}`}
													className="h-full w-full object-cover object-center"
												/>
											</div>
											<button
												type="button"
												onClick={() => removeImage(index)}
												className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
											>
												<Trash2 size={14} />
											</button>
											{index === 0 && (
												<div className="absolute bottom-2 left-2 bg-primary-500 text-white text-xs py-1 px-2 rounded-md">
													Principal
												</div>
											)}
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>

				{/* Submit Button - Bottom */}
				<div className="flex justify-end">
					<button
						type="submit"
						disabled={saving}
						className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{saving ? "Guardando..." : "Guardar Producto"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default SellerProductCreatePage;