export interface AccessContextDto {
  usuarioId: string;
  institucionId: string | null;
  personaId: string;
  superadministrador: boolean;
  perfiles: Array<{
    id: string;
    codigo: string;
    nombre: string;
    predeterminado: boolean;
  }>;
  roles: Array<{
    id: string;
    codigo: string;
    nombre: string;
  }>;
  permisos: string[];
}

