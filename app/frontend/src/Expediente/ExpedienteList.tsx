import { List, Datagrid, TextField, NumberField, DateField, DeleteButton, ReferenceField } from 'react-admin';

const ExpedienteList = (props: any) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="CodigoExpediente" />
      <TextField source="PrimerDueño" />
      <DateField source="Año" />
      <DateField source="FechaInicio" />
      <DateField source="FechaFin" />
      <TextField source="Estado" />
      <TextField source="Dependencia" />
      <TextField source="Caratula" />
      <TextField source="Descripcion" />
      <TextField source="Observaciones" />
      <NumberField source="IdPropiedadMinera" />
      <ReferenceField label="Tipo de Expediente" source="IdTipoExpediente" reference="tipos-expediente">
        <TextField source="Nombre" />
      </ReferenceField>
      <DeleteButton />
    </Datagrid>
  </List>
);

export default ExpedienteList;
