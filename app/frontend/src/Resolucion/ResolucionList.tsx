
import { List, Datagrid, TextField, DateField, EditButton, DeleteButton, TopToolbar, Button, CreateButton, ExportButton } from 'react-admin';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const ResolucionList = (props: any) => {
  const location = useLocation();
  const navigate = useNavigate();

  let filter: any = undefined;
  let idExpediente: number | string | undefined = undefined;
  const params = new URLSearchParams(location.search);
  let filterRaw = params.get('filter');
  if (props.filter && Object.keys(props.filter).length > 0) {
    filter = props.filter;
    idExpediente = filter.IdExpediente;
    if (idExpediente) sessionStorage.setItem('lastIdExpediente', String(idExpediente));
  } else if (filterRaw) {
    try {
      filter = JSON.parse(filterRaw || '{}');
    } catch {}
    idExpediente = filter?.IdExpediente;
    if (idExpediente) sessionStorage.setItem('lastIdExpediente', String(idExpediente));
  } else {
    idExpediente = sessionStorage.getItem('lastIdExpediente') || undefined;
  }

  // Redirigir si no hay filtro en la URL pero sí en sessionStorage
  useEffect(() => {
    if (!filterRaw && idExpediente) {
      const filtro = encodeURIComponent(JSON.stringify({ IdExpediente: idExpediente }));
      navigate(`/resoluciones?filter=${filtro}`);
    }
    // eslint-disable-next-line
  }, []);

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
    <List {...props} filter={filter} actions={<ListActions />}>
      <Datagrid rowClick="edit">
        <TextField source="IdResolucion" label="ID" />
        <TextField source="IdExpediente" label="Expediente" />
        <TextField source="Numero" label="Número" />
        <TextField source="Titulo" label="Título" />
        <DateField source="Fecha_emision" label="Fecha Emisión" />
        <DateField source="Fecha_publicacion" label="Fecha Publicación" />
        <TextField source="Estado" label="Estado" />
        <TextField source="Organismo_emisor" label="Organismo Emisor" />
        <TextField source="Descripcion" label="Descripción" />
        <TextField source="Observaciones" label="Observaciones" />
        <EditButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
};

export default ResolucionList;
