import { Create, SimpleForm, TextInput, NumberInput, DateInput, FileInput, required } from 'react-admin';
import { useNotify, useRedirect } from 'react-admin';

const ArchivoCreate = (props: any) => {
  const notify = useNotify();
  const redirect = useRedirect();

  // Custom save handler to use the /archivos/upload endpoint
  const save = async (values: any) => {
    const formData = new FormData();
    formData.append('file', values.file.rawFile);
    formData.append('tipo', values.tipo);
    if (values.IdTransaccion) formData.append('IdTransaccion', values.IdTransaccion);
    if (values.Descripcion) formData.append('Descripcion', values.Descripcion);
    formData.append('AudUsuario', values.AudUsuario);

    const response = await fetch('http://localhost:9000/archivos/upload', {
      method: 'POST',
      body: formData,
    });
    if (response.ok) {
      notify('Archivo subido correctamente');
      redirect('list', 'archivos');
    } else {
      notify('Error al subir el archivo', { type: 'error' });
    }
  };

  return (
    <Create {...props}>
      <SimpleForm onSubmit={save}>
        <TextInput source="tipo" label="Tipo (ej: actas, expedientes)" validate={required()} />
        <NumberInput source="IdTransaccion" label="ID Transacción (opcional)" />
        <TextInput source="Descripcion" label="Descripción" />
        <NumberInput source="AudUsuario" label="Usuario Auditoría" validate={required()} />
  <FileInput source="file" label="Archivo" validate={required()} />
      </SimpleForm>
    </Create>
  );
};

export default ArchivoCreate;
