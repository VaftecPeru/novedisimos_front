import { createContext, useContext, useState, useEffect } from "react"; // ¡Importa useEffect!
import { fetchAuthUser } from "./components/services/shopifyService";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    const storedUser = localStorage.getItem("currentUser");
    console.log("Stored user raw:", storedUser); // Debug
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Error parsing stored user from localStorage:", e);
      return null;
    }
  });

  useEffect(() => {
    if (usuario) {
      localStorage.setItem("currentUser", JSON.stringify(usuario));
    } else {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("authToken"); // Limpia authToken
    }
  }, [usuario]);

  useEffect(() => {
    if (!usuario) {
      fetchAuthUser().then(fetchedUser => {
        if (fetchedUser) {
          setUsuario(fetchedUser);
        } else {
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