import { List, Datagrid, TextField, BooleanField, DeleteButton } from 'react-admin';

const TipoExpedienteList = (props: any) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="Nombre" />
      <TextField source="Descripcion" />
      <BooleanField source="Activo" />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default TipoExpedienteList;
