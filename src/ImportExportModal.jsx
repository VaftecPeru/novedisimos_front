import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  CircularProgress,
} from "@mui/material";

// CSV utils
import { mapJsonToCsvRows, downloadCsv } from "./components/csv/exportUtils";
import { parseCsvFileToJson } from "./components/csv/importUtils";

// PDF
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ImportExportModal = ({ onClose }) => {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // -------------------------
  // ---- EXPORTACIÓN CSV ----
  // -------------------------
  const handleExport = async () => {
    setLoading(true);
    setStatus("Cargando datos de exportación...");

    try {
      const response = await fetch("http://localhost:8000/api/products/export");

      if (!response.ok) {
        throw new Error("Error al obtener los productos para exportar.");
      }

      const productsJson = await response.json();
      const csvOutput = mapJsonToCsvRows(productsJson);

      downloadCsv(csvOutput, "productos_para_shopify.csv");

      setStatus(
        "Exportación completada. La descarga iniciará automáticamente."
      );
    } catch (error) {
      console.error("Error en Exportación:", error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // ---- EXPORTACIÓN PDF ----
  // -------------------------
  const handleExportPDF = async () => {
    setLoading(true);
    setStatus("Generando PDF...");

    try {
      const response = await fetch("http://localhost:8000/api/products/export");
      if (!response.ok)
        throw new Error("Error al obtener productos para el PDF.");

      const products = await response.json();

      const doc = new jsPDF();
      let firstPage = true;

      for (const product of products) {
        if (!firstPage) doc.addPage();
        firstPage = false;

        // -------- TITULO --------
        doc.setFontSize(18);
        doc.text(product.Title || "Producto sin título", 14, 20);

        // -------- IMAGEN --------
        const imageUrl =
          product.Images?.[0]?.Src ??
          `${window.location.origin}/images/default-image.png`;

        try {
          const imgData = await loadImageAsBase64(imageUrl);
          doc.addImage(imgData, "JPEG", 150, 20, 45, 45);
        } catch {
          doc.rect(150, 20, 45, 45);
        }

        // -------- INFO PRINCIPAL --------
        doc.setFontSize(11);
        doc.text(`Handle: ${product.Handle}`, 14, 35);
        doc.text(`Vendor: ${product.Vendor}`, 14, 42);
        doc.text(`Tipo: ${product.Type}`, 14, 49);
        doc.text(`Publicado: ${product.Published ? "Sí" : "No"}`, 14, 56);
        doc.text(`Categoría: ${product.Product_Category}`, 14, 63);
        doc.text(`Tags: ${(product.Tags || []).join(", ")}`, 14, 70);

        let currentY = 85;

        // -------- VARIANTES --------
        doc.setFontSize(13);
        doc.text("Variantes", 14, currentY);
        currentY += 5;

        const variantRows = (product.Variants || []).map((v) => [
          v.Options?.[0]?.Value ?? "",
          v.Price ?? "",
          v.SKU ?? "",
          v.Barcode ?? "",
          v.Inventory_Tracker ?? "",
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [["Opción", "Precio", "SKU", "Barcode", "Inventario"]],
          body: variantRows,
          styles: { fontSize: 9 },
        });

        currentY = doc.lastAutoTable.finalY + 10;
      }

      doc.save("productos_shopify.pdf");
      setStatus("PDF generado correctamente.");
    } catch (err) {
      console.error(err);
      setStatus("Error al generar el PDF.");
    } finally {
      setLoading(false);
    }
  };

  async function loadImageAsBase64(url) {
    const res = await fetch(url);
    const blob = await res.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  // -------------------------
  // ---- IMPORTACIÓN CSV ----
  // -------------------------
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setStatus(`Procesando archivo ${file.name}...`);

    try {
      const productsJson = await parseCsvFileToJson(file);

      if (productsJson.length === 0) {
        setStatus("El archivo CSV está vacío o no sirve.");
        setLoading(false);
        return;
      }

      setStatus(`Enviando ${productsJson.length} productos al backend...`);

      const response = await fetch(
        "http://localhost:8000/api/products/import",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productsJson),
        }
      );

      const result = await response.json();

      if (!response.ok || result.error) {
        const msg = result.message || JSON.stringify(result.details || result);
        throw new Error(`Importación fallida: ${msg}`);
      }

      setStatus("Importación completada correctamente.");
    } catch (error) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    } finally {
      event.target.value = null;
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Exportar / Importar Productos</DialogTitle>

      <DialogContent>
        {/* EXPORTACIÓN */}
        <Typography variant="h6" gutterBottom>
          Exportar Productos
        </Typography>

        <Button
          variant="contained"
          color="success"
          sx={{ mt: 2 }}
          onClick={handleExport}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "Descargar CSV"}
        </Button>

        <Button
          variant="contained"
          color="secondary"
          sx={{ mt: 2, ml: 2 }}
          onClick={handleExportPDF}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "Exportar PDF"}
        </Button>

        <Divider sx={{ my: 3 }} />

        {/* IMPORTACIÓN */}
        <Typography variant="h6" gutterBottom>
          Importar desde CSV
        </Typography>

        <Button
          variant="contained"
          component="label"
          color="primary"
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "Subir Archivo CSV"}
          <input type="file" accept=".csv" hidden onChange={handleFileChange} />
        </Button>

        <Divider sx={{ my: 3 }} />

        {/* ESTADO */}
        <Typography variant="body1">
          <strong>Estado:</strong> {status || "Esperando acción."}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="error">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportExportModal;
