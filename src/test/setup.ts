/**
 * 🧪 JORDAN FASE 1: Setup de testing para ConfigurationManager
 * Configuración global para tests de Vitest
 */

import { vi } from 'vitest'

// Mock global de fetch para tests
global.fetch = vi.fn()

// Mock localStorage para entorno de testing
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock sessionStorage para entorno de testing  
Object.defineProperty(global, 'sessionStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock window.location para entorno de testing
Object.defineProperty(global, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
});

// Mock de console para tests limpios (comentado para permitir debugging)
// Object.defineProperty(window, 'console', {
//   value: {
//     log: vi.fn(),
//     warn: vi.fn(),  
//     error: vi.fn(),
//     info: vi.fn(),
//     debug: vi.fn()
//   }
// })