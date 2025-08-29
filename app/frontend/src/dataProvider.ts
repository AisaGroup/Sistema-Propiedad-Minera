import simpleRestProvider from 'ra-data-simple-rest';

const baseDataProvider = simpleRestProvider('http://localhost:9000');

const normalizeResource = (resource: string) => resource;

const dataProvider = {
  ...baseDataProvider,
  getList: async (resource: string, params: any) => {
    // Soporte para alertasByParent (filtrado por tipo e id de entidad)
    if (resource === 'alertasByParent') {
      const { tipo_padre, id_padre } = params.filter;
      const { page, perPage } = params.pagination;
      const range = `[${(page - 1) * perPage},${page * perPage - 1}]`;
      const url = `http://localhost:9000/alertas/by-parent?tipo_padre=${tipo_padre}&id_padre=${id_padre}`;
      const response = await fetch(url, { headers: { range } });
      const data = await response.json();
      const contentRange = response.headers.get('Content-Range');
      const total = contentRange ? parseInt(contentRange.split('/')[1], 10) : data.length;
      return {
        data: data.map((item: any) => ({ ...item, id: item.idAlerta })),
        total,
      };
    }
    // Resto de recursos normales
    const response = await baseDataProvider.getList(normalizeResource(resource), params);
    return {
      ...response,
      data: response.data.map((item: any) =>
        resource === 'actas'
          ? { ...item, id: item.IdActa }
          : resource === 'resoluciones'
          ? { ...item, id: item.IdResolucion }
          : resource === 'expedientes'
          ? { ...item, id: item.IdExpediente }
          : resource === 'tipos-expediente'
          ? { ...item, id: item.IdTipoExpediente }
          : resource === 'titulares-mineros'
          ? { ...item, id: item.IdTitular }
          : resource === 'autoridades'
          ? { ...item, id: item.IdAutoridad }
          : resource === 'areas'
          ? { ...item, id: item.IdArea }
          : resource === 'archivos'
          ? { ...item, id: item.IdArchivo }
          : resource === 'notificaciones'
          ? { ...item, id: item.IdNotificacion }
          : resource === 'alertas'
          ? { ...item, id: item.idAlerta }
          : { ...item, id: item.IdPropiedadMinera ?? item.id }
      ),
    };
  },
  getManyReference: async (resource: string, params: any) => {
    if (resource === 'alertasByParent') {
      const { tipo_padre, id_padre } = params.filter;
      const { page, perPage } = params.pagination;
      const range = `[${(page - 1) * perPage},${page * perPage - 1}]`;
      const url = `http://localhost:9000/alertas/by-parent?tipo_padre=${tipo_padre}&id_padre=${id_padre}`;
      const response = await fetch(url, { headers: { range } });
      const data = await response.json();
      const contentRange = response.headers.get('Content-Range');
      const total = contentRange ? parseInt(contentRange.split('/')[1], 10) : data.length;
      return {
        data: data.map((item: any) => ({ ...item, id: item.idAlerta })),
        total,
      };
    }
    // ...existing code...
    const response = await baseDataProvider.getManyReference(normalizeResource(resource), params);
    return {
      ...response,
      data: response.data.map((item: any) =>
        resource === 'actas'
          ? { ...item, id: item.IdActa }
          : resource === 'resoluciones'
          ? { ...item, id: item.IdResolucion }
          : resource === 'expedientes'
          ? { ...item, id: item.IdExpediente }
          : resource === 'tipos-expediente'
          ? { ...item, id: item.IdTipoExpediente }
          : resource === 'titulares-mineros'
          ? { ...item, id: item.IdTitular }
          : resource === 'autoridades'
          ? { ...item, id: item.IdAutoridad }
          : resource === 'areas'
          ? { ...item, id: item.IdArea }
          : resource === 'archivos'
          ? { ...item, id: item.IdArchivo }
          : resource === 'notificaciones'
          ? { ...item, id: item.IdNotificacion }
          : { ...item, id: item.IdPropiedadMinera ?? item.id }
      ),
    };
  },
  getOne: async (resource: string, params: any) => {
  const response = await baseDataProvider.getOne(normalizeResource(resource), params);
    return {
      ...response,
      data: {
        ...response.data,
        id:
          resource === 'expedientes'
            ? response.data.IdExpediente
            : resource === 'tipos-expediente'
            ? response.data.IdTipoExpediente
            : resource === 'titulares-mineros'
            ? response.data.IdTitular
            : resource === 'actas'
            ? response.data.IdActa
            : resource === 'resoluciones'
            ? response.data.IdResolucion
            : resource === 'autoridades'
            ? response.data.IdAutoridad
            : resource === 'areas'
            ? response.data.IdArea
            : resource === 'archivos'
            ? response.data.IdArchivo
            : resource === 'notificaciones'
            ? response.data.IdNotificacion
            : (response.data.IdPropiedadMinera ?? response.data.id),
      },
    };
  },
  getMany: async (resource: string, params: any) => {
  const response = await baseDataProvider.getMany(normalizeResource(resource), params);
    return {
      ...response,
      data: response.data.map((item: any) => {
        if (resource === 'expedientes') {
          return { ...item, id: item.IdExpediente };
        }
        if (resource === 'tipos-expediente') {
          return { ...item, id: item.IdTipoExpediente };
        }
        if (resource === 'titulares-mineros') {
          return { ...item, id: item.IdTitular };
        }
        if (resource === 'actas') {
          return { ...item, id: item.IdActa };
        }
        if (resource === 'resoluciones') {
          return { ...item, id: item.IdResolucion };
        }
        if (resource === 'autoridades') {
          return { ...item, id: item.IdAutoridad };
        }
        if (resource === 'areas') {
          return { ...item, id: item.IdArea };
        }
        if (resource === 'archivos') {
          return { ...item, id: item.IdArchivo };
        }
        if (resource === 'notificaciones') {
          return { ...item, id: item.IdNotificacion };
        }
        return { ...item, id: item.IdPropiedadMinera ?? item.id };
      }),
    };
  },
  create: async (resource: string, params: any) => {
    const { id, ...dataWithoutId } = params.data;
    // Limpiar campos vacíos, undefined o null
    const cleanData = Object.fromEntries(
      Object.entries(dataWithoutId).filter(
        ([, v]) => v !== undefined && v !== null && v !== ''
      )
    );
    const response = await baseDataProvider.create(normalizeResource(resource), { ...params, data: cleanData });
    if (resource === 'expedientes') {
      return {
        ...response,
        data: {
          ...response.data,
          id: response.data.IdExpediente,
        },
      };
    }
    if (resource === 'tipos-expediente') {
      return {
        ...response,
        data: {
          ...response.data,
          id: response.data.IdTipoExpediente,
        },
      };
    }
    if (resource === 'titulares-mineros') {
      return {
        ...response,
        data: {
          ...response.data,
          id: response.data.IdTitular,
        },
      };
    }
    if (resource === 'actas') {
      return {
        ...response,
        data: {
          ...response.data,
          id: response.data.IdActa,
        },
      };
    }
    if (resource === 'resoluciones') {
      return {
        ...response,
        data: {
          ...response.data,
          id: response.data.IdResolucion,
        },
      };
    }
    if (resource === 'autoridades') {
      return {
        ...response,
        data: {
          ...response.data,
          id: response.data.IdAutoridad,
        },
      };
    }
    if (resource === 'areas') {
      return {
        ...response,
        data: {
          ...response.data,
          id: response.data.IdArea,
        },
      };
    }
    if (resource === 'archivos') {
      return {
        ...response,
        data: {
          ...response.data,
          id: response.data.IdArchivo,
        },
      };
    }
    if (resource === 'notificaciones') {
      return {
        ...response,
        data: {
          ...response.data,
          id: response.data.IdNotificacion,
        },
      };
    }
    if (resource === 'propiedades-mineras') {
      return {
        ...response,
        data: {
          ...response.data,
          id: response.data.IdPropiedadMinera ?? response.data.id,
        },
      };
    }
    if (resource === 'alertas') {
      return {
        ...response,
        data: {
          ...response.data,
          id: response.data.idAlerta,
        },
      };
    }
    return response;
  },
  update: async (resource: string, params: any) => {
    const { id, ...dataWithoutId } = params.data;
  const response = await baseDataProvider.update(normalizeResource(resource), { ...params, data: dataWithoutId });
    return {
      ...response,
      data: {
        ...response.data,
        id:
          resource === 'expedientes'
            ? response.data.IdExpediente
            : resource === 'tipos-expediente'
            ? response.data.IdTipoExpediente
            : resource === 'titulares-mineros'
            ? response.data.IdTitular
            : resource === 'actas'
            ? response.data.IdActa
            : resource === 'resoluciones'
            ? response.data.IdResolucion
            : resource === 'autoridades'
            ? response.data.IdAutoridad
            : resource === 'areas'
            ? response.data.IdArea
            : resource === 'archivos'
            ? response.data.IdArchivo
            : resource === 'notificaciones'
            ? response.data.IdNotificacion
            : (response.data.IdPropiedadMinera ?? response.data.id),
      },
    };
  },
};

export default dataProvider;
