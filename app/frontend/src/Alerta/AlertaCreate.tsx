
import { Create, SimpleForm, TextInput, NumberInput, DateInput } from 'react-admin';
import { useLocation } from 'react-router-dom';

const AlertaCreate = (props: any) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const idTransaccion = params.get('IdTransaccion');
  const initialValues = idTransaccion ? { IdTransaccion: Number(idTransaccion) } : {};
  return (
    <Create {...props}>
      <SimpleForm defaultValues={initialValues}>
  <NumberInput source="IdTransaccion" label="Transacción" InputProps={{ readOnly: true }} />
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
    </Create>
  );
};

export default AlertaCreate;
