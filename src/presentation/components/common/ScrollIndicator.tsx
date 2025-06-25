// src/presentation/components/common/ScrollIndicator.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ScrollIndicatorProps {
  containerRef: React.RefObject<HTMLElement>;
  threshold?: number;
  className?: string;
  showScrollHint?: boolean;
  itemCount?: number;
}

const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  containerRef,
  threshold = 100,
  className = '',
  showScrollHint = true,
  itemCount = 0
}) => {
  const [scrollState, setScrollState] = useState({
    canScrollUp: false,
    canScrollDown: false,
    scrollPercentage: 0
  });
  const [showHint, setShowHint] = useState(false);
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      const canScrollUp = scrollTop > threshold;
      const canScrollDown = scrollTop < scrollHeight - clientHeight - threshold;
      const scrollPercentage = scrollHeight > clientHeight 
        ? Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)
        : 0;

      setScrollState({
        canScrollUp,
        canScrollDown,
        scrollPercentage
      });

      // Mostrar hint temporalmente cuando se hace scroll
      if (showScrollHint && (canScrollUp || canScrollDown)) {
        setShowHint(true);
        
        if (hintTimeoutRef.current) {
          clearTimeout(hintTimeoutRef.current);
        }
        
        hintTimeoutRef.current = setTimeout(() => {
          setShowHint(false);
        }, 2000);
      }
    };

    // Verificar estado inicial
    handleScroll();

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
    };
  }, [containerRef, threshold, showScrollHint]);

  const scrollToTop = () => {
    containerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToBottom = () => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  if (!scrollState.canScrollUp && !scrollState.canScrollDown) {
    return null;
  }

  return (
    <div className={`scroll-indicators ${className}`}>
      {/* Indicador de scroll hacia arriba */}
      {scrollState.canScrollUp && (
        <button
          onClick={scrollToTop}
          className="scroll-indicator-button scroll-indicator-up"
          title="Ir al inicio"
          aria-label="Ir al inicio"
        >
          <ChevronUp size={16} />
        </button>
      )}

      {/* Barra de progreso de scroll */}
      {(scrollState.canScrollUp || scrollState.canScrollDown) && (
        <div className="scroll-progress-container">
          <div 
            className="scroll-progress-bar"
            style={{ height: `${Math.max(scrollState.scrollPercentage, 5)}%` }}
          />
          <div className="scroll-progress-text">
            {scrollState.scrollPercentage}%
          </div>
        </div>
      )}

      {/* Indicador de scroll hacia abajo */}
      {scrollState.canScrollDown && (
        <button
          onClick={scrollToBottom}
          className="scroll-indicator-button scroll-indicator-down"
          title="Ir al final"
          aria-label="Ir al final"
        >
          <ChevronDown size={16} />
        </button>
      )}

      {/* Hint de scroll */}
      {showHint && showScrollHint && itemCount > 10 && (
        <div className="scroll-hint-popup">
          <span className="scroll-hint-text">
            {itemCount} elementos • Desliza para navegar
          </span>
        </div>
      )}

      <style>{`
        .scroll-indicators {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          z-index: 10;
          pointer-events: none;
        }

        .scroll-indicator-button {
          pointer-events: auto;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: rgba(59, 130, 246, 0.9);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(4px);
        }

        .scroll-indicator-button:hover {
          background: rgba(59, 130, 246, 1);
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .scroll-indicator-button:active {
          transform: scale(0.95);
        }

        .scroll-progress-container {
          pointer-events: none;
          width: 4px;
          height: 60px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          position: relative;
          overflow: hidden;
        }

        .scroll-progress-bar {
          width: 100%;
          background: rgba(59, 130, 246, 0.8);
          border-radius: 2px;
          transition: height 0.2s ease;
          position: absolute;
          bottom: 0;
        }

        .scroll-progress-text {
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 10px;
          color: rgba(59, 130, 246, 0.8);
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
          white-space: nowrap;
        }

        .scroll-hint-popup {
          position: absolute;
          left: -120px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 11px;
          white-space: nowrap;
          animation: fadeInOut 2s ease-in-out;
          pointer-events: none;
        }

        .scroll-hint-popup::after {
          content: '';
          position: absolute;
          right: -4px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-left: 4px solid rgba(0, 0, 0, 0.8);
          border-top: 4px solid transparent;
          border-bottom: 4px solid transparent;
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0; transform: translateY(-50%) translateX(-10px); }
          20%, 80% { opacity: 1; transform: translateY(-50%) translateX(0); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .scroll-indicators {
            right: 4px;
          }
          
          .scroll-indicator-button {
            width: 28px;
            height: 28px;
          }
          
          .scroll-progress-container {
            height: 40px;
          }
          
          .scroll-hint-popup {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ScrollIndicator;