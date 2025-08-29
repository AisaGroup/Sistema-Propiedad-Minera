import { Edit, SimpleForm, TextInput, NumberInput, DateTimeInput } from 'react-admin';

const PropiedadEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
  <NumberInput source="IdTransaccion" />
  <NumberInput source="IdTitular" />
      <TextInput source="Nombre" />
      <DateTimeInput source="Solicitud" />
      <DateTimeInput source="Registro" />
      <DateTimeInput source="Notificacion" />
      <TextInput source="Provincia" />
      <DateTimeInput source="Mensura" />
      <NumberInput source="AreaHectareas" />
      <TextInput source="LaborLegal" />
      <TextInput source="DescubrimientoDirecto" />
    </SimpleForm>
  </Edit>
);

export default PropiedadEdit;
