export interface Product {
  name: string;
  description: string;
  unitPrice: number;
  stock: number;
  levelReorder: number;
  sku: string;
  barcode: string;
  dateEntry: string;
  expirationDate: string;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  isFragile: boolean;
  requiresRefurbishment: boolean;
  status: string;
}
