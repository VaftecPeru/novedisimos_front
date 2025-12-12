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

import { fetchVariantesMedia } from "./components/services/shopifyService";

const ProductPedidoSelectModal = ({
  open,
  onClose,
  onAddProducts,
  selectedVariants = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [localSelected, setLocalSelected] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLocalSelected([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const products = await fetchVariantesMedia();

        const allVariants = products.flatMap((product) =>
          product.variantes.map((variant) => ({
            id: variant.id,
            // 🔥 CORRECCIÓN AQUÍ: Forzamos el precio a ser un número
            price: Number(variant.price) || 0,
            title:
              variant.title === "Default Title"
                ? product.title
                : `${product.title} - ${variant.title}`,
            image: variant.image || "/images/default-image.png",
            stock: variant.stock ?? 0,
            productType: product.productType || "Sin categoría",
          }))
        );

        setAvailableProducts(allVariants);
      } catch (err) {
        console.error("Error cargando variantes:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [open]);

  const isLocalSelected = (id) => localSelected.some((v) => v.id === id);
  const isAlreadyInPedido = (id) => selectedVariants.some((v) => v.id === id);

  const toggleVariant = (variant) => {
    if (variant.stock <= 0) return;
    if (isAlreadyInPedido(variant.id)) return;

    if (isLocalSelected(variant.id)) {
      setLocalSelected((prev) => prev.filter((v) => v.id !== variant.id));
    } else {
      setLocalSelected((prev) => [...prev, variant]);
    }
  };

  const handleAdd = () => {
    onAddProducts(localSelected);
    setLocalSelected([]);
    onClose();
  };

  const filtered = availableProducts.filter((prod) =>
    prod.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          maxHeight: "85%",
          overflow: "auto",
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Seleccionar Variantes
        </Typography>

        <TextField
          label="Buscar variantes"
          fullWidth
          margin="normal"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Divider sx={{ my: 2 }} />

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
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            }}
          >
            {filtered.length > 0 ? (
              filtered.map((variant) => {
                const alreadySelected = isAlreadyInPedido(variant.id);
                const isSelected = isLocalSelected(variant.id);

                return (
                  <Card
                    key={variant.id}
                    onClick={() => toggleVariant(variant)}
                    sx={{
                      border: isSelected
                        ? "2px solid #1976d2"
                        : "2px solid transparent",
                      cursor:
                        variant.stock > 0 && !alreadySelected
                          ? "pointer"
                          : "not-allowed",
                      bgcolor: alreadySelected
                        ? "rgba(25, 118, 210, 0.15)"
                        : "background.paper",
                      opacity: variant.stock > 0 ? 1 : 0.5,
                      transition: "0.3s",
                      "&:hover": {
                        transform:
                          variant.stock > 0 && !alreadySelected
                            ? "scale(1.03)"
                            : "none",
                      },
                      position: "relative",
                    }}
                  >
                    {alreadySelected && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          bgcolor: "grey.800",
                          color: "white",
                          px: 1,
                          borderRadius: 1,
                          fontSize: "0.7rem",
                          zIndex: 2,
                        }}
                      >
                        Ya agregado
                      </Box>
                    )}

                    <CardMedia
                      component="img"
                      height="160"
                      image={variant.image}
                      alt={variant.title}
                      sx={{ objectFit: "contain", p: 1 }}
                    />

                    <CardContent>
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        sx={{ mb: 1 }}
                      >
                        {variant.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        color={
                          variant.stock > 0 ? "success.main" : "error.main"
                        }
                      >
                        Stock: <strong>{variant.stock}</strong>
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: "primary.main", mt: 0.5 }}
                      >
                        Precio:{" "}
                        {/* 🔥 SEGUNDA CORRECCIÓN: Validación defensiva antes de toFixed */}
                        {typeof variant.price === "number" && variant.price > 0
                          ? variant.price.toFixed(2)
                          : "Consultar"}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {variant.productType}
                      </Typography>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Typography variant="body2" color="text.secondary">
                No se encontraron variantes.
              </Typography>
            )}
          </Box>
        )}

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          fullWidth
          disabled={localSelected.length === 0}
          onClick={handleAdd}
        >
          Añadir Seleccionados ({localSelected.length})
        </Button>
      </Box>
    </Modal>
  );
};

export default ProductPedidoSelectModal;
