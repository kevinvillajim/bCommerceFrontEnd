import React, { memo } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
}

/**
 * Componente para cambiar entre modo claro y oscuro
 */
const ThemeToggle: React.FC<ThemeToggleProps> = memo(({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className={`cursor-pointer text-gray-500 transition-colors ${className}`}
      aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {theme === 'dark' ? (
        <Sun size={22} className="sun-icon hover:text-yellow-400" />
      ) : (
        <Moon size={22} className="hover:text-primary-600" />
      )}
    </button>
  );
});

export default ThemeToggle;