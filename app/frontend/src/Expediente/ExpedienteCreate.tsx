import { Create, SimpleForm, TextInput, NumberInput, DateTimeInput, DateInput, ReferenceInput, SelectInput } from 'react-admin';

const ExpedienteCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="CodigoExpediente" />
      <TextInput source="PrimerDueño" />
      <DateTimeInput source="Año" />
      <DateInput source="FechaInicio" />
      <DateInput source="FechaFin" />
      <TextInput source="Estado" />
      <TextInput source="Dependencia" />
      <TextInput source="Caratula" />
      <TextInput source="Descripcion" />
      <TextInput source="Observaciones" />
      <NumberInput source="IdPropiedadMinera" />
      <ReferenceInput label="Tipo de Expediente" source="IdTipoExpediente" reference="tipos-expediente" required>
        <SelectInput optionText="Nombre" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

export default ExpedienteCreate;
