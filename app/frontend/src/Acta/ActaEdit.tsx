import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { Edit, TabbedForm, FormTab, TextInput, NumberInput, DateInput, required, Button } from 'react-admin';
import ArchivoCreate from '../Archivos/ArchivoCreate';

const ActaEdit = (props: any) => {
  const navigate = useNavigate();
  return (
    <Edit {...props}>
      <TabbedForm>
        <FormTab label="Datos del Acta">
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', mb: 2 }}>
            <Button
              variant="contained"
              color="inherit"
              onClick={() => {
                const idExpediente = props?.record?.IdExpediente;
                if (idExpediente) {
                  navigate(`/actas?filter=${encodeURIComponent(JSON.stringify({ IdExpediente: idExpediente }))}`);
                } else {
                  navigate('/actas');
                }
              }}
              sx={{ bgcolor: '#e0e0e0', color: '#333', '&:hover': { bgcolor: '#bdbdbd' } }}
            >
              Volver a Actas
            </Button>
          </Box>
          <NumberInput source="IdTransaccion" label="Transacción" validate={required()} />
          <NumberInput source="IdExpediente" label="Expediente" validate={required()} />
          <TextInput source="IdTipoActa" label="Tipo de Acta" validate={required()} />
          <DateInput source="Fecha" label="Fecha" validate={required()} />
          <TextInput source="Lugar" label="Lugar" validate={required()} />
          <TextInput source="IdAutoridad" label="Autoridad" validate={required()} />
          <TextInput source="Descripcion" label="Descripción" multiline />
          <TextInput source="Obs" label="Observaciones" />
        </FormTab>
        <FormTab label="Archivos relacionados">
          <ArchivoCreate />
        </FormTab>
      </TabbedForm>
    </Edit>
  );
};

export default ActaEdit;
