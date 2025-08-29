
import { Edit, SimpleForm, TextInput, BooleanInput, NumberInput } from 'react-admin';


const TipoExpedienteEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
  <NumberInput source="IdTipoExpediente" label="ID" disabled />
      <TextInput source="Nombre" />
      <TextInput source="Descripcion" />
      <BooleanInput source="Activo" />
    </SimpleForm>
  </Edit>
);

export default TipoExpedienteEdit;
