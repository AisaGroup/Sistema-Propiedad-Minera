import { List, Datagrid, TextField, EditButton, DeleteButton } from 'react-admin';

const AreaList = (props: any) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="IdArea" label="ID" />
      <TextField source="Descripcion" label="Descripción" />
      <TextField source="AudFecha" label="Fecha Auditoría" />
      <TextField source="AudUsuario" label="Usuario Auditoría" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default AreaList;
