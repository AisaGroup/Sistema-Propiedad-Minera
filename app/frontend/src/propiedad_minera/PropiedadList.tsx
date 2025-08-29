import { List, Datagrid, TextField, NumberField, DateField, DeleteButton, TextInput } from 'react-admin';
const propiedadFilters = [
  <TextInput label="Buscar por Nombre" source="Nombre" alwaysOn />
];
const PropiedadList = (props: any) => (
  <List {...props} filters={propiedadFilters}>
  <Datagrid rowClick="edit">
  <TextField source="Nombre" />
  <NumberField source="IdTitular" />
      <DateField source="Solicitud" />
      <DateField source="Registro" />
      <DateField source="Notificacion" />
      <TextField source="Provincia" />
      <DateField source="Mensura" />
      <NumberField source="AreaHectareas" />
      <TextField source="LaborLegal" />
  <TextField source="DescubrimientoDirecto" />
  <DeleteButton />
    </Datagrid>
  </List>
);

export default PropiedadList;
