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
