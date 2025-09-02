export interface Expediente {
  IdExpediente: number;
  CodigoExpediente?: string;
  PrimerDueno?: string; // Cambiado de PrimerDueño
  Ano?: string; // Cambiado de Año - DateTime from backend
  FechaInicio?: string; // Date from backend
  FechaFin?: string; // Date from backend
  Estado?: string;
  Dependencia?: string;
  Caratula?: string;
  Descripcion?: string;
  Observaciones?: string;
  IdPropiedadMinera?: number;
  IdTipoExpediente: number;
  IdTransaccion?: number;
  alertas?: Alerta[];
  actas?: Acta[];
  observaciones?: import('../../observaciones/models/observacion.model').Observacion[];
}

export interface ExpedienteCreate {
  CodigoExpediente?: string;
  PrimerDueno?: string; // Cambiado de PrimerDueño
  Ano?: string; // Cambiado de Año
  FechaInicio?: string;
  FechaFin?: string;
  Estado?: string;
  Dependencia?: string;
  Caratula?: string;
  Descripcion?: string;
  Observaciones?: string;
  IdPropiedadMinera?: number;
  IdTipoExpediente: number;
  IdTransaccion?: number;
}

export interface ExpedienteFilter {
  CodigoExpediente?: string;
  Estado?: string;
  Dependencia?: string;
  IdTipoExpediente?: number;
  FechaInicio?: string;
  FechaFin?: string;
}

export interface Alerta {
  idAlerta: number;
  IdTransaccion: number;
  Estado: string;
  // Agregar más campos según el modelo de alerta del backend
}

export interface Acta {
  IdActa: number;
  IdTransaccion?: number;
  IdExpediente: number;
  IdTipoActa?: string;
  Fecha?: string;
  Lugar?: string;
  IdAutoridad?: number;
  Descripcion?: string;
  Obs?: string;
  AudFecha?: string;
  AudUsuario?: number;
}

export interface ExpedienteResponse {
  data: Expediente[];
  total: number;
  range: string;
}
