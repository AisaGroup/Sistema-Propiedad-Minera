import { List, Datagrid, TextField, NumberField, DateField } from 'react-admin';

const NotificacionList = (props: any) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <NumberField source="id" label="ID" />
      <NumberField source="IdTransaccion" label="Transacción" />
      <TextField source="Organismo" label="Organismo" />
      <TextField source="Jurisdiccion" label="Jurisdicción" />
      <NumberField source="IdExpediente" label="Expediente" />
      <NumberField source="IdTitular" label="Titular" />
      <NumberField source="IdTitMinDirLegal" label="TitMinDirLegal" />
      <NumberField source="TipoNotificacion" label="Tipo Notificación" />
      <NumberField source="IdPropiedadMinera" label="Propiedad Minera" />
      <TextField source="Ubicacion" label="Ubicación" />
      <TextField source="Latitud" label="Latitud" />
      <TextField source="Longitud" label="Longitud" />
      <TextField source="Resolucion" label="Resolución" />
      <TextField source="Fundamentos" label="Fundamentos" />
      <NumberField source="IdAutoridad" label="Autoridad" />
      <DateField source="Plazo" label="Plazo" />
      <DateField source="Emision" label="Emisión" />
      <TextField source="Funcionario" label="Funcionario" />
      <TextField source="Observaciones" label="Observaciones" />
      <DateField source="AudFecha" label="Fecha Auditoría" />
      <NumberField source="AudUsuario" label="Usuario Auditoría" />
    </Datagrid>
  </List>
);

export default NotificacionList;
