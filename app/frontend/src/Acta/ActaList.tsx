import { List, Datagrid, TextField, DateField, NumberField, EditButton, DeleteButton, useListContext, Button, TopToolbar, CreateButton, ExportButton } from 'react-admin';
import { Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';



const ActaList = (props: any) => {
  // Siempre declarar hooks arriba
  const location = useLocation();
  const navigate = useNavigate();

  // Permite filtrar por IdExpediente desde props o desde la URL
  let filter: any = undefined;
  let idExpediente: number | string | undefined = undefined;
  const params = new URLSearchParams(location.search);
  let filterRaw = params.get('filter');
  if (props.filter && Object.keys(props.filter).length > 0) {
    filter = props.filter;
    idExpediente = filter.IdExpediente;
    if (idExpediente) sessionStorage.setItem('lastIdExpedienteActa', String(idExpediente));
  } else if (filterRaw) {
    try {
      filter = JSON.parse(filterRaw || '{}');
    } catch {}
    idExpediente = filter?.IdExpediente;
    if (idExpediente) sessionStorage.setItem('lastIdExpedienteActa', String(idExpediente));
  } else {
    idExpediente = sessionStorage.getItem('lastIdExpedienteActa') || undefined;
  }

  // Redirigir si no hay filtro en la URL pero sí en sessionStorage
  useEffect(() => {
    if (!filterRaw && idExpediente) {
      const filtro = encodeURIComponent(JSON.stringify({ IdExpediente: idExpediente }));
      navigate(`/actas?filter=${filtro}`);
    }
    // eslint-disable-next-line
  }, []);

  // Custom actions toolbar
  const ListActions = (props: any) => (
    <TopToolbar sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Button
        label="Volver al Expediente"
        onClick={() => navigate(`/expedientes/${idExpediente || ''}`)}
        variant="contained"
        color="primary"
        size="small"
        sx={{ minWidth: 'auto', px: 1.5, py: 0.2, fontSize: '0.8rem', lineHeight: 1, borderRadius: 2, width: 'auto', mr: 1 }}
        disabled={!idExpediente}
      />
      <div style={{ flex: 1 }} />
      <CreateButton />
      <ExportButton />
    </TopToolbar>
  );

  return (
    <>
      {/* Panel de depuración eliminado */}
      <List
        {...props}
        filter={filter}
        actions={<ListActions />}
        empty={<Box sx={{ p: 3 }}></Box>}
      >
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
      </List>
    </>
  );
};

export default ActaList;
