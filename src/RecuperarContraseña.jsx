import React, { useState } from "react";
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  CircularProgress,
  Alert 
} from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";

function RecuperarContraseña() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Validación mejorada de email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validación del formato del correo
    if (!validateEmail(email)) {
      setError("Por favor ingresa un correo electrónico válido");
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post(
        "https://novedadeswow.com/api_php/forgot-password.php",
        { correo: email },
        {
          headers: { 
            "Content-Type": "application/json",
          },
          timeout: 10000 // 10 segundos timeout
        }
      );

      // Manejar respuesta del backend
      if (response.data.success) {
        setMessage("Se ha enviado un enlace de recuperación a tu correo electrónico");
        setIsSubmitted(true);
      } else {
        setError(response.data.message || "No se pudo procesar la solicitud");
      }
      
    } catch (error) {
      console.error("Error al recuperar contraseña:", error);
      
      // Manejo específico de errores
      if (error.response) {
        // Error del servidor (4xx, 5xx)
        switch (error.response.status) {
          case 404:
            setError("No existe una cuenta con este correo electrónico");
            break;
          case 422:
            setError("Datos de entrada inválidos");
            break;
          case 500:
            setError("Error del servidor. Por favor intenta más tarde");
            break;
          default:
            setError(error.response.data?.message || "Error al procesar la solicitud");
        }
      } else if (error.request) {
        // Error de red
        setError("Error de conexión. Verifica tu internet e intenta nuevamente");
      } else {
        // Otros errores
        setError("Ocurrió un error inesperado");
      }
    } finally {
      setLoading(false);
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
        alt="Logo Novedades Wow"
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
        Recuperar Contraseña
      </Typography>

      <Typography
        variant="body1"
        sx={{
          fontFamily: "arial, sans-serif",
          textAlign: "center",
          marginBottom: "20px",
          color: "#666",
          fontSize: "18px",
        }}
      >
        {isSubmitted 
          ? "Revisa tu correo electrónico para las instrucciones de recuperación"
          : "Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña"
        }
      </Typography>

      {!isSubmitted ? (
        <Box
          component="form"
          onSubmit={handleSubmit}
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
            Correo Electrónico
          </Typography>
          
          <TextField
            type="email"
            placeholder="Ingresa tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            variant="outlined"
            disabled={loading}
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

          {/* Mensajes de estado */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                borderRadius: "10px",
                fontFamily: "arial, sans-serif",
              }}
            >
              {error}
            </Alert>
          )}
          
          {message && (
            <Alert 
              severity="success" 
              sx={{ 
                borderRadius: "10px",
                fontFamily: "arial, sans-serif",
              }}
            >
              {message}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              padding: "12px",
              borderRadius: "12px",
              backgroundColor: "#4763e4",
              fontSize: "18px",
              color: "white",
              "&:hover": {
                backgroundColor: "#354db3",
              },
              "&:disabled": {
                backgroundColor: "#cccccc",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              'Enviar Enlace de Recuperación ➜'
            )}
          </Button>
        </Box>
      ) : (
        // Vista después del envío exitoso
        <Box sx={{ width: "100%", textAlign: "center" }}>
          {message && (
            <Alert 
              severity="success" 
              sx={{ 
                borderRadius: "10px", 
                mb: 2,
                fontFamily: "arial, sans-serif",
              }}
            >
              {message}
            </Alert>
          )}
          
          <Typography
            variant="body2"
            sx={{
              fontFamily: "arial, sans-serif",
              marginBottom: "20px",
              color: "#666",
              fontSize: "16px",
            }}
          >
            Si no encuentras el correo en tu bandeja de entrada, revisa la carpeta de spam o correo no deseado.
          </Typography>
        </Box>
      )}

      {/* Enlace para volver al login */}
      <Typography
        variant="body2"
        sx={{
          fontFamily: "arial, sans-serif",
          fontWeight: "normal",
          textAlign: "center",
          marginTop: "20px",
          fontSize: "18px",
        }}
      >
        <Link
          to="/"
          style={{ 
            color: "#5c73db", 
            textDecoration: "underline",
          }}
        >
          ← Volver al Inicio de Sesión
        </Link>
      </Typography>
    </Box>
  );
}

export default RecuperarContraseña;