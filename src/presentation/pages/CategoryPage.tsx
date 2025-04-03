import {useEffect, useState} from "react";
import {ChevronRight} from "lucide-react";
import useCategories from "../hooks/useCategories";

const CategoryPage = () => {
	const {loading, error, mainCategories, fetchMainCategories} = useCategories();
  const [secciones, setSecciones] = useState<any[]>([]);
  
  interface Subtitle {
		label: string;
		link: string;
  }
  

	// Fetch main categories on component mount
	useEffect(() => {
		fetchMainCategories();
	}, [fetchMainCategories]);

	// Transform API categories to component format
	useEffect(() => {
		if (mainCategories && mainCategories.length > 0) {
			const transformedSections = mainCategories.map((category) => {
				// Get subcategories if available
				const subtitles = category.subcategories
					? category.subcategories.map((subcategory) => ({
							label: subcategory.name,
							link: `/categoria/${subcategory.slug}`,
						}))
					: [];

				return {
					title: category.name,
					description:
						category.description || "Descubre nuestra selección de productos",
					subtitles: subtitles.slice(0, 5), // Limit to 5 subcategories per section
				};
			});

			setSecciones(transformedSections);
		}
	}, [mainCategories]);

	// Show loading state
	if (loading) {
		return (
			<div className="max-w-6xl mx-auto px-4 py-12">
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
				</div>
			</div>
		);
	}

	// Show error state
	if (error) {
		return (
			<div className="max-w-6xl mx-auto px-4 py-12">
				<div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
					<p className="text-red-700">Error al cargar categorías: {error}</p>
					<button
						onClick={() => fetchMainCategories()}
						className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
					>
						Reintentar
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto px-4 py-12">
			<header className="text-center mb-16">
				<h1 className="text-4xl font-bold mb-4 text-gray-800">
					Explora Nuestras Categorías
				</h1>
				<p className="text-gray-600 max-w-2xl mx-auto">
					Descubre contenido relevante organizado por temas. Navega por nuestras
					categorías para encontrar información actualizada y recursos útiles.
				</p>
			</header>

			<div className="grid md:grid-cols-2 gap-8">
				{secciones.map((section, index) => (
					<div
						key={index}
						className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
					>
						<div
							className={
								"bg-gradient-to-bl from-primary-700 to-black px-6 py-8 opacity-90 text-white"
							}
						>
							<div className="flex items-center mb-4">
								<h2 className="text-2xl font-bold">{section.title}</h2>
							</div>
							<p className="opacity-90">{section.description}</p>
						</div>

						<ul className="divide-y divide-gray-100">
							{section.subtitles.map((sub:Subtitle, subIndex: number) => (
								<li key={subIndex}>
									<a
										href={sub.link}
										className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
									>
										<span className="text-gray-700 font-medium">
											{sub.label}
										</span>
										<ChevronRight className="text-gray-400 h-5 w-5" />
									</a>
								</li>
							))}
						</ul>

						<div className="px-6 py-4 bg-gray-50">
							<a
								href={`/products?category=${encodeURIComponent(section.title)}`}
								className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
							>
								Ver todos los temas
								<ChevronRight className="ml-1 h-4 w-4" />
							</a>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default CategoryPage;
