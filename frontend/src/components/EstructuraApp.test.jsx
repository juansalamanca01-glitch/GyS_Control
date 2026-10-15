import { fireEvent, render, screen, within } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import EstructuraApp from './EstructuraApp';

const logout = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, username: 'tecnico1', nombre_completo: 'Técnico Ficticio Uno', rol: 'patologo' },
    logout,
  }),
}));

function abrir(ruta = '/') {
  const router = createMemoryRouter(
    [
      { path: '/salir', element: <h1>Pantalla de salida</h1> },
      { path: '*', element: <EstructuraApp>contenido</EstructuraApp> },
    ],
    { initialEntries: [ruta] },
  );
  render(<RouterProvider router={router} />);
}

describe('EstructuraApp', () => {
  it('la barra lateral tiene el Inicio y los seis módulos, con el actual marcado', () => {
    abrir('/agenda');
    const menu = screen.getByRole('navigation', { name: 'Módulos' });
    const nombres = within(menu)
      .getAllByRole('link')
      .map((enlace) => enlace.textContent);
    expect(nombres).toEqual(['Inicio', 'Clientes', 'Servicios', 'Agenda', 'Inventario', 'Informes', 'Métricas']);
    expect(within(menu).getByRole('link', { name: 'Agenda' })).toHaveAttribute('aria-current', 'page');
    expect(within(menu).getByRole('link', { name: 'Inicio' })).not.toHaveAttribute('aria-current');
  });

  it('la barra superior muestra el título de la sección, el usuario y su rol como "Técnico"', () => {
    abrir('/inventario');
    const barra = screen.getByRole('banner');
    expect(within(barra).getByText('Inventario')).toBeInTheDocument();
    expect(within(barra).getByRole('link', { name: /Técnico Ficticio Uno/ })).toHaveAttribute('href', '/perfil');
    expect(within(barra).getByText('Técnico')).toBeInTheDocument();
  });

  it('las páginas legales se abren desde la barra lateral', () => {
    abrir('/');
    expect(screen.getByRole('link', { name: 'Política de Privacidad' })).toHaveAttribute(
      'href',
      '/politica-privacidad',
    );
    expect(screen.getByRole('link', { name: 'Términos y Condiciones' })).toHaveAttribute(
      'href',
      '/terminos-condiciones',
    );
  });

  it('el botón de menú (celular) abre y cierra la barra lateral', () => {
    abrir('/');
    const boton = screen.getByRole('button', { name: 'Abrir menú' });
    expect(boton).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(boton);
    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false');
  });

  // D-13: "Salir" no cierra la sesión de inmediato: navega a /salir, para que una pantalla
  // con cambios sin guardar pueda avisar mientras la sesión sigue abierta.
  it('"Salir" lleva a /salir sin cerrar todavía la sesión', async () => {
    abrir('/');
    fireEvent.click(screen.getByRole('button', { name: 'Salir' }));
    expect(await screen.findByRole('heading', { name: 'Pantalla de salida' })).toBeInTheDocument();
    expect(logout).not.toHaveBeenCalled();
  });
});
