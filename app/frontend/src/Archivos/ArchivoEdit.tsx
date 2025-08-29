import { Edit, SimpleForm, TextInput, NumberInput, DateInput, FileInput } from 'react-admin';

const ArchivoEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="id" label="ID" disabled />
      <NumberInput source="IdTransaccion" label="ID Transacción" />
      <TextInput source="Descripcion" label="Descripción" />
      <TextInput source="Archivo" label="Nombre Archivo" disabled />
      <TextInput source="Link" label="Link" disabled />
      <DateInput source="AudFecha" label="Fecha Auditoría" />
      <NumberInput source="AudUsuario" label="Usuario Auditoría" />
    </SimpleForm>
  </Edit>
);

export default ArchivoEdit;
