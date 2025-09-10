export interface ReqMineroMov {
  IdReqMineroMov?: number;
  IdPropiedadMinera?: number;
  IdReqMinero?: number;
  IdTransaccion?: number;
  Fecha?: Date;
  Descripcion?: string;
  Importe?: number;
  AudFecha?: Date;
  AudUsuario?: number;
}

export interface ReqMineroMovCreate {
  IdPropiedadMinera?: number;
  IdReqMinero?: number;
  IdTransaccion?: number;
  Fecha?: Date;
  Descripcion?: string;
  Importe?: number;
}

export interface ReqMineroMovUpdate {
  IdPropiedadMinera?: number;
  IdReqMinero?: number;
  IdTransaccion?: number;
  Fecha?: Date;
  Descripcion?: string;
  Importe?: number;
}
