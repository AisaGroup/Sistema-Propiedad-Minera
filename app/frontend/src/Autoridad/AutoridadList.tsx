import { List, Datagrid, TextField, EditButton, DeleteButton } from 'react-admin';

const AutoridadList = (props: any) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="IdAutoridad" label="ID" />
      <TextField source="Nombre" label="Nombre" />
      <TextField source="Abrev" label="Abreviatura" />
      <TextField source="Ministerio" label="Ministerio" />
      <TextField source="Subsecrt" label="Subsecretaría" />
      <TextField source="Provincia" label="Provincia" />
      <TextField source="Direccion" label="Dirección" />
      <TextField source="Contacto" label="Contacto" />
      <TextField source="Telefono" label="Teléfono" />
      <TextField source="Web" label="Web" />
      <TextField source="AudFecha" label="Fecha Auditoría" />
      <TextField source="AudUsuario" label="Usuario Auditoría" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default AutoridadList;
