export interface ProductCsvRow {
    id_producto: string;
    id_almacen: string;
    nombre_producto: string;
    categoria: string;
    descripcion: string;
    sku: string;
    codigo_barras: string;
    precio_unitario: string;
    cantidad_stock: string;
    nivel_reorden: string;
    ultima_reposicion: string;
    fecha_vencimiento: string;
    id_proveedor: string;
    peso_kg: string;
    dimensiones_cm: string;
    es_fragil: string;
    requiere_refrigeracion: string;
    estado: string;
}
