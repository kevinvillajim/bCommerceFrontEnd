import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Save, X, Upload, Plus, Trash2} from "lucide-react";
import useSellerProducts from "../../hooks/useSellerProducts";
import useCategoriesSelect from "../../hooks/useCategoriesSelect";

const SellerProductCreatePage: React.FC = () => {
	const navigate = useNavigate();
	const [saving, setSaving] = useState(false);
	const {createProduct} = useSellerProducts();
	const {categoryOptions, loading: loadingCategories} = useCategoriesSelect();

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		price: "",
		stock: "",
		category: "",
		status: "active",
		images: [] as File[],
		previewImages: [] as string[],
		tags: [] as string[],
		currentTag: "",
	});

	// Handle input changes
	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const {name, value} = e.target;
		setFormData((prev) => ({...prev, [name]: value}));
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

	// Remove image
	const removeImage = (index: number) => {
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

	// Submit form
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);

		try {
			// Validar formulario
			if (
				!formData.name ||
				!formData.description ||
				!formData.price ||
				!formData.stock ||
				!formData.category
			) {
				throw new Error("Por favor, completa todos los campos obligatorios");
			}

			// Preparar datos para enviar a la API
			const productData = {
				name: formData.name,
				description: formData.description,
				price: parseFloat(formData.price),
				stock: parseInt(formData.stock),
				// Usar el nombre que espera la API (category_id)
				category_id: parseInt(formData.category),
				// También incluimos categoryId para compatibilidad con ambos formatos
				categoryId: parseInt(formData.category),
				status: formData.status,
				tags: formData.tags,
				images: formData.images,
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

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
						Información Básica
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Product Name */}
						<div>
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
								required
								value={formData.name}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							/>
						</div>

						{/* Category */}
						<div>
							<label
								htmlFor="category"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
							>
								Categoría <span className="text-red-500">*</span>
							</label>
							{loadingCategories ? (
								<div className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
									Cargando categorías...
								</div>
							) : (
								<select
									id="category"
									name="category"
									required
									value={formData.category}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
								>
									<option value="">Seleccionar Categoría</option>
									{categoryOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							)}
						</div>

						{/* Description */}
						<div className="md:col-span-2">
							<label
								htmlFor="description"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
							>
								Descripción <span className="text-red-500">*</span>
							</label>
							<textarea
								id="description"
								name="description"
								rows={4}
								required
								value={formData.description}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							/>
						</div>

						{/* Price */}
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
								required
								value={formData.price}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							/>
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
								required
								value={formData.stock}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							/>
						</div>

						{/* Status */}
						<div>
							<label
								htmlFor="status"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
							>
								Estado
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
				</div>

				{/* Images */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
						Imágenes del Producto
					</h2>

					<div className="space-y-4">
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
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Tags */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
						Etiquetas del Producto
					</h2>

					<div className="space-y-4">
						{/* Tag Input */}
						<div className="flex">
							<input
								type="text"
								placeholder="Añade una etiqueta y presiona Enter"
								value={formData.currentTag}
								onChange={(e) =>
									setFormData((prev) => ({...prev, currentTag: e.target.value}))
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

						{/* Tag List */}
						<div className="flex flex-wrap gap-2">
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
