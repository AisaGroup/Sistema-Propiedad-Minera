export interface PropiedadMinera {
  IdPropiedadMinera: number;
  IdTransaccion?: number;
  IdTitular?: number;
  TitularNombre?: string;  // Nombre del titular
  Nombre?: string;
  Solicitud?: Date;
  Registro?: Date;
  Notificacion?: Date;
  Provincia?: string;
  Mensura?: Date;
  AreaHectareas?: number;
  DescubrimientoDirecto?: string;
}

export interface PropiedadMineraCreate {
  IdTransaccion?: number;
  IdTitular?: number;
  Nombre?: string;
  Solicitud?: Date;
  Registro?: Date;
  Notificacion?: Date;
  Provincia?: string;
  Mensura?: Date;
  AreaHectareas?: number;
  DescubrimientoDirecto?: string;
}

export interface PropiedadMineraFilter {
  Nombre?: string;
  Provincia?: string;
  IdTitular?: number;
  range?: [number, number];
}
