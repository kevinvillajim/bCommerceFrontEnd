import React, {useState, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
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
	Loader,
} from "lucide-react";
import useSellerProducts from "../../hooks/useSellerProducts";
import useCategoriesSelect from "../../hooks/useCategoriesSelect";
import appConfig from "../../../config/appConfig";
import type {ProductImage} from "../../../core/domain/entities/Product";

// ✅ CORREGIDO - Interfaz de estado del formulario corregida
interface FormDataState {
	// Información básica (requerida)
	name: string;
	description: string;
	short_description: string;

	// Categorización
	parentCategory: string;
	category: string;
	tags: string[];
	currentTag: string;

	// Precios y stock
	price: string;
	stock: string;
	discount_percentage: string;

	// Características físicas
	weight: string;
	width: string;
	height: string;
	depth: string;
	dimensions: string;

	// Variaciones
	colors: string[];
	currentColor: string;
	sizes: string[];
	currentSize: string;

	// Atributos personalizados
	attributes: Array<{key: string; value: string}>;
	currentAttributeKey: string;
	currentAttributeValue: string;

	// Multimedia - ✅ CORREGIDO
	images: File[];
	existingImages: ProductImage[]; // Usar ProductImage en lugar de tipo inline
	previewImages: string[];
	imagesToRemove: number[];

	// Configuración avanzada
	status: string;
	featured: boolean;
	published: boolean;
}

const SellerProductEditPage: React.FC = () => {
	const navigate = useNavigate();
	const {id} = useParams<{id: string}>();
	const productId = id ? parseInt(id) : 0;

	const [isLoading, setIsLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const {updateProduct, fetchProductById} = useSellerProducts();
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

	// ✅ CORREGIDO - Estado del formulario con tipo explícito
	const [formData, setFormData] = useState<FormDataState>({
		// Información básica (requerida)
		name: "",
		description: "",
		short_description: "",

		// Categorización
		parentCategory: "",
		category: "",
		tags: [],
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
		colors: [],
		currentColor: "",
		sizes: [],
		currentSize: "",

		// Atributos personalizados
		attributes: [],
		currentAttributeKey: "",
		currentAttributeValue: "",

		// Multimedia
		images: [],
		existingImages: [],
		previewImages: [],
		imagesToRemove: [],

		// Configuración avanzada
		status: "active",
		featured: false,
		published: true,
	});

	// Validación de campos requeridos
	const requiredFields = ["name", "description", "price", "stock", "category"];
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});

	// Cargar datos del producto al montar el componente
	useEffect(() => {
		const loadProductData = async () => {
			if (!productId) {
				navigate("/seller/products");
				return;
			}

			try {
				setIsLoading(true);
				const product = await fetchProductById(productId);

				if (!product) {
					throw new Error("No se pudo obtener la información del producto");
				}

				console.log("Producto recibido:", product);
				console.log("Category ID:", product.category_id);
				console.log("Category:", product.category);

				// ✅ CORREGIDO - Manejar parent_id de categoria apropiadamente
				let parentCategoryId = product.category?.parent_id;
				let categoryId = product.category_id;

				// Si la categoría no tiene padre, entonces es una categoría principal
				if (!parentCategoryId) {
					parentCategoryId = categoryId;
				}

				console.log("⭐ Valores de categoría actualizados:", {
					parentCategoryId,
					categoryId,
					categoryIdType: typeof categoryId,
					parentCategoryIdType: typeof parentCategoryId,
				});

				// Importante: Actualizar selectedParentId antes de establecer formData
				if (parentCategoryId) {
					setSelectedParentId(Number(parentCategoryId));
				}

				// Pequeña pausa para permitir que selectedParentId se actualice
				await new Promise((resolve) => setTimeout(resolve, 10));

				// Procesar arrays que vienen como strings (colores, tamaños, etiquetas)
				const processArray = (data: any[]): string[] => {
					if (!Array.isArray(data) || data.length === 0) return [];

					// Para el formato específico que viene en la respuesta:
					// Cuando los arrays vienen fragmentados como ['[\"rojo\"', '\"negro\"', '\"blanco\"]']
					if (
						data.some((item) => typeof item === "string" && item.includes('"'))
					) {
						const combinedString = data.join("");
						const matches = combinedString.match(/\"([^\"]+)\"/g) || [];
						return matches.map((m) => m.replace(/"/g, ""));
					}

					// Para arrays normales
					return data
						.map((item) =>
							typeof item === "string"
								? item.replace(/[\[\]"\\]/g, "").trim()
								: String(item)
						)
						.filter(Boolean);
				};

				// ✅ CORREGIDO - Configurar el estado inicial con tipos seguros
				setFormData((prev) => {
					console.log("Actualizando formData con valores:", {
						parentCategory: String(parentCategoryId),
						category: String(categoryId),
					});

					return {
						...prev,
						name: product.name || "",
						description: product.description || "",
						short_description: product.shortDescription || "",
						price: product.price ? product.price.toString() : "",
						stock: product.stock ? product.stock.toString() : "",
						discount_percentage: product.discount_percentage
							? product.discount_percentage.toString()
							: "",
						weight: product.weight ? product.weight.toString() : "",
						width: product.width ? product.width.toString() : "",
						height: product.height ? product.height.toString() : "",
						depth: product.depth ? product.depth.toString() : "",
						dimensions: product.dimensions || "",
						status: product.status || "active",
						featured: !!product.featured,
						published: !!product.published,
						parentCategory: parentCategoryId ? String(parentCategoryId) : "",
						category: categoryId ? String(categoryId) : "",
						// Procesar arrays que podrían venir en formato incorrecto
						tags: processArray(product.tags || []),
						colors: processArray(product.colors || []),
						sizes: processArray(product.sizes || []),
						// Parsear los atributos correctamente
						attributes: Array.isArray(product.attributes)
							? product.attributes
							: typeof product.attributes === "string" && product.attributes
								? (() => {
										try {
											return JSON.parse(product.attributes);
										} catch (e) {
											console.error("Error al parsear atributos:", e);
											return [];
										}
									})()
								: [],
						// ✅ CORREGIDO - Procesar imágenes existentes de manera segura
						existingImages: Array.isArray(product.images)
							? product.images.map((img): ProductImage => {
									if (typeof img === "string") {
										return {
											original: img,
											thumbnail: img,
											medium: img,
											large: img,
										};
									} else {
										// img ya es ProductImage, asegurar que tiene todas las propiedades
										return {
											id: img.id,
											original: img.original || "",
											thumbnail: img.thumbnail || img.original || "",
											medium: img.medium || img.original || "",
											large: img.large || img.original || "",
											alt: img.alt,
											position: img.position,
										};
									}
								})
							: [],
						images: [],
						previewImages: Array.isArray(product.images)
							? product.images.map((img) => {
									const baseUrl = appConfig.imageBaseUrl; // URL base para imágenes
									let imagePath;

									if (typeof img === "string") {
										imagePath = img;
									} else {
										// Obtener ruta de imagen
										imagePath = img.original || img.medium || img.thumbnail;
									}

									// Asegurarnos de que la ruta esté completa
									if (imagePath && !imagePath.startsWith("http")) {
										return `${baseUrl}${imagePath}`;
									}
									return imagePath || "";
								})
							: [],
						imagesToRemove: [],
					};
				});
			} catch (error) {
				console.error("Error al cargar los datos del producto:", error);
				alert("No se pudo cargar el producto. Inténtalo de nuevo más tarde.");
				navigate("/seller/products");
			} finally {
				setIsLoading(false);
			}
		};

		loadProductData();
	}, [productId, navigate, fetchProductById]);

	useEffect(() => {
		// Solo ejecutar si tenemos la categoría ya cargada y selectedParentId cambia
		if (!isLoading && formData.category) {
			console.log("selectedParentId cambió a:", selectedParentId);

			// Actualiza el formData con el nuevo selectedParentId como categoría padre
			if (selectedParentId) {
				setFormData((prev) => ({
					...prev,
					parentCategory: String(selectedParentId),
				}));
			}
		}
	}, [selectedParentId, isLoading]);

	// Toggle para expandir/colapsar secciones
	const toggleSection = (section: keyof typeof expandedSections) => {
		setExpandedSections((prev) => ({
			...prev,
			[section]: !prev[section],
		}));
	};

	// Agregar console.log en handleInputChange para verificar actualizaciones
	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const {name, value, type} = e.target;

		// Manejar checkboxes
		if (type === "checkbox") {
			const checked = (e.target as HTMLInputElement).checked;
			setFormData((prev) => {
				const updatedFormData = {...prev, [name]: checked};
				console.log(
					"handleInputChange - Checkbox actualizado:",
					updatedFormData
				);
				return updatedFormData;
			});
			return;
		}

		// ✅ CORREGIDO - Usar type assertion para acceder a propiedades del estado
		setFormData((prev) => {
			const updatedFormData = {...prev, [name as keyof FormDataState]: value};
			console.log("handleInputChange - Input actualizado:", updatedFormData);
			return updatedFormData;
		});

		// Si cambia la categoría padre, actualizar el estado para el filtrado de subcategorías
		if (name === "parentCategory" && value) {
			setSelectedParentId(parseInt(value));
			// Resetear la selección de subcategoría
			setFormData((prev) => {
				const updatedFormData = {...prev, category: ""};
				console.log(
					"handleInputChange - parentCategory cambiado, subcategoría reseteada:",
					updatedFormData
				);
				return updatedFormData;
			});
		}

		// Limpiar errores de validación al cambiar un campo
		if (validationErrors[name]) {
			setValidationErrors((prev) => {
				const newErrors = {...prev};
				delete newErrors[name];
				console.log(
					"handleInputChange - Error de validación eliminado para:",
					name
				);
				return newErrors;
			});
		}
	};

	// Handle image upload
	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const newImages = Array.from(e.target.files);
			const newPreviews = newImages.map((file) => URL.createObjectURL(file));

			setFormData((prev) => ({
				...prev,
				images: [...prev.images, ...newImages],
				previewImages: [...prev.previewImages, ...newPreviews],
			}));
		}
	};

	// Remove new image
	const removeNewImage = (index: number) => {
		const newImages = [...formData.images];
		const newPreviews = [...formData.previewImages];

		// Revoke object URL to prevent memory leaks
		URL.revokeObjectURL(newPreviews[index]);

		newImages.splice(index, 1);
		newPreviews.splice(index, 1);

		setFormData((prev) => ({
			...prev,
			images: newImages,
			previewImages: newPreviews,
		}));
	};

	// Remove existing image
	const removeExistingImage = (index: number) => {
		const updatedExistingImages = [...formData.existingImages];
		const removedImage = updatedExistingImages[index];

		// Si la imagen tiene ID, la añadimos a la lista para eliminarla en el servidor
		if (removedImage.id) {
			setFormData((prev) => ({
				...prev,
				imagesToRemove: [...prev.imagesToRemove, removedImage.id as number],
			}));
		}

		updatedExistingImages.splice(index, 1);

		setFormData((prev) => ({
			...prev,
			existingImages: updatedExistingImages,
		}));
	};

	// Add tag
	const addTag = () => {
		if (
			formData.currentTag.trim() &&
			!formData.tags.includes(formData.currentTag.trim())
		) {
			setFormData((prev) => ({
				...prev,
				tags: [...prev.tags, prev.currentTag.trim()],
				currentTag: "",
			}));
		}
	};

	// Remove tag
	const removeTag = (tag: string) => {
		setFormData((prev) => ({
			...prev,
			tags: prev.tags.filter((t) => t !== tag),
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
			setFormData((prev) => ({
				...prev,
				colors: [...prev.colors, formData.currentColor.trim()],
				currentColor: "",
			}));
		}
	};

	// Remove color
	const removeColor = (color: string) => {
		setFormData((prev) => ({
			...prev,
			colors: prev.colors.filter((c) => c !== color),
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
			setFormData((prev) => ({
				...prev,
				sizes: [...prev.sizes, formData.currentSize.trim()],
				currentSize: "",
			}));
		}
	};

	// Remove size
	const removeSize = (size: string) => {
		setFormData((prev) => ({
			...prev,
			sizes: prev.sizes.filter((s) => s !== size),
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

	const handleAttributeValueKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>
	) => {
		if (e.key === "Enter") {
			e.preventDefault();
			addAttribute();
		}
	};

	// Validar el formulario
	const validateForm = (): boolean => {
		const errors: Record<string, string> = {};

		// Validar campos requeridos
		requiredFields.forEach((field) => {
			const value = formData[field as keyof FormDataState];
			if (!value) {
				errors[field] = `El campo ${field} es obligatorio`;
			}
		});

		// Validar que el precio sea un número positivo
		if (
			formData.price &&
			(isNaN(Number(formData.price)) || Number(formData.price) <= 0)
		) {
			errors.price = "El precio debe ser un número mayor que cero";
		}

		// Validar que el stock sea un número no negativo
		if (
			formData.stock &&
			(isNaN(Number(formData.stock)) || Number(formData.stock) < 0)
		) {
			errors.stock = "El stock debe ser un número no negativo";
		}

		// Validar que el descuento sea un número entre 0 y 100
		if (
			formData.discount_percentage &&
			(isNaN(Number(formData.discount_percentage)) ||
				Number(formData.discount_percentage) < 0 ||
				Number(formData.discount_percentage) > 100)
		) {
			errors.discount_percentage =
				"El descuento debe ser un porcentaje entre 0 y 100";
		}

		// Validar dimensiones numéricas si se proporcionan
		(["weight", "width", "height", "depth"] as const).forEach((field) => {
			const value = formData[field];
			if (value && isNaN(Number(value))) {
				errors[field] = `El campo ${field} debe ser un número`;
			}
		});

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	// Asegurar que los datos enviados al backend estén completos y en el formato correcto
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validar formulario
		if (!validateForm()) {
			const firstErrorField = Object.keys(validationErrors)[0];
			const errorElement = document.getElementById(firstErrorField);
			if (errorElement) {
				errorElement.scrollIntoView({behavior: "smooth", block: "center"});
				errorElement.focus();
			}
			return;
		}

		setSaving(true);

		try {
			// Preparar datos para enviar a la API
			const productData = {
				id: productId,
				name: formData.name,
				description: formData.description,
				short_description: formData.short_description || undefined,
				price: parseFloat(formData.price),
				stock: parseInt(formData.stock),
				category_id: parseInt(formData.category),
				status: formData.status,
				tags: formData.tags,
				discount_percentage: formData.discount_percentage
					? parseFloat(formData.discount_percentage)
					: undefined,
				weight: formData.weight ? parseFloat(formData.weight) : undefined,
				width: formData.width ? parseFloat(formData.width) : undefined,
				height: formData.height ? parseFloat(formData.height) : undefined,
				depth: formData.depth ? parseFloat(formData.depth) : undefined,
				colors: formData.colors,
				sizes: formData.sizes,
				featured: formData.featured,
				published: formData.published,
				replace_images: false, // Asegurar que este campo esté presente
			};

			// Log para depuración
			console.log("Datos enviados al backend:", productData);

			// Actualizar producto
			const result = await updateProduct(productData);

			if (result) {
				console.log(
					"Respuesta del servidor después de la actualización:",
					result
				);
				
				// 🔄 SOLUCIÓN: Delay antes de navegar para permitir que la DB se actualice
				console.log("✅ Producto actualizado, navegando en 1 segundo...");
				setTimeout(() => {
					// Navegar con estado que indique que se actualizó un producto
					navigate("/seller/products", { 
						state: { 
							updatedProduct: true,
							productId: productId,
							timestamp: Date.now()
						} 
					});
				}, 1000);
			} else {
				throw new Error("No se pudo actualizar el producto");
			}
		} catch (error) {
			console.error("❌ Error al actualizar producto:", error);
			alert(
				error instanceof Error ? error.message : "Error al actualizar producto"
			);
		} finally {
			setSaving(false);
		}
	};

	const SectionHeader = ({
		title,
		section,
		icon: Icon,
	}: {
		title: string;
		section: keyof typeof expandedSections;
		icon: React.ElementType;
	}) => (
		<div
			className="flex items-center justify-between cursor-pointer py-3 border-b border-gray-200"
			onClick={() => toggleSection(section)}
		>
			<div className="flex items-center">
				<Icon className="w-5 h-5 text-primary-600 mr-2" />
				<h3 className="text-lg font-medium text-gray-900">{title}</h3>
			</div>
			{expandedSections[section] ? (
				<ChevronUp className="w-5 h-5 text-gray-500" />
			) : (
				<ChevronDown className="w-5 h-5 text-gray-500" />
			)}
		</div>
	);

	// Si está cargando, mostrar pantalla de carga
	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center h-64">
				<Loader className="w-12 h-12 text-primary-600 animate-spin mb-4" />
				<p className="text-gray-600 text-lg">Cargando datos del producto...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900">
					Editar Producto: {formData.name}
				</h1>
				<div className="flex space-x-2">
					<button
						type="button"
						onClick={() => navigate("/seller/products")}
						className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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
								<Save size={18} className="inline mr-1" /> Guardar Cambios
							</>
						)}
					</button>
				</div>
			</div>

			{/* Formulario de edición */}
			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Información básica */}
				<div className="bg-white rounded-lg shadow-sm p-6">
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
									className="block text-sm font-medium text-gray-700 mb-1"
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
										validationErrors.name ? "border-red-500" : "border-gray-300"
									} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
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
									className="block text-sm font-medium text-gray-700 mb-1"
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
									className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
								/>
							</div>

							{/* Descripción Completa */}
							<div className="md:col-span-2">
								<label
									htmlFor="description"
									className="block text-sm font-medium text-gray-700 mb-1"
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
											: "border-gray-300"
									} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
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
				<div className="bg-white rounded-lg shadow-sm p-6">
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
									className="block text-sm font-medium text-gray-700 mb-1"
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
											: "border-gray-300"
									} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
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
									className="block text-sm font-medium text-gray-700 mb-1"
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
											: "border-gray-300"
									} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
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
									className="block text-sm font-medium text-gray-700 mb-1"
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
											: "border-gray-300"
									} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
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
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Estado del Producto
								</label>
								<select
									id="status"
									name="status"
									value={formData.status}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
				<div className="bg-white rounded-lg shadow-sm p-6">
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
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Categoría Principal <span className="text-red-500">*</span>
									</label>
									{loadingCategories ? (
										<div className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-400">
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
													: "border-gray-300"
											} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
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
										className="block text-sm font-medium text-gray-700 mb-1"
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
												: "border-gray-300"
										} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
									>
										{!formData.category && (
											<option value="">
												{!formData.parentCategory
													? "Primero selecciona una categoría principal"
													: subcategoryOptions.length > 0
														? "Seleccionar Subcategoría"
														: "No hay subcategorías disponibles"}
											</option>
										)}

										{/* Opciones de subcategorías */}
										{subcategoryOptions.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}

										{/* Opción de usar categoría principal */}
										{formData.parentCategory && (
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
								<label className="block text-sm font-medium text-gray-700 mb-2">
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
										className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
											className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md flex items-center"
										>
											<span>{tag}</span>
											<button
												type="button"
												onClick={() => removeTag(tag)}
												className="ml-1 text-gray-500 hover:text-gray-700"
											>
												<X size={14} />
											</button>
										</div>
									))}
									{formData.tags.length === 0 && (
										<p className="text-sm text-gray-500">
											Aún no se han añadido etiquetas
										</p>
									)}
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Características Físicas */}
				<div className="bg-white rounded-lg shadow-sm p-6">
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
									className="block text-sm font-medium text-gray-700 mb-1"
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
											: "border-gray-300"
									} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
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
									className="block text-sm font-medium text-gray-700 mb-1"
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
											: "border-gray-300"
									} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
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
									className="block text-sm font-medium text-gray-700 mb-1"
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
											: "border-gray-300"
									} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
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
									className="block text-sm font-medium text-gray-700 mb-1"
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
											: "border-gray-300"
									} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
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
				<div className="bg-white rounded-lg shadow-sm p-6">
					<SectionHeader
						title="Variaciones y Atributos"
						section="variations"
						icon={Palette}
					/>

					{expandedSections.variations && (
						<div className="mt-4 space-y-8">
							{/* Colores */}
							<div>
								<h4 className="text-md font-medium text-gray-800 mb-2 flex items-center">
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
										className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
											className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md flex items-center"
										>
											<span>{color}</span>
											<button
												type="button"
												onClick={() => removeColor(color)}
												className="ml-1 text-gray-500 hover:text-gray-700"
											>
												<X size={14} />
											</button>
										</div>
									))}
									{formData.colors.length === 0 && (
										<p className="text-sm text-gray-500">
											Aún no se han añadido colores
										</p>
									)}
								</div>
							</div>

							{/* Tallas */}
							<div>
								<h4 className="text-md font-medium text-gray-800 mb-2 flex items-center">
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
										className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
											className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md flex items-center"
										>
											<span>{size}</span>
											<button
												type="button"
												onClick={() => removeSize(size)}
												className="ml-1 text-gray-500 hover:text-gray-700"
											>
												<X size={14} />
											</button>
										</div>
									))}
									{formData.sizes.length === 0 && (
										<p className="text-sm text-gray-500">
											Aún no se han añadido tallas
										</p>
									)}
								</div>
							</div>

							{/* Atributos personalizados */}
							<div>
								<h4 className="text-md font-medium text-gray-800 mb-2 flex items-center">
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
										className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
											className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
										<div className="bg-gray-50 p-4 rounded-md">
											<table className="min-w-full divide-y divide-gray-200">
												<thead>
													<tr>
														<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
															Atributo
														</th>
														<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
															Valor
														</th>
														<th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
															Acción
														</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-gray-200">
													{formData.attributes.map((attr, index) => (
														<tr key={index}>
															<td className="px-3 py-2 text-sm text-gray-800">
																{attr.key}
															</td>
															<td className="px-3 py-2 text-sm text-gray-600">
																{attr.value}
															</td>
															<td className="px-3 py-2 text-right">
																<button
																	type="button"
																	onClick={() => removeAttribute(index)}
																	className="text-red-600 hover:text-red-800"
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
										<p className="text-sm text-gray-500 mt-2">
											Aún no se han añadido atributos personalizados
										</p>
									)}
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Imágenes */}
				<div className="bg-white rounded-lg shadow-sm p-6">
					<SectionHeader
						title="Imágenes del Producto"
						section="media"
						icon={Image}
					/>

					{expandedSections.media && (
						<div className="mt-4 space-y-4">
							{/* Image Uploader */}
							<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
									<p className="text-gray-600 mb-1">
										Arrastra y suelta imágenes aquí o haz clic para subir
									</p>
									<p className="text-xs text-gray-500">
										JPEG, PNG, WebP hasta 2MB
									</p>
								</label>
							</div>

							{/* Imágenes existentes */}
							{formData.existingImages.length > 0 && (
								<div>
									<h4 className="text-md font-medium text-gray-800 mb-3">
										Imágenes actuales
									</h4>
									<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
										{formData.existingImages.map((image, index) => {
											// Construir URL de imagen completa
											const baseUrl = appConfig.imageBaseUrl;
											let imagePath =
												image.original || image.medium || image.thumbnail;
											const imageUrl =
												imagePath && imagePath.startsWith("http")
													? imagePath
													: `${baseUrl}${imagePath}`;

											return (
												<div
													key={`existing-${index}`}
													className="relative group"
												>
													<div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
														<img
															src={imageUrl}
															alt={
																formData.name || `Imagen existente ${index + 1}`
															}
															className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
														/>
													</div>
													<button
														type="button"
														onClick={() => removeExistingImage(index)}
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
											);
										})}
									</div>
								</div>
							)}

							{/* Nuevas imágenes */}
							{formData.images.length > 0 && (
								<div>
									<h4 className="text-md font-medium text-gray-800 mb-3">
										Nuevas imágenes a agregar
									</h4>
									<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
										{formData.images.map((_, index) => (
											<div key={`new-${index}`} className="relative group">
												<div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
													<img
														src={formData.previewImages[index]}
														alt={formData.name || `Nueva imagen ${index + 1}`}
														className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
													/>
												</div>
												<button
													type="button"
													onClick={() => removeNewImage(index)}
													className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
												>
													<Trash2 size={14} />
												</button>
											</div>
										))}
									</div>
								</div>
							)}

							{formData.existingImages.length === 0 &&
								formData.images.length === 0 && (
									<p className="text-sm text-gray-500 text-center mt-4">
										No hay imágenes para este producto. Agrega al menos una
										imagen.
									</p>
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

export default SellerProductEditPage;
