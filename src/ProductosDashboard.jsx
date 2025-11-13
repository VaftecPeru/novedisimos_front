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
  Collapse,
  IconButton,
  Chip,
  TablePagination,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

import AddProduct from "./AddProduct";
import EditProduct from "./EditProduct";
import { fetchProductos } from "./components/services/shopifyService";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openRows, setOpenRows] = useState({}); // 👈 control de filas desplegadas
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 🔹 Estados de paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  // 🔹 Cargar productos al iniciar
  useEffect(() => {
    const cargarProductos = async () => {
      setLoading(true);
      try {
        const { productos: lista } = await fetchProductos();
        // 🔹 Ordenar por fecha de creación (más recientes primero)
        console.log("Productos cargados:", lista);
        const ordenados = [...lista].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        console.log("Productos cargados:", ordenados);
        setProductos(ordenados);
      } catch (err) {
        setError("Error al cargar los productos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargarProductos();
  }, []);

  const recargarProductos = async () => {
    setLoading(true);
    try {
      const { productos: lista } = await fetchProductos();
      const ordenados = [...lista].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setProductos(ordenados);
    } catch (err) {
      console.error("Error recargando productos:", err);
      setError("Error al recargar los productos");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cambiar de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // 🔹 Cambiar cantidad de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 🔹 Productos que se mostrarán según la página actual
  const productosPaginados = productos.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // 🔹 Alternar visibilidad de variantes por producto
  const toggleRow = (id) => {
    setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "100%" }}>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#000000" }}>
          Lista de Productos
        </Typography>

        <Button
          variant="contained"
          onClick={() => setOpenModal(true)}
          sx={{
            color: "#ffffffff",
            backgroundColor: "#353535ff",
            borderRadius: 2,
            "&:hover": {
              backgroundColor: "#1a1a1a",
            },
          }}
        >
          + Nuevo Producto
        </Button>
      </Box>

      {openModal && (
        <AddProduct
          onClose={() => setOpenModal(false)}
          onProductCreated={recargarProductos} // 🔥 nueva prop
        />
      )}

      {selectedProduct && (
        <EditProduct
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdate={() => {
            setSelectedProduct(null);
            recargarProductos(); // 🔄 vuelve a cargar productos sin refrescar la página
          }}
        />
      )}
      {loading && <Typography>Cargando productos...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && !error && productos.length > 0 && (
        <TableContainer
          component={Paper}
          sx={{
            width: "100%",
            overflowX: "auto", // previene recorte en pantallas pequeñas
          }}
        >
          <Table size="small">
            <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
              <TableRow>
                <TableCell />
                <TableCell></TableCell>
                <TableCell>Producto</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Categoría</TableCell>

                <TableCell>Inventario</TableCell>

                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productosPaginados.map((p) => {
                const variant = p.variants?.[0];
                const estado = p.status ?? "—";
                const imagen = p.image?.src;
                const tieneVariantes = p.variants?.length > 0;

                // Inventario
                const totalStock =
                  p.variants?.reduce(
                    (acc, v) => acc + (v.inventory_quantity || 0),
                    0
                  ) ?? 0;

                const variantCount = p.variants?.length || 0;

                let cantidadTexto = "—";

                if (totalStock === 0) {
                  cantidadTexto =
                    variantCount > 1
                      ? `Sin existencias en ${variantCount} variantes`
                      : "0 existencias";
                } else if (variantCount === 1) {
                  cantidadTexto = `${totalStock} en existencias`;
                } else if (variantCount > 1) {
                  cantidadTexto = `${totalStock} en existencias para ${variantCount} variantes`;
                }

                return (
                  <React.Fragment key={p.id}>
                    <TableRow>
                      <TableCell>
                        {tieneVariantes && (
                          <IconButton
                            size="small"
                            onClick={() => toggleRow(p.id)}
                          >
                            {openRows[p.id] ? (
                              <KeyboardArrowUp />
                            ) : (
                              <KeyboardArrowDown />
                            )}
                          </IconButton>
                        )}
                      </TableCell>
                      <TableCell>
                        {imagen ? (
                          <img
                            src={imagen}
                            alt={p.title}
                            style={{
                              width: 40,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        ) : (
                          "Sin imagen"
                        )}
                      </TableCell>
                      <TableCell>{p.title}</TableCell>
                      <TableCell>
                        {" "}
                        <Chip
                          label={
                            estado === "active"
                              ? "Activo"
                              : estado === "draft"
                              ? "Borrador"
                              : "Archivado"
                          }
                          sx={{
                            fontWeight: "bold",
                            textTransform: "capitalize",
                            color:
                              estado === "active"
                                ? "#0E6245"
                                : estado === "draft"
                                ? "#7A7A7A"
                                : "#B42318",
                            backgroundColor:
                              estado === "active"
                                ? "#E3FCEF"
                                : estado === "draft"
                                ? "#F5F5F5"
                                : "#FEECEC",
                          }}
                        />
                      </TableCell>
                      <TableCell>{p.product_type || "—"}</TableCell>
                      <TableCell>{cantidadTexto}</TableCell>

                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setSelectedProduct(p)}
                          sx={{
                            mr: 1,
                            color: "#5c6ac4", // azul Shopify
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
                          onClick={() => alert(`Eliminar producto: ${p.title}`)}
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

                    {/* Fila expandible con variantes */}
                    {tieneVariantes && (
                      <TableRow>
                        <TableCell
                          sx={{
                            paddingBottom: 0,
                            paddingTop: 0,
                            backgroundColor: "#ffffffff", // fondo claro para distinguir variantes
                          }}
                          colSpan={8}
                        >
                          <Collapse
                            in={openRows[p.id]}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box
                              sx={{
                                margin: 2,

                                borderRadius: 2,
                                backgroundColor: "#fff", // fondo blanco
                              }}
                            >
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Variante</TableCell>
                                    <TableCell>Precio</TableCell>
                                    <TableCell>Inventario</TableCell>
                                    <TableCell>SKU</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {p.variants.map((v) => (
                                    <TableRow key={v.id}>
                                      <TableCell>{v.title}</TableCell>
                                      <TableCell>${v.price}</TableCell>
                                      <TableCell>
                                        {v.inventory_quantity}
                                      </TableCell>
                                      <TableCell>{v.sku || "—"}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <TablePagination
        component="div"
        count={productos.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[8, 16, 32]}
        labelRowsPerPage="Productos por página:"
      />
      {!loading && !error && productos.length === 0 && (
        <Typography>No hay productos registrados.</Typography>
      )}
    </Box>
  );
};

export default Productos;
