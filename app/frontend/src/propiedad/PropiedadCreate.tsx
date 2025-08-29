import { Create, SimpleForm, TextInput, NumberInput, DateTimeInput } from 'react-admin';

const PropiedadCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <NumberInput source="IdTransaccion" />
      <TextInput source="Nombre" />
      <DateTimeInput source="Solicitud" />
      <DateTimeInput source="Registro" />
      <DateTimeInput source="Notificacion" />
      <TextInput source="Provincia" />
      <DateTimeInput source="Mensura" />
      <NumberInput source="AreaHectareas" />
      <TextInput source="LaborLegal" />
      <TextInput source="DescubrimientoDirecto" required />
    </SimpleForm>
  </Create>
);

export default PropiedadCreate;
