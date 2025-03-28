import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Interfaz para los datos de FAQ
interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category?: string;
}

interface FAQBaseProps {
  faqs: FAQItem[];
  colorScheme?: 'default' | 'primary'; // Para personalizar el esquema de colores
}

const FAQBase: React.FC<FAQBaseProps> = ({ faqs, colorScheme = 'default' }) => {
  // Estado para seguir qué pregunta está abierta
  const [openFAQs, setOpenFAQs] = useState<number[]>([]);
  
  // Estado para el filtrado por categoría
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Obtener todas las categorías únicas
  const allCategories = Array.from(new Set(faqs.filter(faq => faq.category).map(faq => faq.category as string)));

  // Filtrar FAQs por categoría si hay una categoría activa
  const filteredFAQs = activeCategory 
    ? faqs.filter(faq => faq.category === activeCategory)
    : faqs;

  // Función para alternar la apertura de una FAQ
  const toggleFAQ = (id: number) => {
    if (openFAQs.includes(id)) {
      setOpenFAQs(openFAQs.filter(faqId => faqId !== id));
    } else {
      setOpenFAQs([...openFAQs, id]);
    }
  };

  // Colores según el esquema elegido
  const colors = {
    default: {
      header: 'bg-gray-100 hover:bg-gray-200',
      headerActive: 'bg-gray-200',
      icon: 'text-gray-700',
      border: 'border-gray-300',
      categoryButton: 'bg-gray-100 hover:bg-gray-200',
      categoryActive: 'bg-gray-200 font-semibold',
    },
    primary: {
      header: 'bg-primary-50 hover:bg-primary-100',
      headerActive: 'bg-primary-100',
      icon: 'text-primary-600',
      border: 'border-primary-200',
      categoryButton: 'bg-primary-50 hover:bg-primary-100',
      categoryActive: 'bg-primary-200 text-primary-800 font-semibold',
    }
  };

  const currentColors = colors[colorScheme];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Preguntas Frecuentes</h1>
      
      {/* Párrafo introductorio */}
      <p className="text-gray-600 text-center mb-8">
        Encuentra respuestas a las preguntas más comunes sobre nuestros productos y servicios.
        Si no encuentras lo que buscas, no dudes en contactar con nuestro equipo de soporte.
      </p>

      {/* Filtro de categorías */}
      {allCategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Filtrar por categoría:</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                activeCategory === null 
                  ? currentColors.categoryActive 
                  : currentColors.categoryButton
              }`}
            >
              Todas
            </button>
            {allCategories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  activeCategory === category 
                    ? currentColors.categoryActive 
                    : currentColors.categoryButton
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista de FAQs */}
      <div className="space-y-4">
        {filteredFAQs.map((faq) => (
          <div 
            key={faq.id} 
            className={`border rounded-lg overflow-hidden ${currentColors.border}`}
          >
            <button
              onClick={() => toggleFAQ(faq.id)}
              className={`w-full flex justify-between items-center p-4 text-left transition-colors ${
                openFAQs.includes(faq.id) 
                  ? currentColors.headerActive 
                  : currentColors.header
              }`}
              aria-expanded={openFAQs.includes(faq.id)}
            >
              <span className="font-medium">{faq.question}</span>
              {openFAQs.includes(faq.id) ? (
                <ChevronUp className={`flex-shrink-0 ${currentColors.icon}`} size={20} />
              ) : (
                <ChevronDown className={`flex-shrink-0 ${currentColors.icon}`} size={20} />
              )}
            </button>
            
            {/* Contenido de la respuesta */}
            {openFAQs.includes(faq.id) && (
              <div className="p-4 bg-white">
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mensaje si no hay FAQs o si no hay resultados para el filtro */}
      {filteredFAQs.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {activeCategory 
              ? `No hay preguntas frecuentes en la categoría "${activeCategory}".` 
              : "No hay preguntas frecuentes disponibles en este momento."}
          </p>
        </div>
      )}

      {/* Sección de contacto */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg text-center">
        <h2 className="text-xl font-semibold mb-2">¿No encuentras lo que buscas?</h2>
        <p className="text-gray-600 mb-4">
          Nuestro equipo de soporte está listo para ayudarte con cualquier consulta adicional.
        </p>
        <a
          href="/contact"
          className={`inline-block px-6 py-3 rounded-lg ${
            colorScheme === 'primary' ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-800 hover:bg-gray-900'
          } text-white font-medium transition-colors`}
        >
          Contáctanos
        </a>
      </div>
    </div>
  );
};

export default FAQBase;