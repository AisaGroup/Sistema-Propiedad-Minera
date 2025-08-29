import { useNotify, useRecordContext } from 'react-admin';
import { useState } from 'react';

const ActaArchivoCreateInline = () => {
  const notify = useNotify();
  const record = useRecordContext();
  const [file, setFile] = useState<File | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [audUsuario, setAudUsuario] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !record) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo', 'actas');
    formData.append('IdTransaccion', record.IdTransaccion);
    formData.append('Descripcion', descripcion);
    formData.append('AudUsuario', audUsuario);
    const response = await fetch('http://localhost:9000/archivos/upload', {
      method: 'POST',
      body: formData,
    });
    setUploading(false);
    if (response.ok) {
      notify('Archivo subido correctamente');
      setFile(null);
      setDescripcion('');
      setAudUsuario('');
    } else {
      notify('Error al subir el archivo', { type: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 24, marginBottom: 24 }}>
      <div>
        <label>Archivo: </label>
        <input type="file" onChange={handleFileChange} required />
      </div>
      <div>
        <label>Descripción: </label>
        <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
      </div>
      <div>
        <label>Usuario Auditoría: </label>
        <input type="number" value={audUsuario} onChange={e => setAudUsuario(e.target.value)} required />
      </div>
      <button type="submit" disabled={uploading}>{uploading ? 'Subiendo...' : 'Subir Archivo'}</button>
    </form>
  );
};

export default ActaArchivoCreateInline;
