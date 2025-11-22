// exportUtils.js
import Papa from 'papaparse';
import { CSV_HEADERS } from './CSV_HEADERS'; 

export function mapJsonToCsvRows(productsData) {
    const rows = [];

    productsData.forEach(product => {
        const productBase = product;

        (productBase.Variants || []).forEach((variant, variantIndex) => {
            const row = [];
            const isFirstVariant = variantIndex === 0;

            // --- Campos de Producto (Columna 1 a 8) ---
            row.push(
                productBase.Handle || '',
                productBase.Title || '',
                productBase.Body_HTML || '',
                productBase.Vendor || '',
                productBase.Product_Category || '',
                productBase.Type || '',
                Array.isArray(productBase.Tags) ? productBase.Tags.join(',') : '',
                productBase.Published ? 'TRUE' : 'FALSE',
            );

            // --- Opciones de Variante (Columna 9 a 17) ---
            for (let i = 0; i < 3; i++) {
                const option = (variant.Options || [])[i];
                row.push(
                    option?.Name || '',
                    option?.Value || '',
                    option?.Linked_To || '',
                );
            }

            // --- Campos de Variante (Columna 18 a 30) ---
            row.push(
                variant.SKU || '',
                variant.Grams || 0,
                variant.Inventory_Tracker || '',
                variant.Inventory_Policy || '',
                variant.Fulfillment_Service || '',
                variant.Price || 0,
                variant.Compare_At_Price !== null ? variant.Compare_At_Price : '',
                variant.Requires_Shipping ? 'TRUE' : 'FALSE',
                variant.Taxable ? 'TRUE' : 'FALSE',
                variant.Unit_Price_Total_Measure || '',
                variant.Unit_Price_Total_Measure_Unit || '',
                variant.Unit_Price_Base_Measure || '',
                variant.Unit_Price_Base_Measure_Unit || '',
                variant.Barcode || '',
            );

            // --- Imágenes (Columna 31 a 33) ---
            const image = (productBase.Images || [])[0];
            if (isFirstVariant && image) {
                row.push(
                    image.Src || '',
                    image.Position || 0,
                    image.Alt_Text || '',
                );
            } else {
                row.push('', '', ''); // Mantener el espaciado
            }
            
            // --- Misc y SEO (Columna 34 a 36) ---
            row.push(
                productBase.Gift_Card ? 'TRUE' : 'FALSE',
                productBase.SEO?.Title || '',
                productBase.SEO?.Description || '',
            );

            // --- Metafields (Columna 37 a 41) ---
            const metafields = productBase.Metafields || {};
            row.push(
                metafields.Age_Group || '',
                metafields.Closure_Type || '',
                metafields.Color_Pattern || '',
                metafields.Binding_Mount || '',
                metafields.Snowboard_Length || '',
            );
            
            // --- Variante restante (Columna 42 a 45) ---
            row.push(
                '', // Variant Image (no mapeado de forma simple en tu JSON)
                variant.Weight_Unit || '',
                variant.Tax_Code || '',
                variant.Cost_per_Item !== null ? variant.Cost_per_Item : '',
                productBase.Status || '',
            );

            rows.push(row);
        });
    });
    
    // Usar PapaParse para convertir los arrays a una cadena CSV correctamente con comillas y escapes
    const csvString = Papa.unparse({
        fields: CSV_HEADERS,
        data: rows
    });

    return csvString;
}

/**
 * Función para descargar la cadena CSV.
 * @param {string} csvString - La cadena CSV generada.
 * @param {string} filename - Nombre del archivo.
 */
export function downloadCsv(csvString, filename = 'productos_export.csv') {
    const BOM = '\uFEFF'; // BOM para asegurar codificación UTF-8 en Excel
    const blob = new Blob([BOM + csvString], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement("a");
    if (link.download !== undefined) { 
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}