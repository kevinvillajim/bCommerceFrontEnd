import type { CreditNoteRepository } from '../../../domain/repositories/CreditNoteRepository';

// Interfaces SRI exactas según documentación
export interface SriCreditNoteRequest {
  secuencial: string;
  fechaEmision: string;
  motivo: string;
  documentoModificado: {
    tipo: string;
    numero: string;
    fechaEmision: string;
  };
  comprador: {
    tipoIdentificacion: string;
    identificacion: string;
    razonSocial: string;
    direccion?: string;
    email?: string;
    telefono?: string;
  };
  detalles: SriCreditNoteDetail[];
  informacionAdicional?: {
    [key: string]: string;
  };
}

export interface SriCreditNoteDetail {
  codigoInterno: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
  codigoIva: '0' | '2' | '3' | '4' | '5' | '6' | '7';
}

// Respuesta SRI exacta según documentación
export interface SriCreditNoteResponse {
  success: boolean;
  message: string;
  data: {
    notaCreditoId?: number;
    claveAcceso?: string;
    numeroNotaCredito: string;
    estado: string;
    fechaEmision: string;
    total: number;
    motivo: string;
    documentoModificado: string;
    numeroAutorizacion?: string;
    fechaAutorizacion?: string;
    sri: {
      estado: string;
      respuesta: any;
    };
  };
}

export class CreateCreditNoteUseCase {
  constructor(private creditNoteRepository: CreditNoteRepository) {}

  async execute(creditNoteData: SriCreditNoteRequest): Promise<SriCreditNoteResponse> {
    try {
      // Validar que todos los datos requeridos estén presentes
      this.validateCreditNoteData(creditNoteData);

      return await this.creditNoteRepository.createCreditNote(creditNoteData);
    } catch (error) {
      console.error('Error en CreateCreditNoteUseCase:', error);
      throw error;
    }
  }

  private validateCreditNoteData(data: SriCreditNoteRequest): void {
    // Secuencial no es requerido - el backend lo genera automáticamente

    if (!data.fechaEmision) {
      throw new Error('Fecha de emisión es requerida');
    }

    if (!data.motivo || data.motivo.trim() === '') {
      throw new Error('Motivo es requerido');
    }

    if (!data.documentoModificado?.numero || data.documentoModificado.numero.trim() === '') {
      throw new Error('Número del documento modificado es requerido');
    }

    if (!data.comprador?.identificacion || data.comprador.identificacion.trim() === '') {
      throw new Error('Identificación del comprador es requerida');
    }

    if (!data.detalles || data.detalles.length === 0) {
      throw new Error('Al menos un detalle es requerido');
    }

    // Validar cada detalle
    data.detalles.forEach((detalle, index) => {
      if (!detalle.codigoInterno || detalle.codigoInterno.trim() === '') {
        throw new Error(`Código interno es requerido en detalle ${index + 1}`);
      }

      if (!detalle.descripcion || detalle.descripcion.trim() === '') {
        throw new Error(`Descripción es requerida en detalle ${index + 1}`);
      }

      if (detalle.cantidad <= 0) {
        throw new Error(`Cantidad debe ser mayor a 0 en detalle ${index + 1}`);
      }

      if (detalle.precioUnitario <= 0) {
        throw new Error(`Precio unitario debe ser mayor a 0 en detalle ${index + 1}`);
      }
    });
  }
}