// importUtils.js
import Papa from 'papaparse';
import { CSV_HEADERS } from './CSV_HEADERS'; 

export function parseCsvFileToJson(file) {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true, // Asume que la primera fila son las cabeceras
            skipEmptyLines: true,
            encoding: "UTF-8",
            dynamicTyping: false, // Mantener todo como string
            complete: function(results) {
                if (results.errors.length > 0) {
                    console.error("Errores de PapaParse:", results.errors);
                    reject(new Error("Error al parsear el CSV. Detalles: " + results.errors[0].message));
                    return;
                }
                
                // 1. Mapear y agrupar los datos parseados
                const productsMap = {};
                const data = results.data;

                // Asegurar que las cabeceras coincidan o al menos tener las importantes
                const dataHeaders = results.meta.fields || [];

                data.forEach(row => {
                    const handle = row['Handle']?.trim();

                    if (!handle) {
                        return; // Saltar filas sin Handle
                    }

                    // Función auxiliar para obtener valor y limpiar espacios
                    const getVal = (key, type = 'string') => {
                        const value = row[key]?.trim();
                        if (type === 'boolean') return value?.toUpperCase() === 'TRUE';
                        if (type === 'number') return value ? parseFloat(value) : null;
                        return value || '';
                    };

                    // Inicializar el producto si es la primera variante (primera fila con este handle)
                    if (!productsMap[handle]) {
                        
                        // --- Construcción del producto base ---
                        productsMap[handle] = {
                            "Handle": handle,
                            "Title": getVal('Title'),
                            "Body_HTML": getVal('Body (HTML)'),
                            "Vendor": getVal('Vendor'),
                            "Product_Category": getVal('Product Category'),
                            "Type": getVal('Type'),
                            "Tags": getVal('Tags') ? getVal('Tags').split(',').map(t => t.trim()).filter(t => t.length > 0) : [],
                            "Published": getVal('Published', 'boolean'),
                            "Options": [], // El backend reconstruye esto
                            "Variants": [],
                            "Images": [],
                            "Gift_Card": getVal('Gift Card', 'boolean'),
                            "SEO": {
                                "Title": getVal('SEO Title'),
                                "Description": getVal('SEO Description')
                            },
                            "Metafields": {
                                "Age_Group": getVal('Grupo de edad (product.metafields.shopify.age-group)'),
                                "Closure_Type": getVal('Tipo de cierre (product.metafields.shopify.closure-type)'),
                                "Color_Pattern": getVal('Color (product.metafields.shopify.color-pattern)'),
                                "Binding_Mount": getVal('Snowboard binding mount (product.metafields.test_data.binding_mount)'),
                                "Snowboard_Length": getVal('Snowboard length (product.metafields.test_data.snowboard_length)', 'number'),
                            },
                            "Status": getVal('Status')
                        };

                        // Solo la primera fila debe tener la imagen
                        if (getVal('Image Src')) {
                            productsMap[handle].Images.push({
                                "Src": getVal('Image Src'),
                                "Position": parseInt(getVal('Image Position') || '0'),
                                "Alt_Text": getVal('Image Alt Text')
                            });
                        }
                    }

                    // --- Construcción de la Variante ---
                    const variantOptions = [];
                    for (let i = 1; i <= 3; i++) {
                        const name = getVal(`Option${i} Name`);
                        const value = getVal(`Option${i} Value`);

                        if (name && value) {
                            variantOptions.push({
                                "Name": name,
                                "Value": value,
                                "Linked_To": getVal(`Option${i} Linked To`),
                            });
                        }
                    }

                    productsMap[handle].Variants.push({
                        "SKU": getVal('Variant SKU'),
                        "Grams": parseInt(getVal('Variant Grams') || '0'),
                        "Inventory_Tracker": getVal('Variant Inventory Tracker'),
                        "Inventory_Policy": getVal('Variant Inventory Policy'),
                        "Fulfillment_Service": getVal('Variant Fulfillment Service'),
                        "Price": getVal('Variant Price', 'number') || 0,
                        "Compare_At_Price": getVal('Variant Compare At Price', 'number'),
                        "Requires_Shipping": getVal('Variant Requires Shipping', 'boolean'),
                        "Taxable": getVal('Variant Taxable', 'boolean'),
                        "Unit_Price_Total_Measure": getVal('Unit Price Total Measure', 'number') || 0,
                        "Unit_Price_Total_Measure_Unit": getVal('Unit Price Total Measure Unit'),
                        "Unit_Price_Base_Measure": getVal('Unit Price Base Measure', 'number') || 0,
                        "Unit_Price_Base_Measure_Unit": getVal('Unit Price Base Measure Unit'),
                        "Barcode": getVal('Variant Barcode'),
                        "Image": getVal('Variant Image') || null, 
                        "Weight_Unit": getVal('Variant Weight Unit'),
                        "Tax_Code": getVal('Variant Tax Code'),
                        "Cost_per_Item": getVal('Cost per item', 'number'),
                        "Options": variantOptions,
                    });
                });

                // Devolver el array final de productos
                resolve(Object.values(productsMap));
            },
            error: function(err) {
                reject(new Error("Error de PapaParse: " + err.message));
            }
        });
    });
}