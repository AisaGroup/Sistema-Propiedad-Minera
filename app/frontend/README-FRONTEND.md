# Sistema de Gestión de Propiedades Mineras - Frontend Angular

Este es el frontend del sistema de gestión de propiedades mineras construido con Angular 18 y Angular Material.

## 🚀 Características

- **Layout moderno**: Sidebar con navegación y toolbar superior
- **Angular Material**: UI components profesionales con tema Azure/Blue
- **Arquitectura escalable**: Separación por features y servicios
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **TypeScript**: Tipado fuerte para mejor mantenibilidad

## 📁 Estructura del Proyecto

```
src/app/
├── core/                 # Servicios principales
│   └── services/        # Servicios API
├── shared/              # Componentes y modelos compartidos
│   └── models/          # Interfaces TypeScript
├── features/            # Módulos por funcionalidad
│   └── propiedades/     # Gestión de propiedades mineras
├── layout/              # Componentes de layout
└── app.routes.ts        # Configuración de rutas
```

## 🎯 Componentes Principales

### MainLayoutComponent
- Sidebar con navegación
- Toolbar superior con menú de usuario
- Layout responsive

### PropiedadesListComponent
- Lista de propiedades mineras
- Filtros avanzados de búsqueda
- Tabla con paginación y ordenamiento
- Acciones CRUD

### PropiedadMineraService
- Comunicación con el backend FastAPI
- Métodos para CRUD de propiedades
- Manejo de filtros

## 🔗 Conexión con Backend

El frontend se conecta directamente al backend FastAPI usando CORS:
- Backend: `http://localhost:9000`
- Frontend: `http://localhost:4200`

## 🚀 Comandos

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
ng serve

# Construir para producción
ng build

# Ejecutar tests
ng test
```

## 📝 Próximos Pasos

1. ✅ Layout principal creado
2. ✅ Lista de propiedades implementada
3. 🔄 Implementar formularios CRUD
4. 🔄 Añadir autenticación
5. 🔄 Implementar otros módulos (expedientes, titulares, etc.)

## 🎨 Tema y Estilos

- **Paleta principal**: Azure/Blue
- **Fuente**: Roboto
- **Framework CSS**: Angular Material
- **Responsive**: Mobile-first approach
