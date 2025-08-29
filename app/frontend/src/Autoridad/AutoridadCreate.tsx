import { Create, SimpleForm, TextInput, DateInput, NumberInput } from 'react-admin';

const AutoridadCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <NumberInput source="IdAutoridad" label="ID" />
      <TextInput source="Nombre" label="Nombre" />
      <TextInput source="Abrev" label="Abreviatura" />
      <TextInput source="Ministerio" label="Ministerio" />
      <TextInput source="Subsecrt" label="Subsecretaría" />
      <TextInput source="Provincia" label="Provincia" />
      <TextInput source="Direccion" label="Dirección" />
      <TextInput source="Contacto" label="Contacto" />
      <TextInput source="Telefono" label="Teléfono" />
      <TextInput source="Web" label="Web" />
      <DateInput source="AudFecha" label="Fecha Auditoría" />
      <NumberInput source="AudUsuario" label="Usuario Auditoría" />
    </SimpleForm>
  </Create>
);

export default AutoridadCreate;
