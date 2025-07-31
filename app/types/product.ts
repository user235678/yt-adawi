export type ProductColor = 'noir' | 'blanc' | 'rouge' | 'vert' | 'marron';
export type ProductSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
// export type ProductColor = 'noir' | 'blanc' | 'rouge' | 'vert' | 'marron';
// export type ProductSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';

export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  colors: ProductColor[];
  sizes: ProductSize[];
  category: string;
}
