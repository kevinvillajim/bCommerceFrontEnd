import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Save, X, Upload, Plus, Trash2} from "lucide-react";

const SellerProductCreatePage: React.FC = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
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
		setLoading(true);

		try {
			// In a real app, you would submit this to your API
			// using FormData to include files
			console.log("Submitting product data:", formData);

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Success! Navigate back to products list
			navigate("/seller/products");
		} catch (error) {
			console.error("Error creating product:", error);
			// Handle error (show error message, etc.)
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Add New Product
				</h1>
				<div className="flex space-x-2">
					<button
						type="button"
						onClick={() => navigate("/seller/products")}
						className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
					>
						<X size={18} className="inline mr-1" /> Cancel
					</button>
					<button
						type="button"
						onClick={handleSubmit}
						disabled={loading}
						className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? (
							<>
								<span className="inline-block animate-spin mr-1">⟳</span>{" "}
								Saving...
							</>
						) : (
							<>
								<Save size={18} className="inline mr-1" /> Save Product
							</>
						)}
					</button>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
						Basic Information
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Product Name */}
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
							>
								Product Name <span className="text-red-500">*</span>
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
								Category <span className="text-red-500">*</span>
							</label>
							<select
								id="category"
								name="category"
								required
								value={formData.category}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							>
								<option value="">Select Category</option>
								<option value="Electronics">Electronics</option>
								<option value="Computers">Computers</option>
								<option value="Accessories">Accessories</option>
								<option value="Home">Home</option>
								<option value="Fashion">Fashion</option>
								<option value="Beauty">Beauty</option>
							</select>
						</div>

						{/* Description */}
						<div className="md:col-span-2">
							<label
								htmlFor="description"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
							>
								Description <span className="text-red-500">*</span>
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
								Price ($) <span className="text-red-500">*</span>
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
								Stock Quantity <span className="text-red-500">*</span>
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
								Status
							</label>
							<select
								id="status"
								name="status"
								value={formData.status}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							>
								<option value="active">Active</option>
								<option value="inactive">Inactive</option>
								<option value="draft">Draft</option>
							</select>
						</div>
					</div>
				</div>

				{/* Images */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
						Product Images
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
									Drag and drop images here or click to upload
								</p>
								<p className="text-xs text-gray-500 dark:text-gray-500">
									JPEG, PNG, WebP up to 5MB
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
												alt={`Preview ${index + 1}`}
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
						Product Tags
					</h2>

					<div className="space-y-4">
						{/* Tag Input */}
						<div className="flex">
							<input
								type="text"
								placeholder="Add a tag and press Enter"
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
									No tags added yet
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Submit Button - Bottom */}
				<div className="flex justify-end">
					<button
						type="submit"
						disabled={loading}
						className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? "Saving..." : "Save Product"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default SellerProductCreatePage;
