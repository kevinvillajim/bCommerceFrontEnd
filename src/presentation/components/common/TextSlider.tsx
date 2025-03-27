import React, { useState, useEffect } from "react";

// Definir la interfaz para un slide
interface Slide {
  title: string;
  description: string;
  buttonText: string;
  buttonAction: () => void;
  image: string;
  color: string; // Se espera un color en formato rgba() o hexadecimal
}

// Definir las props del componente
interface SliderProps {
  slides: Slide[];
  interval?: number;
}

const TextSlider: React.FC<SliderProps> = ({ slides, interval = 5000 }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Cambio automático de slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [slides.length, interval]);

  // Función para cambiar manualmente el slide
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative overflow-hidden rounded-xl h-96">
      {slides.map((slide, index) => {
        const contentPosition = index % 2 === 0 ? "items-start text-left" : "items-end text-right";

        return (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
              currentSlide === index ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            style={{
              backgroundImage: `linear-gradient(${slide.color}, ${slide.color}), url(${slide.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundBlendMode: "multiply", // Mezcla la imagen con el color de fondo
            }}
          >
            <div className={`relative h-full flex flex-col justify-center p-8 md:p-12 ${contentPosition}`}>
              <div className="max-w-lg">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">{slide.title}</h1>
                <p className="text-lg md:text-xl mb-6 text-white opacity-90">{slide.description}</p>
                <button
                  onClick={slide.buttonAction}
                  className="cursor-pointer bg-white text-gray-900 font-medium px-6 py-3 rounded-md hover:bg-gray-100 transition-colors"
                >
                  {slide.buttonText}
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Indicadores (bolitas) */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`cursor-pointer w-2 h-2 rounded-full transition-all duration-300 ${
              currentSlide === index ? "bg-white scale-125" : "bg-white bg-opacity-50 hover:bg-opacity-75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TextSlider;
