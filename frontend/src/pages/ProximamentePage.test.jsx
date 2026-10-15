import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { MODULOS } from '../modulos';
import ProximamentePage from './ProximamentePage';

describe('ProximamentePage', () => {
  it.each(MODULOS.map((m) => [m.nombre, m]))('%s: muestra su nombre, "Próximamente" y qué hará', (nombre, modulo) => {
    render(
      <MemoryRouter>
        <ProximamentePage modulo={modulo} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1, name: nombre })).toBeInTheDocument();
    expect(screen.getByText('Próximamente')).toBeInTheDocument();
    expect(screen.getByText(modulo.descripcion)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
  });
});
