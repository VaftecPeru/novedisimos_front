import { createContext, useContext, useState, useEffect } from "react"; // ¡Importa useEffect!
import { fetchAuthUser } from "./components/services/shopifyService";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  // 1. Inicializa el estado 'usuario' leyendo de localStorage al cargar
  const [usuario, setUsuario] = useState(() => {
    const storedUser = localStorage.getItem("currentUser");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Error parsing stored user from localStorage:", e);
      return null; // Si hay un error, el usuario es nulo
    }
  });

  // 2. Usa useEffect para guardar o eliminar el usuario en localStorage cada vez que 'usuario' cambie
  useEffect(() => {
    if (usuario) {
      localStorage.setItem("currentUser", JSON.stringify(usuario));
    } else {
      localStorage.removeItem("currentUser"); // Limpia si el usuario cierra sesión
    }
  }, [usuario]); // Dependencia: el efecto se ejecuta cuando 'usuario' cambia

  useEffect(() => {
    if (!usuario) {
      fetchAuthUser().then(fetchedUser => {
        if (fetchedUser) {
          setUsuario(fetchedUser);
        } else {
          // Si el token no es válido, limpiamos
          localStorage.removeItem("authToken");
          localStorage.removeItem("currentUser");
        }
      });
    }
  }, []);

  return (
    <UserContext.Provider value={{ usuario, setUsuario }}>
      {children}
    </UserContext.Provider>
  );
};

function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser debe ser usado dentro de UserProvider");
  }
  return context;
}

export { UserProvider, useUser };
