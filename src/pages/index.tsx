import { Typography } from "@mui/material";
import { ShopLayout } from "@/components/layout";
import { useProducts } from "@/hooks";
import { ProductList } from "@/components/products";
import { FullScreenLoading } from "@/components/ui";

export default function Home() {
  const { products, isLoading } = useProducts("/products");

  return (
    <ShopLayout
      title={"Teslo-shop - Home"}
      pageDescription={"Encuentra los mejores productos de Teslo aqui!!!"}
    >
      <Typography variant="h1" component="h1">
        Tienda
      </Typography>
      <Typography variant="h2" sx={{ mb: 1 }}>
        Todos los productos
      </Typography>

      {isLoading ? <FullScreenLoading /> : <ProductList products={products} />}
    </ShopLayout>
  );
}
