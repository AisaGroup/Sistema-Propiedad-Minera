import { List, Datagrid, TextField, NumberField, DateField, EditButton, DeleteButton } from 'react-admin';

const AlertaList = (props: any) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <NumberField source="idAlerta" label="ID" />
      <NumberField source="IdTransaccion" label="Transacción" />
      <NumberField source="IdTipoAlerta" label="Tipo de Alerta" />
      <TextField source="Estado" label="Estado" />
      <TextField source="Asunto" label="Asunto" />
      <TextField source="Mensaje" label="Mensaje" />
      <TextField source="Medio" label="Medio" />
      <TextField source="Periodicidad" label="Periodicidad" />
      <DateField source="FechaInicio" label="Fecha Inicio" />
      <DateField source="FechaFin" label="Fecha Fin" />
      <TextField source="Obs" label="Observaciones" />
      <DateField source="AudFecha" label="Fecha Auditoría" />
      <NumberField source="AudUsuario" label="Usuario Auditoría" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default AlertaList;
