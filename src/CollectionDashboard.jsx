import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Chip,
  TablePagination,
} from "@mui/material";
import { obtenerColecciones } from "./components/services/shopifyService";
import AddCollection from "./AddCollection";
const Colecciones = () => {
  const [colecciones, setColecciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtro, setFiltro] = useState("todos");

  const [busqueda, setBusqueda] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);

  // 🔹 Cargar colecciones “dummy”
  useEffect(() => {
    cargarColecciones();
  }, []);

  const cargarColecciones = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await obtenerColecciones();

      // Shopify envía dos grupos: custom & smart
      const custom = data.custom_collections || [];
      const smart = data.smart_collections || [];

      const unificados = [...custom, ...smart];

      const procesados = unificados.map((c) => ({
        id: c.id,
        title: c.title,
        image: c.image?.src || "/images/default-image.png",
        productsCount: c.products_count ?? 0,
        conditions:
          c.rules
            ?.map((r) => `${r.column} ${r.relation} ${r.condition}`)
            .join(", ") || "Manual",
      }));

      setColecciones(procesados);
    } catch (e) {
      setError("Error cargando colecciones.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Filtros (solo placeholder)
  const coleccionesFiltradas = colecciones.filter((c) => {
    const coincideBusqueda = c.title
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    return coincideBusqueda;
  });

  const coleccionesPaginadas = coleccionesFiltradas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (e, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };


  const handleEditar = (id) => {
    console.log("👉 Editar colección:", id);
  };

  const handleEliminar = (id) => {
    console.log("❌ Eliminar colección:", id);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "100%" }}>
      {/* Header filtros + búsqueda + botón */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Filtro simple */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant={filtro === "todos" ? "contained" : "outlined"}
            onClick={() => setFiltro("todos")}
            sx={{
              textTransform: "capitalize",
              borderRadius: 2,
              px: 2,
              color: filtro === "todos" ? "#fff" : "#353535",
              backgroundColor: filtro === "todos" ? "#353535" : "transparent",
              borderColor: "#353535",
              "&:hover": {
                backgroundColor:
                  filtro === "todos" ? "#1a1a1a" : "rgba(0,0,0,0.04)",
              },
            }}
          >
            Todos
          </Button>
        </Box>

        {/* Buscador + botón nueva colección */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <input
            type="text"
            placeholder="Buscar colección..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              outline: "none",
              width: "200px",
            }}
          />

          <Button
            variant="contained"
            onClick={() => setShowAddModal(true)}
            sx={{
              color: "#fff",
              backgroundColor: "#353535",
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#1a1a1a",
              },
            }}
          >
            + Nueva Colección
          </Button>
        </Box>
      </Box>

      {showAddModal && (
        <AddCollection
          onClose={() => setShowAddModal(false)}
          onCollectionCreated={cargarColecciones} // recarga la tabla
        />
      )}

      {/* Tabla */}
      {loading && <Typography>Cargando colecciones...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && colecciones.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
              <TableRow>
                <TableCell>Imagen</TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Productos</TableCell>
                <TableCell>Condiciones</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {coleccionesPaginadas.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <img
                      src={c.image}
                      alt={c.title}
                      style={{
                        width: 45,
                        height: 45,
                        borderRadius: "8px",
                        objectFit: "cover",
                      }}
                    />
                  </TableCell>

                  <TableCell>{c.title}</TableCell>

                  <TableCell>
                    <Chip
                      label={`${c.productsCount} productos`}
                      sx={{
                        backgroundColor: "#E3F2FD",
                        color: "#0D47A1",
                        fontWeight: "bold",
                      }}
                    />
                  </TableCell>

                  <TableCell>{c.conditions}</TableCell>

                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleEditar(c.id)}
                      sx={{
                        mr: 1,
                        color: "#5c6ac4",
                        borderColor: "#5c6ac4",
                        "&:hover": {
                          backgroundColor: "#f0f1fa",
                          borderColor: "#4f5bbd",
                        },
                      }}
                    >
                      Editar
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleEliminar(c.id)}
                      sx={{
                        color: "#d82c0d",
                        borderColor: "#d82c0d",
                        "&:hover": {
                          backgroundColor: "#fdecea",
                          borderColor: "#b0250b",
                        },
                      }}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TablePagination
        component="div"
        count={colecciones.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 20, 50]}
        labelRowsPerPage="Colecciones por página:"
      />

      {!loading && colecciones.length === 0 && (
        <Typography>No hay colecciones registradas.</Typography>
      )}
    </Box>
  );
};

export default Colecciones;
