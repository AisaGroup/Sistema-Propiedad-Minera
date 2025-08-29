import { List, Datagrid, TextField, NumberField, DateField } from 'react-admin';

const TitularMineroList = (props: any) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <NumberField source="IdTitular" label="ID" />
      <TextField source="tipo_persona" />
      <TextField source="nombre" />
      <TextField source="dni_cuit" />
      <TextField source="domicilio_legal" />
      <TextField source="telefono" />
      <TextField source="email" />
      <DateField source="fecha_asignacion" />
      <TextField source="estado" />
      <TextField source="representante_legal" />
      <TextField source="observaciones" />
      <TextField source="descripcion" />
    </Datagrid>
  </List>
);

export default TitularMineroList;
