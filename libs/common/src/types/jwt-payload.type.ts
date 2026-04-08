export interface JwtPayload {
  sub: string;
  usuarioId: string;
  institucionId: string | null;
  personaId: string;
  perfilIdSeleccionado?: string | null;
  perfilCodigoSeleccionado?: string | null;
  roles: string[];
  superadministrador: boolean;
  sessionId: string;
}

