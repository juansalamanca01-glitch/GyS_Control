import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

const login = vi.fn();
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ login }) }));

describe('LoginPage', () => {
  it('con credenciales incorrectas muestra el error como alerta', async () => {
    login.mockRejectedValue({ response: { data: { detail: 'Credenciales incorrectas.' } } });
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'tecnico1' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'mala' } });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));
    // role="alert": los lectores de pantalla lo anuncian (y Cypress lo encuentra por su rol).
    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales incorrectas.');
  });
});
