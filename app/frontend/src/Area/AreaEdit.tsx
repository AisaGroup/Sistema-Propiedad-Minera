import { Edit, SimpleForm, TextInput, DateInput, NumberInput } from 'react-admin';

const AreaEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <NumberInput source="IdArea" label="ID" disabled />
      <TextInput source="Descripcion" label="Descripción" />
      <DateInput source="AudFecha" label="Fecha Auditoría" />
      <NumberInput source="AudUsuario" label="Usuario Auditoría" />
    </SimpleForm>
  </Edit>
);

export default AreaEdit;
