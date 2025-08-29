import { Edit, SimpleForm, TextInput, NumberInput, DateInput } from 'react-admin';

const AlertaEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <NumberInput source="idAlerta" label="ID" disabled />
      <NumberInput source="IdTransaccion" label="Transacción" />
      <NumberInput source="IdTipoAlerta" label="Tipo de Alerta" required />
      <TextInput source="Estado" label="Estado" />
      <TextInput source="Asunto" label="Asunto" />
      <TextInput source="Mensaje" label="Mensaje" multiline />
      <TextInput source="Medio" label="Medio" />
      <TextInput source="Periodicidad" label="Periodicidad" />
      <DateInput source="FechaInicio" label="Fecha Inicio" />
      <DateInput source="FechaFin" label="Fecha Fin" />
      <TextInput source="Obs" label="Observaciones" multiline />
      <DateInput source="AudFecha" label="Fecha Auditoría" />
      <NumberInput source="AudUsuario" label="Usuario Auditoría" />
    </SimpleForm>
  </Edit>
);

export default AlertaEdit;
