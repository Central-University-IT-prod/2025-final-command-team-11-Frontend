import { jwtDecode } from "jwt-decode";

export function GetJWTBody(token: string) {
  const decoded = jwtDecode(token);
  return decoded as {
    role: string;
    id: string;
  };
}
