import { Create, SimpleForm, TextInput, DateInput, NumberInput } from 'react-admin';
import { useLocation } from 'react-router-dom';

const ResolucionCreate = (props: any) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const idExpediente = params.get('IdExpediente');
  const defaultValues = {
    ...(props?.record || {}),
    ...(idExpediente ? { IdExpediente: Number(idExpediente) } : {}),
  };
  return (
    <Create {...props} record={defaultValues}>
      <SimpleForm defaultValues={defaultValues}>
        {/* Mostrar solo el valor, sin permitir edición */}
        <TextInput source="IdExpediente" label="Expediente" fullWidth defaultValue={defaultValues.IdExpediente} InputProps={{ readOnly: true }} />
        {/* Campo oculto para asegurar que se envía el valor */}
        <NumberInput source="IdExpediente" style={{ display: 'none' }} defaultValue={defaultValues.IdExpediente} />
        <TextInput source="Numero" label="Número" />
        <TextInput source="Titulo" label="Título" />
        <DateInput source="Fecha_emision" label="Fecha Emisión" />
        <DateInput source="Fecha_publicacion" label="Fecha Publicación" />
        <TextInput source="Estado" label="Estado" />
        <TextInput source="Organismo_emisor" label="Organismo Emisor" />
        <TextInput source="Contenido" label="Contenido" multiline minRows={2} />
        <TextInput source="Descripcion" label="Descripción" />
        <TextInput source="Observaciones" label="Observaciones" />
        <NumberInput source="IdTtransaccion" label="ID Transacción" />
      </SimpleForm>
    </Create>
  );
};

export default ResolucionCreate;
