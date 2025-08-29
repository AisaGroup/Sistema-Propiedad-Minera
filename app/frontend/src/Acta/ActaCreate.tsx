
import { Create, SimpleForm, TextInput, NumberInput, DateInput, required } from 'react-admin';
import { useLocation } from 'react-router-dom';


import { Box } from '@mui/material';



const ActaCreate = (props: any) => {
  // Leer IdExpediente de la query string
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const idExpediente = params.get('IdExpediente');
  // Permitir override por props.record si existe
  const defaultValues = {
    ...(props?.record || {}),
    ...(idExpediente ? { IdExpediente: Number(idExpediente) } : {}),
  };
  return (
    <Create {...props} record={defaultValues}>
      <SimpleForm defaultValues={defaultValues}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 2,
            width: '100%',
          }}
        >
          <NumberInput source="IdTransaccion" label="Transacción" fullWidth />
          {/* Mostrar solo el valor, sin permitir edición */}
          <TextInput source="IdExpediente" label="Expediente" fullWidth defaultValue={defaultValues.IdExpediente} InputProps={{ readOnly: true }} />
          {/* Campo oculto para asegurar que se envía el valor */}
          <NumberInput source="IdExpediente" style={{ display: 'none' }} defaultValue={defaultValues.IdExpediente} />
          <TextInput source="IdTipoActa" label="Tipo de Acta" fullWidth />
          <DateInput source="Fecha" label="Fecha" fullWidth />
          <TextInput source="Lugar" label="Lugar" fullWidth />
          <NumberInput source="IdAutoridad" label="Autoridad" fullWidth />
          <TextInput source="Descripcion" label="Descripción" multiline fullWidth />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, width: '100%', mt: 2 }}>
          <TextInput source="Obs" label="Observaciones" fullWidth />
        </Box>
      </SimpleForm>
    </Create>
  );
};

export default ActaCreate;
