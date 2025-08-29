
import { Menu, useSidebarState } from 'react-admin';
import { Accordion, AccordionSummary, AccordionDetails, List, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import { useNavigate } from 'react-router-dom';


const CustomMenu = () => {
  const navigate = useNavigate();
  const [open] = useSidebarState();
  return (
    <Menu>
      <Accordion elevation={0} sx={{ background: 'transparent', boxShadow: 'none' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pl: 2, fontSize: '1.3em', fontWeight: 'bold' }}>
          {open ? 'Maestros' : <FolderIcon />}
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <List disablePadding>
            <Tooltip title={!open ? "Tipos de Expediente" : ""} placement="right">
              <ListItemButton onClick={() => navigate('/tipos-expediente')} sx={{ pl: 4 }}>
                <ListItemIcon>
                  <AssignmentIcon />
                </ListItemIcon>
                {open && <ListItemText primary="Tipos de Expediente" />}
              </ListItemButton>
            </Tooltip>
            <Tooltip title={!open ? "Titulares Mineros" : ""} placement="right">
              <ListItemButton onClick={() => navigate('/titulares-mineros')} sx={{ pl: 4 }}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                {open && <ListItemText primary="Titulares Mineros" />}
              </ListItemButton>
            </Tooltip>
            <Tooltip title={!open ? "Autoridades" : ""} placement="right">
              <ListItemButton onClick={() => navigate('/autoridades')} sx={{ pl: 4 }}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                {open && <ListItemText primary="Autoridades" />}
              </ListItemButton>
            </Tooltip>
            <Tooltip title={!open ? "Áreas" : ""} placement="right">
              <ListItemButton onClick={() => navigate('/areas')} sx={{ pl: 4 }}>
                <ListItemIcon>
                  <HomeWorkIcon />
                </ListItemIcon>
                {open && <ListItemText primary="Áreas" />}
              </ListItemButton>
            </Tooltip>
          </List>
        </AccordionDetails>
      </Accordion>
      <Tooltip title={!open ? "Expedientes" : ""} placement="right">
        <ListItemButton onClick={() => navigate('/expedientes')}>
          <ListItemIcon>
            <FolderIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Expedientes" />}
        </ListItemButton>
      </Tooltip>
      <Tooltip title={!open ? "Propiedades Mineras" : ""} placement="right">
        <ListItemButton onClick={() => navigate('/propiedades-mineras')}>
          <ListItemIcon>
            <HomeWorkIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Propiedades Mineras" />}
        </ListItemButton>
      </Tooltip>
      {/* Más entidades fuera del apartado */}
    </Menu>
  );
};

export default CustomMenu;