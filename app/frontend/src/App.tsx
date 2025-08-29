import AutoridadList from './Autoridad/AutoridadList';
import AutoridadCreate from './Autoridad/AutoridadCreate';
import AutoridadEdit from './Autoridad/AutoridadEdit';
import AreaList from './Area/AreaList';
import AreaCreate from './Area/AreaCreate';
import AreaEdit from './Area/AreaEdit';
import { Admin, Layout, Resource } from 'react-admin';
import dataProvider from './dataProvider';
import PropiedadCreate from './propiedad_minera/PropiedadCreate';



import PropiedadList from './propiedad_minera/PropiedadList';
import PropiedadEdit from './propiedad_minera/PropiedadEdit';


import ExpedienteList from './Expediente/ExpedienteList';
import ExpedienteCreate from './Expediente/ExpedienteCreate';
import ExpedienteEdit from './Expediente/ExpedienteEdit';

import TipoExpedienteList from './TipoExpediente/TipoExpedienteList';
import TipoExpedienteCreate from './TipoExpediente/TipoExpedienteCreate';
import TipoExpedienteEdit from './TipoExpediente/TipoExpedienteEdit';


import TitularMineroList from './TitularMinero/TitularMineroList';
import TitularMineroCreate from './TitularMinero/TitularMineroCreate';
import TitularMineroEdit from './TitularMinero/TitularMineroEdit';
import CustomMenu from './CustomMenu';
import ActaList from './Acta/ActaList';
import ActaCreate from './Acta/ActaCreate';
import ActaEdit from './Acta/ActaEdit';
import ResolucionList from './Resolucion/ResolucionList';
import ResolucionCreate from './Resolucion/ResolucionCreate';
import ResolucionEdit from './Resolucion/ResolucionEdit';
import AlertaList from './Alerta/AlertaList';
import AlertaCreate from './Alerta/AlertaCreate';
import AlertaEdit from './Alerta/AlertaEdit';
const CustomLayout = (props: any) => <Layout {...props} menu={CustomMenu} />;
function App() {
  return (
    <Admin dataProvider={dataProvider} layout={CustomLayout}>
      <Resource name="propiedades-mineras" list={PropiedadList} create={PropiedadCreate} edit={PropiedadEdit} options={{ label: "Propiedades Mineras" }} />
      <Resource name="expedientes" list={ExpedienteList} create={ExpedienteCreate} edit={ExpedienteEdit} options={{ label: "Expedientes" }} />
      <Resource name="tipos-expediente" list={TipoExpedienteList} create={TipoExpedienteCreate} edit={TipoExpedienteEdit} options={{ label: "Tipos de Expediente" }} />
      <Resource name="titulares-mineros" list={TitularMineroList} create={TitularMineroCreate} edit={TitularMineroEdit} options={{ label: "Titulares Mineros" }} />
      <Resource name="actas" list={ActaList} create={ActaCreate} edit={ActaEdit} options={{ label: "Actas" }} />
      <Resource name="resoluciones" list={ResolucionList} create={ResolucionCreate} edit={ResolucionEdit} options={{ label: "Resoluciones" }} />
      <Resource name="autoridades" list={AutoridadList} create={AutoridadCreate} edit={AutoridadEdit} options={{ label: "Autoridades" }} />
      <Resource name="areas" list={AreaList} create={AreaCreate} edit={AreaEdit} options={{ label: "Áreas" }} />
      <Resource name="notificaciones" list={require('./Notificacion/NotificacionList').default} create={require('./Notificacion/NotificacionCreate').default} edit={require('./Notificacion/NotificacionEdit').default} options={{ label: "Notificaciones" }} />
      <Resource name="alertas" list={AlertaList} create={AlertaCreate} edit={AlertaEdit} options={{ label: "Alertas" }} />
    </Admin>
  );
}

export default App;
