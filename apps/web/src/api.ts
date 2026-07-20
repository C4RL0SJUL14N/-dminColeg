const API_URL = (
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "http://127.0.0.1:3000" : "/api")
).replace(/\/$/, "");

export interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  requiereCambioContrasena?: boolean;
  requiereSeleccionPerfil?: boolean;
  contextoAcceso?: {
    roles?: Array<{ codigo: string; nombre?: string }>;
    perfiles?: Array<{ id: string; codigo: string; nombre?: string }>;
  };
  perfilPredeterminado?: { codigo?: string; nombre?: string } | null;
}

export async function login(correo: string, contrasena: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, contrasena }),
  });
  const payload = (await response.json()) as {
    data?: LoginResponse;
    message?: string | string[];
  };
  if (!response.ok) {
    const message = Array.isArray(payload.message)
      ? payload.message.join(". ")
      : payload.message;
    throw new Error(message || "No fue posible iniciar sesión");
  }
  return payload.data ?? (payload as unknown as LoginResponse);
}

export async function cambiarContrasenaInicial(
  correo: string,
  contrasenaActual: string,
  nuevaContrasena: string,
) {
  const response = await fetch(`${API_URL}/auth/cambiar-contrasena-inicial`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, contrasenaActual, nuevaContrasena }),
  });
  const payload = (await response.json()) as {
    data?: LoginResponse;
    message?: string | string[];
  };
  if (!response.ok) {
    const message = Array.isArray(payload.message)
      ? payload.message.join(". ")
      : payload.message;
    throw new Error(message || "No fue posible actualizar la contraseña");
  }
  return payload.data ?? (payload as unknown as LoginResponse);
}

export function getApiUrl() {
  return API_URL;
}
