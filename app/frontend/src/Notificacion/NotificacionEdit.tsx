import { Edit, SimpleForm, TextInput, NumberInput, DateInput } from 'react-admin';

const NotificacionEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <NumberInput source="id" label="ID" disabled />
      <NumberInput source="IdTransaccion" label="Transacción" required />
      <TextInput source="Organismo" label="Organismo" />
      <TextInput source="Jurisdiccion" label="Jurisdicción" />
      <NumberInput source="IdExpediente" label="Expediente" />
      <NumberInput source="IdTitular" label="Titular" />
      <NumberInput source="IdTitMinDirLegal" label="TitMinDirLegal" />
      <NumberInput source="TipoNotificacion" label="Tipo Notificación" />
      <NumberInput source="IdPropiedadMinera" label="Propiedad Minera" />
      <TextInput source="Ubicacion" label="Ubicación" />
      <TextInput source="Latitud" label="Latitud" />
      <TextInput source="Longitud" label="Longitud" />
      <TextInput source="Resolucion" label="Resolución" />
      <TextInput source="Fundamentos" label="Fundamentos" multiline />
      <NumberInput source="IdAutoridad" label="Autoridad" />
      <DateInput source="Plazo" label="Plazo" />
      <DateInput source="Emision" label="Emisión" />
      <TextInput source="Funcionario" label="Funcionario" />
      <TextInput source="Observaciones" label="Observaciones" multiline />
      <DateInput source="AudFecha" label="Fecha Auditoría" />
      <NumberInput source="AudUsuario" label="Usuario Auditoría" />
    </SimpleForm>
  </Edit>
);

export default NotificacionEdit;
