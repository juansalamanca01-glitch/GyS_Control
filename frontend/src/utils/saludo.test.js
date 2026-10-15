import { describe, expect, it } from 'vitest';
import { fechaLarga, horaEnBogota, saludoSegunHora } from './saludo';

describe('saludo del Inicio', () => {
  it('cambia según la hora', () => {
    expect(saludoSegunHora(0)).toBe('Buenos días');
    expect(saludoSegunHora(11)).toBe('Buenos días');
    expect(saludoSegunHora(12)).toBe('Buenas tardes');
    expect(saludoSegunHora(18)).toBe('Buenas tardes');
    expect(saludoSegunHora(19)).toBe('Buenas noches');
    expect(saludoSegunHora(23)).toBe('Buenas noches');
  });

  it('usa la hora y la fecha de Bogotá, no las del navegador', () => {
    // 03:30 UTC del 16 de octubre = 22:30 del 15 de octubre en Bogotá (UTC-5).
    const fecha = new Date('2026-10-16T03:30:00Z');
    expect(horaEnBogota(fecha)).toBe(22);
    expect(fechaLarga(fecha)).toBe('Jueves, 15 de octubre de 2026');
  });
});
