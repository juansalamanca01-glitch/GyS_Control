import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import InicioPage from './InicioPage';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, username: 'tecnico1', nombre_completo: 'Técnico Ficticio Uno', rol: 'patologo' } }),
}));

function abrir() {
  render(
    <MemoryRouter>
      <InicioPage />
    </MemoryRouter>,
  );
}

describe('InicioPage', () => {
  it('saluda al usuario por su nombre', () => {
    abrir();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /^(Buenos días|Buenas tardes|Buenas noches), Técnico Ficticio Uno$/,
      }),
    ).toBeInTheDocument();
  });

  it('los indicadores dicen "Próximamente" y no muestran cifras', () => {
    abrir();
    const indicadores = screen.getByRole('region', { name: 'Indicadores' });
    const tarjetas = within(indicadores).getAllByRole('listitem');
    expect(tarjetas.map((t) => within(t).getByRole('heading').textContent)).toEqual([
      'Servicios del mes',
      'Clientes activos',
      'Productos por vencer',
      'Próximas visitas',
    ]);
    tarjetas.forEach((tarjeta) => {
      expect(within(tarjeta).getByText('Próximamente')).toBeInTheDocument();
      expect(within(tarjeta).getByText('Sin datos todavía.')).toBeInTheDocument();
    });
    // Ningún número inventado: los únicos dígitos son los "60 días" y "7 días" de las explicaciones.
    const valores = indicadores.querySelectorAll('.indicador-valor');
    valores.forEach((valor) => expect(valor.textContent).not.toMatch(/\d/));
  });

  it('tiene un acceso rápido a cada módulo', () => {
    abrir();
    const accesos = screen.getByRole('region', { name: 'Accesos rápidos' });
    const rutas = within(accesos)
      .getAllByRole('link')
      .map((enlace) => enlace.getAttribute('href'));
    expect(rutas).toEqual(['/clientes', '/servicios', '/agenda', '/inventario', '/informes', '/metricas']);
  });
});
