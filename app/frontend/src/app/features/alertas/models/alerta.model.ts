export interface AlertaCreate {
  IdTransaccion?: number;
  IdTipoAlerta?: number;
  IdEstado?: number;
  Asunto?: string;
  Mensaje?: string;
  Medio?: string;
  Periodicidad?: string;
  FechaInicio?: string;
  FechaFin?: string;
  Obs?: string;
  AudFecha?: string;
  AudUsuario?: number;
}
