import { Edit, SimpleForm, TextInput, DateInput, NumberInput, Button } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';

const ResolucionEdit = (props: any) => {
  const navigate = useNavigate();
  return (
    <Edit {...props}>
      <SimpleForm>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
            <Button
              variant="contained"
              color="inherit"
              onClick={() => {
                const idExpediente = props?.record?.IdExpediente;
                if (idExpediente) {
                  navigate(`/resoluciones?filter=${encodeURIComponent(JSON.stringify({ IdExpediente: idExpediente }))}`);
                } else {
                  navigate('/resoluciones');
                }
              }}
              sx={{ bgcolor: '#e0e0e0', color: '#333', '&:hover': { bgcolor: '#bdbdbd' } }}
            >
              Volver a Resoluciones
            </Button>
          </Box>
        </Box>
        <NumberInput source="IdExpediente" label="Expediente" />
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
    </Edit>
  );
};

export default ResolucionEdit;
