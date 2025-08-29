import { Create, SimpleForm, TextInput, NumberInput, DateInput } from 'react-admin';

const TitularMineroCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <NumberInput source="IdTitular" label="ID" />
      <TextInput source="tipo_persona" />
      <TextInput source="nombre" />
      <TextInput source="dni_cuit" />
      <TextInput source="domicilio_legal" />
      <TextInput source="telefono" />
      <TextInput source="email" />
      <DateInput source="fecha_asignacion" />
      <TextInput source="estado" />
      <TextInput source="representante_legal" />
      <TextInput source="observaciones" />
      <TextInput source="descripcion" />
    </SimpleForm>
  </Create>
);

export default TitularMineroCreate;
