import React, { useState, useEffect } from 'react';
import accessService from '../services/accessService';

const AccessPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    loadAccess();
    
  }, []);

  const loadAccess = async () => {
    try {
      const response = await accessService.list();
      setData(response);
    } catch (error) {
      console.error('Error cargando accesos:', error);
    }
  };

  const organizarRolesYPermisos = (data: any[]) => {
    const rolesMap: { [key: string]: any } = {};

    data.forEach(item => {
      const rol = item.role;
      const permiso = item.permission;
      
      if (!rolesMap[rol._id]) {
        rolesMap[rol._id] = {
          id: rol._id,
          name: rol.name,
          permisos: []
        };
      }
      
      rolesMap[rol._id].permisos.push({
        id: permiso._id,
        url: permiso.url,
        method: permiso.method,
        module: permiso.module,
        description: permiso.description
      });
    });

    return Object.values(rolesMap).sort((a, b) => a.name.localeCompare(b.name));
  };

  const rolesOrganizados = organizarRolesYPermisos(data);

  console.log(JSON.stringify(rolesOrganizados));
  

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Administración de Accesos</h1>
      
      {rolesOrganizados.map(rol => (
        <div key={rol.id} className="mb-6 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-3 text-blue-600">{rol.name}</h2>
          
          <div className="grid gap-3">
            {rol.permisos.map((permiso: any) => (
              <div key={permiso.id} className="border-l-4 border-blue-400 pl-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{permiso.description}</h3>
                    <p className="text-sm text-gray-600">{permiso.module}</p>
                  </div>
                  <div className="text-sm bg-gray-100 px-2 py-1 rounded">
                    <span className="font-mono text-blue-600">{permiso.method}</span> 
                    <span className="text-gray-500 ml-2">{permiso.url}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {rolesOrganizados.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No se encontraron roles y permisos
        </div>
      )}
    </div>
  );
};

export default AccessPage;