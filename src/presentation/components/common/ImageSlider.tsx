import React, { useState, useEffect } from 'react';

interface ImageSliderProps {
  images: string[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ 
  images, 
  autoPlay = true, 
  autoPlayInterval = 5000 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, autoPlayInterval);
    
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, images.length]);
  
  // Navigate to the next slide
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };
  
  // Navigate to the previous slide
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };
  
  // Navigate to a specific slide
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };
  
  return (
    <div className="relative w-full h-[40vh] overflow-hidden">
      {/* Images */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out
              ${index === currentIndex ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}
          >
            {/* Main image (35% width centered) */}
            <div className="relative w-full h-full flex justify-center items-center">
              <div className="w-[80%] h-full z-20 relative">
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
              </div>
              
              {/* Background image (blurred, full width) */}
              <div className="absolute inset-0 z-10">
                <img
                  src={image}
                  alt={`Slide background ${index + 1}`}
                  className="w-full h-full object-cover filter blur-sm opacity-50"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation buttons */}
      <button
        onClick={prevSlide}
              className="hover:opacity-100 hover:border-1 hover:border-blue-200 opacity-75 cursor-pointer absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-3 rounded-full transition-all"
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={nextSlide}
        className="hover:opacity-100 hover:border-1 hover:border-blue-200 opacity-75 cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-3 rounded-full transition-all"
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`cursor-pointer w-2 h-2 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-white scale-110' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;