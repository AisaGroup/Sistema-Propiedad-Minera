import { Create, SimpleForm, TextInput, NumberInput, DateInput } from 'react-admin';
import Box from '@mui/material/Box';
import { useLocation } from 'react-router-dom';

const NotificacionCreate = (props: any) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const idTransaccion = params.get('IdTransaccion');
  const defaultValues = {
    ...(props?.record || {}),
    ...(idTransaccion ? { IdTransaccion: Number(idTransaccion) } : {}),
  };
  return (
    <Create {...props} record={defaultValues}>
      <SimpleForm defaultValues={defaultValues}>
        <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 3, boxShadow: 3, p: { xs: 1, sm: 2, md: 3 }, border: '1px solid #eee' }}>
        {/* Datos principales */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 2fr 2fr' }, gap: 2, mb: 2, width: '100%' }}>
          {/* Mostrar solo el valor, sin permitir edición */}
          <TextInput source="IdTransaccion" label="Transacción" fullWidth defaultValue={defaultValues.IdTransaccion} InputProps={{ readOnly: true }} />
          {/* Campo oculto para asegurar que se envía el valor */}
          <NumberInput source="IdTransaccion" style={{ display: 'none' }} defaultValue={defaultValues.IdTransaccion} />
          <TextInput source="Organismo" label="Organismo" fullWidth />
          <TextInput source="Jurisdiccion" label="Jurisdicción" fullWidth />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 2, width: '100%' }}>
          <NumberInput source="IdExpediente" label="Expediente" fullWidth />
          <NumberInput source="IdTitular" label="Titular" fullWidth />
          <NumberInput source="IdTitMinDirLegal" label="TitMinDirLegal" fullWidth />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 2, width: '100%' }}>
          <NumberInput source="TipoNotificacion" label="Tipo Notificación" fullWidth />
          <NumberInput source="IdPropiedadMinera" label="Propiedad Minera" fullWidth />
          <NumberInput source="IdAutoridad" label="Autoridad" fullWidth />
        </Box>
        {/* Ubicación */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' }, gap: 2, mb: 2, width: '100%' }}>
          <TextInput source="Ubicacion" label="Ubicación" fullWidth />
          <TextInput source="Latitud" label="Latitud" fullWidth />
          <TextInput source="Longitud" label="Longitud" fullWidth />
        </Box>
        {/* Fechas */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 2, width: '100%' }}>
          <DateInput source="Plazo" label="Plazo" fullWidth />
          <DateInput source="Emision" label="Emisión" fullWidth />
          <DateInput source="AudFecha" label="Fecha Auditoría" fullWidth />
        </Box>
        {/* Resolución y Fundamentos */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 2, mb: 2, width: '100%' }}>
          <TextInput source="Resolucion" label="Resolución" fullWidth />
          <TextInput source="Fundamentos" label="Fundamentos" multiline minRows={2} fullWidth />
        </Box>
        {/* Funcionario y Observaciones */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 2, mb: 2, width: '100%' }}>
          <TextInput source="Funcionario" label="Funcionario" fullWidth />
          <TextInput source="Observaciones" label="Observaciones" multiline minRows={2} fullWidth />
        </Box>
        {/* Auditoría */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr' }, gap: 2, mb: 2, width: '100%' }}>
          <NumberInput source="AudUsuario" label="Usuario Auditoría" fullWidth />
        </Box>
      </Box>

      </SimpleForm>
    </Create>
  );
};

export default NotificacionCreate;
