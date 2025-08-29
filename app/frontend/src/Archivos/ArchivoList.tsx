import { List, Datagrid, TextField, DateField, NumberField, UrlField } from 'react-admin';

const ArchivoList = (props: any) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" label="ID" />
      <TextField source="IdTransaccion" label="ID Transacción" />
      <TextField source="Descripcion" label="Descripción" />
      <TextField source="Archivo" label="Nombre Archivo" />
      <UrlField source="Link" label="Descargar" target="_blank" />
      <DateField source="AudFecha" label="Fecha Auditoría" />
      <NumberField source="AudUsuario" label="Usuario Auditoría" />
    </Datagrid>
  </List>
);

export default ArchivoList;
