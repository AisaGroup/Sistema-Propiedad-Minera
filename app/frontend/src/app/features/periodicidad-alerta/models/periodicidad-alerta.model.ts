export interface PeriodicidadAlerta {
  IdPeriodicidad: number;
  Nombre: string;
  Descripcion?: string;
}

export interface PeriodicidadAlertaCreate {
  Nombre: string;
  Descripcion?: string;
}

export interface PeriodicidadAlertaUpdate {
  Nombre?: string;
  Descripcion?: string;
}
