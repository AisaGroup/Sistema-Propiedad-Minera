import { Create, SimpleForm, TextInput, DateInput, NumberInput } from 'react-admin';

const AreaCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <NumberInput source="IdArea" label="ID" />
      <TextInput source="Descripcion" label="Descripción" />
      <DateInput source="AudFecha" label="Fecha Auditoría" />
      <NumberInput source="AudUsuario" label="Usuario Auditoría" />
    </SimpleForm>
  </Create>
);

export default AreaCreate;
