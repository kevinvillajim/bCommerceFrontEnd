import React, { useState } from 'react';
import { DebugUtils } from '../utils/debugUtils';
import type { ExtendedProductFilterParams } from './types/ProductFilterParams';
import type { Category } from '../core/domain/entities/Category';

interface DebugPanelProps {
    filterParams: ExtendedProductFilterParams;
    categories: Category[];
    products: any[];
    meta: any;
}

/**
 * Componente temporal para debug - QUITAR EN PRODUCCIÓN
 */
const DebugPanel: React.FC<DebugPanelProps> = ({ 
    filterParams, 
    categories, 
    products, 
    meta 
}) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700"
                >
                    🐛 Debug
                </button>
            </div>
        );
    }

    const debugUrl = DebugUtils.buildDebugUrl(filterParams);
    const validation = DebugUtils.validateParams(filterParams);

    return (
        <div className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto bg-white border border-red-300 rounded-lg shadow-xl z-50 p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-red-600">🐛 Debug Panel</h3>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
            </div>

            <div className="space-y-4 text-sm">
                {/* Validación */}
                <div>
                    <h4 className="font-semibold">Validación:</h4>
                    <div className={`p-2 rounded ${validation.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {validation.isValid ? '✅ Válido' : `❌ ${validation.errors.join(', ')}`}
                    </div>
                </div>

                {/* URL de prueba */}
                <div>
                    <h4 className="font-semibold">URL de prueba:</h4>
                    <div className="bg-gray-100 p-2 rounded text-xs break-all">
                        <a href={debugUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {debugUrl}
                        </a>
                    </div>
                </div>

                {/* Parámetros actuales */}
                <div>
                    <h4 className="font-semibold">Parámetros:</h4>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(filterParams, null, 2)}
                    </pre>
                </div>

                {/* Categorías seleccionadas */}
                {filterParams.categoryIds && filterParams.categoryIds.length > 0 && (
                    <div>
                        <h4 className="font-semibold">Categorías:</h4>
                        <ul className="bg-blue-50 p-2 rounded text-xs">
                            {filterParams.categoryIds.map(id => {
                                const category = categories.find(c => c.id === id);
                                return (
                                    <li key={id} className={category ? 'text-green-600' : 'text-red-600'}>
                                        ID {id}: {category ? category.name : 'NO ENCONTRADA'}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                {/* Resultados */}
                <div>
                    <h4 className="font-semibold">Resultados:</h4>
                    <div className="bg-yellow-50 p-2 rounded text-xs">
                        <div>Productos: {products.length}</div>
                        <div>Total: {meta?.total || 0}</div>
                        <div>Página: {meta?.page || 1}</div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex space-x-2">
                    <button
                        onClick={() => {
                            DebugUtils.logFilterParams(filterParams, categories);
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                    >
                        Log Completo
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(debugUrl);
                            alert('URL copiada al portapapeles');
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                    >
                        Copiar URL
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DebugPanel;