import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import Registro from "./Registro";
import RegistroCorreo from "./RegistroCorreo";
import RegistroCorreoFinal from "./RegistroCorreoFinal";
import Dashboard from "./Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import { useState } from "react";
import RecuperarContraseña from "./RecuperarContraseña";
import { useUser } from "./UserContext";
import DetallePedido from "./DetallePedido";
import DetalleMotorizado from "./DetalleMotorizados";
import { loginUser } from './components/services/shopifyService';
import RoleProtectedRoute from './RoleProtectedRoute';

import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUsuario } = useUser();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");

  const testEmail = "prueba@ejemplo.com";
  const testPassword = "claveprueba";

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      // USAR FUNCIÓN EXISTENTE loginUser
      const { user, token } = await loginUser({
        correo: email,
        contraseña: password
      });

      setUsuario(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("authToken", token);

      setLoginError("");
      console.log("Usuario logueado:", user);

      const savedRoute = localStorage.getItem("redirectAfterLogin");
      if (savedRoute) {
        console.log("Redirigiendo a ruta guardada:", savedRoute);
        localStorage.removeItem("redirectAfterLogin");
        navigate(savedRoute);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error en login:", err);
      
      if (err.response?.status === 401) {
        setLoginError("Correo o contraseña incorrectos");
      } else if (err.response?.status === 422) {
        setLoginError("Por favor verifica tu correo y contraseña");
      } else {
        setLoginError("Error de conexión. Intenta nuevamente");
      }
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: { xs: "90%", sm: 500, md: 650 },
        maxWidth: 650,
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "10px",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <img
        src="../images/img.png"
        alt="Imagen de login"
        style={{ marginBottom: "20px" }}
      />
      <Typography
        variant="h5"
        component="h2"
        sx={{
          fontFamily: "arial, sans-serif",
          fontWeight: "normal",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        Por favor proporcione su información de conexión
      </Typography>
      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <Typography
          sx={{
            fontFamily: "arial, sans-serif",
            fontSize: "18px",
            marginBottom: "-10px",
          }}
        >
          Correo
        </Typography>
        <TextField
          type="email"
          placeholder="Ingresa tu correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "20px",
              color: "#9fa6b2",
              marginBottom: "5px",
              "& fieldset": {
                borderColor: "#ced4da",
                borderWidth: "1px",
              },
              "&:hover fieldset": {
                borderColor: "#adb8ec",
                borderWidth: "1px",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#adb8ec",
                borderWidth: "1px",
              },
              "&.Mui-focused": {
                boxShadow: "none",
              },
              "&:hover": {
                boxShadow: "none",
              },
            },
          }}
        />
        <Typography
          sx={{
            fontFamily: "arial, sans-serif",
            fontSize: "18px",
            marginBottom: "-10px",
          }}
        >
          Clave
        </Typography>
        <TextField
          type={passwordVisible ? "text" : "password"}
          placeholder="Ingresa tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "20px",
              color: "#9fa6b2",
              "& fieldset": {
                borderColor: "#ced4da",
                borderWidth: "1px",
              },
              "&:hover fieldset": {
                borderColor: "#adb8ec",
                borderWidth: "1px",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#adb8ec",
                borderWidth: "1px",
              },
              "&.Mui-focused": {
                boxShadow: "none",
              },
              "&:hover": {
                boxShadow: "none",
              },
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={togglePasswordVisibility}
                  edge="end"
                  sx={{ marginRight: "-5px" }}
                >
                  {passwordVisible ? (
                    <VisibilityOff sx={{ fontSize: "20px" }} />
                  ) : (
                    <Visibility sx={{ fontSize: "20px" }} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {loginError && (
          <Typography color="error" sx={{ color: "red", textAlign: "center" }}>
            {loginError}
          </Typography>
        )}
        <Typography
          variant="body2"
          sx={{
            fontFamily: "arial, sans-serif",
            fontWeight: "normal",
            textAlign: "center",
            marginTop: "5px",
            fontSize: "18px",
          }}
        >
          <Link
            to="/recuperar-contraseña"
            style={{ color: "#5c73db", textDecoration: "underline" }}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </Typography>

        <Button
          type="submit"
          variant="contained"
          sx={{
            padding: "12px",
            borderRadius: "12px",
            backgroundColor: "#4763e4",
            fontSize: "18px",
            color: "white",
            "&:hover": {
              backgroundColor: "#354db3",
            },
          }}
        >
          Acceder ➜
        </Button>
        <Typography
          variant="body2"
          sx={{
            fontFamily: "arial, sans-serif",
            fontWeight: "normal",
            textAlign: "center",
            marginTop: "10px",
            fontSize: "18px",
          }}
        >
          ¿No tienes una cuenta?{" "}
          <Link
            to="/registro"
            className="registro-link"
            style={{ color: "#5c73db", textDecoration: "underline" }}
          >
            Crear cuenta
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

function MainApp() {
  return (
    <Router>
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route path="/" element={<App />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/registro/correo" element={<RegistroCorreo />} />
        <Route path="/registro/correo/final" element={<RegistroCorreoFinal />} />
        <Route path="/recuperar-contraseña" element={<RecuperarContraseña />} />

        {/* DASHBOARD GENERAL - CUALQUIER ROL */}
        <Route path="/dashboard" element={
          <RoleProtectedRoute allowedRoles={['Administrador', 'Vendedor', 'Almacen', 'Delivery']}>
            <Dashboard />
          </RoleProtectedRoute>
        } />

        {/* PEDIDOS - Administrador + Vendedor */}
        <Route path="/dashboard/ordenDePedido" element={
          <RoleProtectedRoute allowedRoles={['Administrador', 'Vendedor']}>
            <Dashboard />
          </RoleProtectedRoute>
        } />
        <Route path="/dashboard/busquedaInterna" element={
          <RoleProtectedRoute allowedRoles={['Administrador', 'Vendedor']}>
            <Dashboard />
          </RoleProtectedRoute>
        } />
        <Route path="/dashboard/busquedaExterna" element={
          <RoleProtectedRoute allowedRoles={['Administrador', 'Vendedor']}>
            <Dashboard />
          </RoleProtectedRoute>
        } />

        {/* MANTENIMIENTO - Administrador + Almacen */}
        <Route path="/dashboard/almacenes" element={
          <RoleProtectedRoute allowedRoles={['Administrador', 'Almacen']}>
            <Dashboard />
          </RoleProtectedRoute>
        } />
        <Route path="/dashboard/controlUsuarios" element={
          <RoleProtectedRoute allowedRoles={['Administrador']}>
            <Dashboard />
          </RoleProtectedRoute>
        } />

        {/* MOTORIZADOS - Administrador + Delivery */}
        <Route path="/dashboard/motorizados" element={
          <RoleProtectedRoute allowedRoles={['Administrador', 'Delivery']}>
            <Dashboard />
          </RoleProtectedRoute>
        } />
        <Route path="/dashboard/detallemotorizados" element={
          <RoleProtectedRoute allowedRoles={['Administrador', 'Delivery']}>
            <Dashboard />
          </RoleProtectedRoute>
        } />

        {/* ASESORES - Solo Administrador */}
        <Route path="/dashboard/asesores" element={
          <RoleProtectedRoute allowedRoles={['Administrador']}>
            <Dashboard />
          </RoleProtectedRoute>
        } />

        {/* INTEGRACIONES - Solo Administrador */}
        <Route path="/dashboard/shopify" element={
          <RoleProtectedRoute allowedRoles={['Administrador']}>
            <Dashboard />
          </RoleProtectedRoute>
        } />

        {/* CATCH-ALL - Redirige a dashboard */}
        <Route path="/dashboard/*" element={
          <RoleProtectedRoute allowedRoles={['Administrador', 'Vendedor', 'Almacen', 'Delivery']}>
            <Dashboard />
          </RoleProtectedRoute>
        } />

        {/* DETALLES */}
        <Route path="/motorizados/:id" element={
          <RoleProtectedRoute allowedRoles={['Administrador', 'Delivery']}>
            <DetalleMotorizado />
          </RoleProtectedRoute>
        } />
        <Route path="/pedidos/:orderId" element={
          <RoleProtectedRoute allowedRoles={['Administrador', 'Vendedor']}>
            <DetallePedido />
          </RoleProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default MainApp;
