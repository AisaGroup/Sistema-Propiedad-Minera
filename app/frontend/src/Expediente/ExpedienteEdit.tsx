
import React from 'react';
import { useGetList, Edit, TabbedForm, FormTab, TextInput, NumberInput, DateTimeInput, DateInput, ReferenceInput, SelectInput, useRecordContext, Button, ReferenceManyField, Datagrid, TextField, DateField, NumberField, EditButton, DeleteButton, CreateButton } from 'react-admin';
import NotificacionCreate from '../Notificacion/NotificacionCreate';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';

// Componente para mostrar alertas embebidas en el expediente
const AlertaInlineGrid = () => {
  const record = useRecordContext();
  if (!record || !Array.isArray(record.alertas) || record.alertas.length === 0) return null;
  return (
    <Datagrid data={record.alertas} rowClick={false} bulkActionButtons={false}>
      <TextField source="idAlerta" label="ID" />
      <NumberField source="IdTransaccion" label="Transacción" />
      <NumberField source="IdTipoAlerta" label="Tipo de Alerta" />
      <TextField source="Estado" label="Estado" />
      <TextField source="Asunto" label="Asunto" />
      <TextField source="Mensaje" label="Mensaje" />
      <TextField source="Medio" label="Medio" />
      <TextField source="Periodicidad" label="Periodicidad" />
      <DateField source="FechaInicio" label="Fecha Inicio" />
      <DateField source="FechaFin" label="Fecha Fin" />
      <TextField source="Obs" label="Observaciones" />
      <DateField source="AudFecha" label="Fecha Auditoría" />
      <NumberField source="AudUsuario" label="Usuario Auditoría" />
    </Datagrid>
  );
};

// Botón personalizado para crear alerta heredando IdTransaccion del expediente
function CustomCreateAlertaButton() {
  const record = useRecordContext();
  const navigate = useNavigate();
  if (!record) return null;
  const idTransaccion = record.IdTransaccion;
  if (!idTransaccion) return null;
  return (
    <Button
      variant="contained"
      color="primary"
      sx={{ mt: 2, mb: 2 }}
      onClick={() => navigate(`/alertas/create?IdTransaccion=${idTransaccion}`)}
    >
      Crear Alerta
    </Button>
  );
}

// Botón personalizado para crear alerta heredando IdTransaccion del expediente


// Botón personalizado para crear notificación heredando IdTransaccion del expediente
function CustomCreateNotificacionButton() {
  const record = useRecordContext();
  const navigate = useNavigate();
  if (!record) return null;
  const idTransaccion = record.IdTransaccion;
  if (!idTransaccion) return null;
  return (
    <Button
      variant="contained"
      color="primary"
      sx={{ mt: 2, mb: 2 }}
      onClick={() => navigate(`/notificaciones/create?IdTransaccion=${idTransaccion}`)}
    >
      Crear Notificación
    </Button>
  );
}

// Botón personalizado para crear resolución heredando IdExpediente
function CustomCreateResolucionButton() {
  const record = useRecordContext();
  const navigate = useNavigate();
  if (!record) return null;
  const idExpediente = record.IdExpediente || record.id;
  return (
    <Button
      variant="contained"
      color="primary"
      sx={{ mt: 2, mb: 2 }}
      onClick={() => navigate(`/resoluciones/create?IdExpediente=${idExpediente}`)}
    >
      Crear Resolución
    </Button>
  );
}




// Botón personalizado para crear acta heredando IdExpediente
function CustomCreateActaButton() {
  const record = useRecordContext();
  const navigate = useNavigate();
  if (!record) return null;
  const idExpediente = record.IdExpediente || record.id;
  return (
    <Button
      variant="contained"
      color="primary"
      sx={{ mt: 2, mb: 2 }}
      onClick={() => navigate(`/actas/create?IdExpediente=${idExpediente}`)}
    >
      Crear Acta
    </Button>
  );
}




const ExpedienteEdit = (props: any) => {
  const navigate = useNavigate();
  const record = props.record;
  
  // Componente para los botones arriba de los tabs
  const TopButtons = () => {
    const record = useRecordContext();
  console.log('[DEBUG TopButtons] record:', record);
  console.log('[DEBUG TopButtons] record.IdTransaccion:', record?.IdTransaccion);
    const id = record?.IdExpediente || record?.id;
    return (
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', mb: 2 }}>
        <Button
          variant="contained"
          color="inherit"
          onClick={() => navigate("/expedientes")}
          sx={{ bgcolor: '#e0e0e0', color: '#333', '&:hover': { bgcolor: '#bdbdbd' } }}
        >
          Volver
        </Button>
      </Box>
    );
  };
  return (
    <Edit {...props} sx={{ height: '100vh', minHeight: '100vh', p: 0, m: 0 }}>
      <TopButtons />
      <TabbedForm sx={{ height: '100vh', minHeight: '100vh', p: 0, m: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <FormTab label="Datos del Expediente">
          <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 3, boxShadow: 3, p: { xs: 1, sm: 2, md: 3 }, border: '1px solid #eee' }}>
            {/* Datos principales */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 3fr 2fr' }, gap: 2, mb: 2, width: '100%' }}>
              <TextInput source="CodigoExpediente" label="Código de Expediente" fullWidth />
              <TextInput source="Caratula" label="Carátula" fullWidth />
              <TextInput source="PrimerDueño" label="Primer Dueño" fullWidth />
            </Box>
            {/* Fechas */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 2, width: '100%' }}>
              <DateTimeInput source="Año" label="Año" fullWidth />
              <DateInput source="FechaInicio" label="Fecha de Inicio" fullWidth />
              <DateInput source="FechaFin" label="Fecha de Fin" fullWidth />
            </Box>
            {/* Estado y Dependencia */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2, width: '100%' }}>
              <TextInput source="Estado" label="Estado" fullWidth />
              <TextInput source="Dependencia" label="Dependencia" fullWidth />
            </Box>
            {/* Propiedad y Tipo de Expediente */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2, width: '100%' }}>
              <NumberInput source="IdPropiedadMinera" label="ID Propiedad Minera" fullWidth />
              <ReferenceInput label="Tipo de Expediente" source="IdTipoExpediente" reference="tipos-expediente" required fullWidth>
                <SelectInput optionText="Nombre" />
              </ReferenceInput>
            </Box>
            {/* Descripción y Observaciones */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2, width: '100%' }}>
              <TextInput source="Descripcion" multiline minRows={2} label="Descripción" fullWidth />
              <TextInput source="Observaciones" multiline minRows={2} label="Observaciones" fullWidth />
            </Box>
          </Box>
  </FormTab>

        <FormTab label="Actas">
          {/* Listado de actas embebido, filtrado por IdExpediente (modo simple) */}
          <ReferenceManyField reference="actas" target="IdExpediente">
            <Datagrid rowClick="edit">
              <TextField source="IdActa" label="ID" />
              <NumberField source="IdExpediente" label="Expediente" />
              <TextField source="IdTipoActa" label="Tipo de Acta" />
              <NumberField source="IdTransaccion" label="Transacción" />
              <TextField source="IdAutoridad" label="Autoridad" />
              <DateField source="Fecha" label="Fecha" />
              <TextField source="Lugar" label="Lugar" />
              <TextField source="Descripcion" label="Descripción" />
              <TextField source="Obs" label="Observaciones" />
              <EditButton />
              <DeleteButton />
            </Datagrid>
          </ReferenceManyField>
          {/* Botón personalizado para crear acta heredando IdExpediente */}
          <CustomCreateActaButton />
        </FormTab>

        <FormTab label="Resoluciones">
          {/* Listado de resoluciones embebido, filtrado por IdExpediente */}
          <ReferenceManyField reference="resoluciones" target="IdExpediente">
            <Datagrid rowClick="edit">
              <TextField source="IdResolucion" label="ID" />
              <NumberField source="IdExpediente" label="Expediente" />
              <TextField source="Numero" label="Número" />
              <TextField source="Titulo" label="Título" />
              <DateField source="Fecha_emision" label="Fecha Emisión" />
              <DateField source="Fecha_publicacion" label="Fecha Publicación" />
              <TextField source="Estado" label="Estado" />
              <TextField source="Organismo_emisor" label="Organismo Emisor" />
              <TextField source="Contenido" label="Contenido" />
              <TextField source="Descripcion" label="Descripción" />
              <TextField source="Observaciones" label="Observaciones" />
              <NumberField source="IdTtransaccion" label="ID Transacción" />
              <EditButton />
              <DeleteButton />
            </Datagrid>
          </ReferenceManyField>
          {/* Botón personalizado para crear resolución heredando IdExpediente */}

          <CustomCreateResolucionButton />
        </FormTab>


        <FormTab label="Alertas">
          <AlertaInlineGrid />
          <CustomCreateAlertaButton />
        </FormTab>
      </TabbedForm>
    </Edit>
  );
};

export default ExpedienteEdit;
