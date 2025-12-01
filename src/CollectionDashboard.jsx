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
import {
  obtenerColecciones,
  obtenerCountColeccion,
  eliminarColeccion,
} from "./components/services/shopifyService";
import Swal from "sweetalert2";
import AddCollection from "./AddCollection";
import EditCollection from "./EditCollection";

const Colecciones = () => {
  const [colecciones, setColecciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtro, setFiltro] = useState("todos");

  const [busqueda, setBusqueda] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);

  // 🆕 1. NUEVOS ESTADOS PARA EDITAR
  const [editCollectionId, setEditCollectionId] = useState(null);

  // 🔹 Cargar colecciones “dummy”
  useEffect(() => {
    cargarColecciones();
  }, []);

  const cargarColecciones = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await obtenerColecciones();

      const custom = data.custom_collections || [];
      const smart = data.smart_collections || [];
      const unificados = [...custom, ...smart];

      // 🔥 Obtener count real para cada colección
      const procesados = await Promise.all(
        unificados.map(async (c) => {
          let productosCount = 0;

          try {
            const countData = await obtenerCountColeccion(c.id);
            productosCount = countData; // Número real
          } catch (err) {
            productosCount = 0;
          }

          return {
            id: c.id,
            title: c.title,
            image: c.image?.src || "/images/default-image.png",
            productsCount: productosCount,
            conditions:
              c.rules
                ?.map((r) => `${r.column} ${r.relation} ${r.condition}`)
                .join(", ") || "Manual",
          };
        })
      );

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
  // 🆕 2. FUNCIÓN PARA ABRIR EL MODAL DE EDICIÓN
  const handleEditar = (id) => {
    console.log("👉 Editar colección:", id);
    setEditCollectionId(id); // Guarda el ID y abre el modal
  };

  // 🆕 FUNCIÓN PARA CERRAR EL MODAL DE EDICIÓN
  const handleCloseEditModal = () => {
    setEditCollectionId(null); // Borra el ID, lo que cierra el modal
  };

  // 🆕 FUNCIÓN PARA RECETAR EL COMPONENTE (Se llama después de guardar en EditCollection)
  const handleCollectionUpdated = () => {
    // 1. Cierra el modal de edición
    setEditCollectionId(null);
    // 2. Recarga la lista de colecciones
    cargarColecciones();
  };

  const handleEliminar = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la colección y no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!isConfirmed) return;

    try {
      // Mostrar Swal de carga
      Swal.fire({
        title: "Eliminando colección...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      const data = await eliminarColeccion(id);

      // Cerrar Swal de carga
      Swal.close();

      // Mostrar éxito
      Swal.fire({
        title: "¡Colección eliminada!",
        text: data.message,
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });

      // Recargar lista de colecciones
      cargarColecciones();
    } catch (err) {
      Swal.close();
      Swal.fire(
        "Error",
        err.message || "No se pudo eliminar la colección",
        "error"
      );
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        backgroundColor: "#ffffff",
        borderRadius: 2,
      }}
    >
      {/* Header filtros + búsqueda + botón */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "column", md: "row" },
          gap: { xs: 2, sm: 2, md: 0 },
          fontSize: "12px",
          padding: 1.2,
        }}
      >
        {/* Filtro simple */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            marginRight: "20px",
            fontSize: "12px",
          }}
        >
          <Button
            variant={filtro === "todos" ? "contained" : "outlined"}
            onClick={() => setFiltro("todos")}
            sx={{
              textTransform: "capitalize",
              borderRadius: 2,
              px: 2,
              color: filtro === "todos" ? "#353535" : "#353535",
              backgroundColor:
                filtro === "todos" ? "rgba(0,0,0,0.03)" : "transparent",
              border: "none",
              boxShadow: "none",
              "&:hover": {
                backgroundColor:
                  filtro === "todos" ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.03)",
                boxShadow: "none",
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
              border: "none",
              boxShadow: "none",
              color: "#ffffffff",
              backgroundColor: "#353535ff",
              borderRadius: 2,
              textTransform: "none",
              "&:hover": { backgroundColor: "#1a1a1a", boxShadow: "none" },
            }}
          >
            Nuevo
          </Button>
        </Box>
      </Box>

      {showAddModal && (
        <AddCollection
          onClose={() => setShowAddModal(false)}
          onCollectionCreated={cargarColecciones} // recarga la tabla
        />
      )}

      {editCollectionId !== null && (
        <EditCollection
          collectionId={editCollectionId} // Le pasamos el ID guardado en el estado
          onClose={handleCloseEditModal} // Función para cerrar el modal
          onCollectionUpdated={handleCollectionUpdated} // Función que cierra y recarga la lista
        />
      )}
      {/* Tabla */}
      {loading && (
        <Typography sx={{ padding: 2 }}>Cargando pedidos...</Typography>
      )}
      {error && (
        <Typography sx={{ padding: 2 }} color="error">
          {error}
        </Typography>
      )}

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
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        justifyContent: "center",
                      }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        // 🔥 MODIFICADO: Llama a handleEditar con el ID
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
                    </Box>
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
