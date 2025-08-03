import { useState, useEffect } from 'react';
import { AuthService } from '../../core/services/AuthService';

interface PasswordValidationRules {
  minLength: number;
  requireSpecial: boolean;
  requireUppercase: boolean;
  requireNumbers: boolean;
  validationMessage: string;
  requirements: string[];
}

export const usePasswordValidation = () => {
  const [rules, setRules] = useState<PasswordValidationRules>({
    minLength: 8,
    requireSpecial: true,
    requireUppercase: true,
    requireNumbers: true,
    validationMessage: "La contraseña debe tener al menos 8 caracteres y debe incluir al menos una letra mayúscula, al menos un número, al menos un carácter especial (!@#$%^&*).",
    requirements: ['al menos una letra mayúscula', 'al menos un número', 'al menos un carácter especial (!@#$%^&*)']
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadValidationRules = async () => {
      try {
        const authService = new AuthService();
        const validationRules = await authService.getPasswordValidationRules();
        setRules(validationRules);
      } catch (error) {
        console.error('Error loading password validation rules:', error);
        // Mantener reglas por defecto
      } finally {
        setLoading(false);
      }
    };

    loadValidationRules();
  }, []);

  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validar longitud mínima
    if (password.length < rules.minLength) {
      errors.push(`La contraseña debe tener al menos ${rules.minLength} caracteres`);
    }

    // Validar mayúsculas
    if (rules.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }

    // Validar números
    if (rules.requireNumbers && !/[0-9]/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }

    // Validar caracteres especiales
    if (rules.requireSpecial && !/[!@#$%^&*]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial (!@#$%^&*)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return {
    rules,
    loading,
    validatePassword
  };
};