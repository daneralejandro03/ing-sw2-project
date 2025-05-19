import React, { useEffect, useState } from 'react';
import authService from '../../auth/services/authService';
import userService from '../../user/services/userService';
import {jwtDecode} from 'jwt-decode';
import Swal from 'sweetalert2';

type MyJwtPayload = {
  email: string;
  id: string;
  role: string;
  iat: number;
  exp: number;
};

const Profile: React.FC = () => {
  const [email, setEmail] = useState('');
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados para cambio de contraseña
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const load2FAStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const decoded = jwtDecode<MyJwtPayload>(token);
      setEmail(decoded.email);

      const { requiresTwoFactor } = await authService.confirmTwoFactor(decoded.email);
      setIs2faEnabled(requiresTwoFactor);
    } catch (error) {
      Swal.fire('Error', 'Error cargando estado del 2FA', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load2FAStatus();
  }, []);

  const handleToggle2FA = async () => {
    const action = is2faEnabled ? 'desactivar' : 'activar';
    const { isConfirmed } = await Swal.fire({
      title: `¿Quieres ${action} la autenticación 2FA?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar',
    });

    if (!isConfirmed) return;

    try {
      setIsProcessing(true);

      const response = await authService.toggle2fa({
        email,
        enable: !is2faEnabled,
      });
      setIs2faEnabled(response.requiresTwoFactor);
      await load2FAStatus();

      Swal.fire(
        '¡Éxito!',
        `2FA ${response.requiresTwoFactor ? 'activado' : 'desactivado'} correctamente.`,
        'success'
      );
    } catch (error) {
      Swal.fire('Error', 'Error al cambiar el estado del 2FA', 'error');
      await load2FAStatus();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      Swal.fire('Error', 'Las contraseñas nuevas no coinciden', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      await userService.changePassword({
        email,
        oldPassword,
        newPassword,
      });
      Swal.fire('Éxito', 'Contraseña cambiada correctamente', 'success');
      // Limpiar campos
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Error cambiando la contraseña',
        'error'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <p>Cargando perfil...</p>;

  return (
    <div className="max-w-md mt-5 p-6 mx-auto bg-white shadow rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">Perfil de Usuario</h2>
      <p className="mb-2">
        <strong>Email:</strong> {email}
      </p>
      <p className="mb-4">
        <strong>2FA:</strong> {is2faEnabled ? 'Activado' : 'Desactivado'}
      </p>
      <button
        onClick={handleToggle2FA}
        disabled={isProcessing}
        className={`w-full py-2 rounded-md text-white transition ${
          isProcessing
            ? 'bg-gray-400 cursor-not-allowed'
            : is2faEnabled
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isProcessing ? 'Procesando...' : is2faEnabled ? 'Desactivar 2FA' : 'Activar 2FA'}
      </button>

      <h3 className="text-xl font-semibold mt-6 mb-2">Cambiar Contraseña</h3>
      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Contraseña actual</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
            placeholder="Contraseña actual"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
            placeholder="Nueva contraseña"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirmar nueva contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
            placeholder="Confirmar nueva contraseña"
          />
        </div>
        <button
          type="submit"
          disabled={isProcessing}
          className={`w-full py-2 rounded-md text-white transition ${
            isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isProcessing ? 'Procesando...' : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
