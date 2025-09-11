import React from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
	currentPage,
	totalPages,
	onPageChange,
}) => {
	if (totalPages <= 1) return null;

	const getPageNumbers = () => {
		const pages: (number | string)[] = [];

		pages.push(1);

		if (currentPage > 3) pages.push("...");

		for (
			let i = Math.max(2, currentPage - 1);
			i <= Math.min(totalPages - 1, currentPage + 1);
			i++
		) {
			if (i > 1 && i < totalPages) {
				pages.push(i);
			}
		}

		if (currentPage < totalPages - 2) pages.push("...");

		if (totalPages > 1) pages.push(totalPages);

		return pages;
	};

	const pages = getPageNumbers();

	return (
		<div className="bg-white px-4 py-3 border-t border-gray-200">
			<div className="flex items-center justify-between">
				{/* Previous Button */}
				<button
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					<ChevronLeft className="w-4 h-4 mr-2" />
					<span className="hidden sm:inline">Anterior</span>
				</button>
				
				{/* Page Info & Numbers */}
				<div className="flex items-center space-x-2">
					{/* Mobile: Simple counter */}
					<div className="flex sm:hidden items-center">
						<span className="text-sm text-gray-700">
							<span className="font-semibold text-primary-600">{currentPage}</span>
							<span className="mx-1">de</span>
							<span className="font-semibold">{totalPages}</span>
						</span>
					</div>
					
					{/* Desktop: Page numbers */}
					<div className="hidden sm:flex items-center space-x-1">
						{pages.map((page, index) =>
							typeof page === "number" ? (
								<button
									key={index}
									onClick={() => onPageChange(page)}
									className={`relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
										currentPage === page
											? "bg-primary-600 text-white shadow-sm"
											: "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
									}`}
								>
									{page}
								</button>
							) : (
								<span
									key={index}
									className="relative inline-flex items-center justify-center w-10 h-10 text-sm text-gray-400"
								>
									{page}
								</span>
							)
						)}
					</div>
				</div>
				
				{/* Next Button */}
				<button
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					<span className="hidden sm:inline">Siguiente</span>
					<ChevronRight className="w-4 h-4 ml-2" />
				</button>
			</div>
			
			{/* Desktop: Additional info */}
			<div className="hidden sm:block mt-3 text-center">
				<p className="text-xs text-gray-500">
					Mostrando página {currentPage} de {totalPages}
				</p>
			</div>
		</div>
	);
};

export default Pagination;
