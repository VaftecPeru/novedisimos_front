import React, { useState, useEffect } from "react";
import {
  Box,
  Modal,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Divider,
} from "@mui/material";

import { fetchProductsVariantsMedia } from "./components/services/shopifyService";

const ProductPedidoSelectModal = ({ open, onClose, onAddProducts }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --------------------------------------------------------
  // Cargar productos desde la API
  // --------------------------------------------------------
  useEffect(() => {
    if (!open) return;

    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const products = await fetchProductsVariantsMedia();

        const allVariants = products.flatMap((product) =>
          product.variants.map((variant) => ({
            id: variant.id,
            title:
              variant.title === "Default Title"
                ? product.title
                : `${product.title} - ${variant.title}`,
            image: variant.image || "/images/default-image.png",
            price: Number(variant.price) || 0,
            stock: variant.quantityAvailable ?? 0,
            productType: product.productType || "Sin categoría",
          }))
        );

        setAvailableProducts(allVariants);
      } catch (err) {
        console.error("Error cargando productos", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [open]);

  // --------------------------------------------------------
  // Selección de productos
  // --------------------------------------------------------
  const toggleProduct = (product) => {
    if (product.stock <= 0) return;

    const exists = selectedProducts.find((p) => p.id === product.id);

    if (exists) {
      setSelectedProducts((prev) => prev.filter((p) => p.id !== product.id));
    } else {
      setSelectedProducts((prev) => [...prev, product]);
    }
  };

  const isSelected = (id) =>
    selectedProducts.some((product) => product.id === id);

  const handleAddSelectedProducts = () => {
    onAddProducts(selectedProducts);
    setSelectedProducts([]);
    onClose();
  };

  // --------------------------------------------------------
  // Filtrar productos
  // --------------------------------------------------------
  const filteredProducts = availableProducts.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --------------------------------------------------------
  // UI
  // --------------------------------------------------------
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          maxHeight: "80%",
          overflow: "auto",
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Seleccionar Productos
        </Typography>

        {/* BUSCADOR */}
        <TextField
          label="Buscar productos"
          fullWidth
          margin="normal"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Divider sx={{ my: 2 }} />

        {/* LOADING */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              mt: 3,
              display: "grid",
              gap: 2,
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            }}
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  onClick={() => toggleProduct(product)}
                  sx={{
                    border: isSelected(product.id)
                      ? "2px solid #1976d2"
                      : "2px solid transparent",
                    cursor: product.stock > 0 ? "pointer" : "not-allowed",
                    opacity: product.stock > 0 ? 1 : 0.5,
                    transition: "0.3s",
                    "&:hover": {
                      transform: product.stock > 0 ? "scale(1.03)" : "none",
                    },
                    position: "relative",
                  }}
                >
                  {product.image && (
                    <CardMedia
                      component="img"
                      height="160"
                      image={product.image}
                      alt={product.title}
                      sx={{ objectFit: "contain", p: 1 }}
                    />
                  )}

                  <CardContent>
                    <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
                      {product.title}
                    </Typography>

                    {/* Precio */}
                    <Typography variant="body2" color="text.secondary">
                      Precio: <strong>${product.price}</strong>
                    </Typography>

                    {/* Stock */}
                    <Typography
                      variant="body2"
                      color={product.stock > 0 ? "success.main" : "error.main"}
                    >
                      Stock: <strong>{product.stock}</strong>
                    </Typography>

                    {/* Tipo */}
                    <Typography variant="caption" color="text.secondary">
                      {product.productType}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No se encontraron productos.
              </Typography>
            )}
          </Box>
        )}

        {/* BOTÓN DE AÑADIR */}
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          fullWidth
          disabled={selectedProducts.length === 0}
          onClick={handleAddSelectedProducts}
        >
          Añadir Seleccionados
        </Button>
      </Box>
    </Modal>
  );
};

export default ProductPedidoSelectModal;