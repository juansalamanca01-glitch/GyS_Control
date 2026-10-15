// Valores compartidos por varias páginas (auditoría M-3: antes estaban copiados en cada una).

// Nombre visible de cada rol de usuario. El valor interno 'patologo' se muestra como
// "Técnico" hasta la transformación del dominio, que definirá los roles (decisión G-3).
export const ROL_LABELS = {
  admin: 'Administrador',
  patologo: 'Técnico',
  auditor: 'Auditor',
};
