export interface AuditoriaRaw {
  IdAuditoria: number;
  Accion: string;
  Entidad: string;
  Descripcion: string | null;
  AudFecha: string | null;
  AudUsuario: number | null;
  UsuarioNombre: string | null;
}

export type AuditoriaDescripcionEntry = {
  label: string;
  value: string;
};

export interface AuditoriaExportFilters {
  usuario: string | null;
  entidad: string[];
  accion: string[];
  idTransaccion: string | null;
  fechaDesde: string | null;
  fechaHasta: string | null;
}