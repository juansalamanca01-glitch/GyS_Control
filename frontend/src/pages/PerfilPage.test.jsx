import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import client from '../api/client';
import PerfilPage from './PerfilPage';

// Se reemplaza el cliente de la API para simular sus respuestas sin backend.
vi.mock('../api/client', () => ({
  default: { get: vi.fn(), patch: vi.fn(), post: vi.fn() },
}));

const PERFIL = {
  username: 'tecnico1',
  rol: 'patologo',
  nombre_completo: 'Técnico Ficticio Uno',
  email: 'tecnico1@gyscontrol.local',
  telefono: '',
  especialidad: '',
};

// Hallazgo M-8 de docs/historial-patholab/auditoria-inicial.md: si la carga del perfil fallaba,
// la página intentaba leer perfil.nombre_completo con perfil = null y toda la
// pantalla quedaba en blanco.
describe('PerfilPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra un mensaje y un botón para reintentar si falla la carga', async () => {
    client.get.mockRejectedValue(new Error('Network Error'));
    render(<PerfilPage />);
    expect(await screen.findByText(/No se pudo cargar tu perfil/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
  });

  it('al pulsar Reintentar vuelve a pedir el perfil y lo muestra', async () => {
    client.get.mockRejectedValueOnce(new Error('Network Error')).mockResolvedValueOnce({ data: PERFIL });
    render(<PerfilPage />);
    (await screen.findByRole('button', { name: /Reintentar/i })).click();
    expect(await screen.findByDisplayValue('Técnico Ficticio Uno')).toBeInTheDocument();
    expect(client.get).toHaveBeenCalledTimes(2);
  });

  it('muestra el formulario cuando la carga funciona', async () => {
    client.get.mockResolvedValue({ data: PERFIL });
    render(<PerfilPage />);
    expect(await screen.findByDisplayValue('Técnico Ficticio Uno')).toBeInTheDocument();
    expect(screen.getByText(/@tecnico1/)).toBeInTheDocument();
    // El rol interno 'patologo' se muestra como "Técnico" (G-3).
    expect(screen.getByText(/^Técnico ·/)).toBeInTheDocument();
  });

  // "Especialidad" venía de la especialidad del patólogo: no se muestra ni se envía (G-3).
  it('no muestra "Especialidad" y no la envía al guardar', async () => {
    client.get.mockResolvedValue({ data: PERFIL });
    client.patch.mockResolvedValue({ data: PERFIL });
    render(<PerfilPage />);
    await screen.findByDisplayValue('Técnico Ficticio Uno');
    expect(screen.queryByText('Especialidad')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await vi.waitFor(() => expect(client.patch).toHaveBeenCalled());
    expect(client.patch.mock.calls[0][1]).not.toHaveProperty('especialidad');
  });
});

// Decisión D-6: al cambiar la contraseña se invalidan las sesiones anteriores y el
// backend devuelve tokens nuevos; la página los guarda para que la sesión siga abierta.
describe('PerfilPage: cambiar contraseña', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    client.get.mockResolvedValue({ data: PERFIL });
  });

  it('guarda los tokens nuevos que devuelve el backend', async () => {
    client.post.mockResolvedValue({ data: { detail: 'ok', access: 'access-nuevo', refresh: 'refresh-nuevo' } });
    const { container } = render(<PerfilPage />);
    await screen.findByDisplayValue('Técnico Ficticio Uno');
    const [actual, nueva, confirmar] = container.querySelectorAll('input[type="password"]');
    fireEvent.change(actual, { target: { value: 'ClaveVieja-2026' } });
    fireEvent.change(nueva, { target: { value: 'Control-Seguro-2026' } });
    fireEvent.change(confirmar, { target: { value: 'Control-Seguro-2026' } });
    fireEvent.submit(nueva.closest('form'));
    expect(await screen.findByText('Contraseña actualizada correctamente.')).toBeInTheDocument();
    expect(localStorage.getItem('access_token')).toBe('access-nuevo');
    expect(localStorage.getItem('refresh_token')).toBe('refresh-nuevo');
  });
});
