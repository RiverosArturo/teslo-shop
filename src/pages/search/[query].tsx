import { GetServerSideProps, NextPage } from "next";
import { ShopLayout } from "@/components/layout";
import { ProductList } from "@/components/products";
import { Box, Typography } from "@mui/material";
import { dbProducts } from "@/database";
import { IProduct } from "@/interfaces";

interface Props {
  products: IProduct[];
  foundProduct: boolean;
  query: string;
}

const SearchPage: NextPage<Props> = ({ products, foundProduct, query }) => {
  return (
    <ShopLayout
      title={"Teslo-shop - Search"}
      pageDescription={"Encuentra los mejores productos de Teslo aqui!!!"}
    >
      <Typography variant="h1" component="h1" textTransform="capitalize">
        Buscar producto
      </Typography>
      {foundProduct ? (
        <Typography variant="h2" sx={{ mb: 1 }}>
          {" "}
          Término: {query}
        </Typography>
      ) : (
        <Box>
          <Typography
            variant="h2"
            sx={{ mb: 1 }}
          >{`No se encontro ${query}, pero tenemos esto para ti`}</Typography>
          <ProductList products={products} />
        </Box>
      )}
      <ProductList products={products} />
    </ShopLayout>
  );
};

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { query = "" } = ctx.params as { query: string };

  if (query.length === 0) {
    return {
      redirect: {
        destination: "/",
        permanent: true,
      },
    };
  }

  let products = await dbProducts.getProductsByTerm(query);

  const foundProduct = products.length > 0;

  console.log(foundProduct);
  if (!foundProduct) {
    products = await dbProducts.getAllProducts();
  }

  return {
    props: {
      products,
      foundProduct,
      query,
    },
  };
};
export default SearchPage;
