
import { Create, SimpleForm, TextInput, BooleanInput, NumberInput } from 'react-admin';

const TipoExpedienteCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
  <NumberInput source="IdTipoExpediente" label="ID" />
      <TextInput source="Nombre" />
      <TextInput source="Descripcion" />
      <BooleanInput source="Activo" />
    </SimpleForm>
  </Create>
);

export default TipoExpedienteCreate;
