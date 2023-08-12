import { GetServerSideProps, NextPage } from "next";
import NextLink from "next/link";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Link,
  Typography,
} from "@mui/material";
import { CartList, OrderSummary } from "@/components/cart";
import {
  AirplaneTicketOutlined,
  CreditCardOffOutlined,
  CreditScoreOutlined,
} from "@mui/icons-material";
import { getToken } from "next-auth/jwt";
import { dbOrders } from "@/database";
import { IOrder } from "@/interfaces";
import { countries } from "@/utils";
import { AdminLayout } from "@/components/layout/AdminLayout";

interface Props {
  order: IOrder;
}

const AdminOrderPage: NextPage<Props> = ({ order }) => {
  const { shippingAddress } = order;

  return (
    <AdminLayout
      title="Resumen de la orden"
      subtitle={`Orden: ${order._id}`}
      icon={<AirplaneTicketOutlined />}
    >
      {order.isPaid ? (
        <Chip
          sx={{ my: 2 }}
          label="Pagada con éxito"
          color="success"
          icon={<CreditScoreOutlined />}
        />
      ) : (
        <Chip
          sx={{ my: 2 }}
          label="Pendiente de pago"
          color="error"
          icon={<CreditCardOffOutlined />}
        />
      )}

      <Grid container className="fadeIn">
        <Grid item xs={12} sm={7}>
          <CartList products={order.orderItems} />
        </Grid>
        <Grid item xs={12} sm={5}>
          <Card className="summary-card">
            <CardContent>
              <Typography variant="h2">
                Resumen (
                {order.numberOfItems > 1
                  ? `${order.numberOfItems} productos`
                  : `${order.numberOfItems} producto`}
                )
              </Typography>
              <Divider sx={{ marginY: 1 }} />

              <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle1">
                  Dirección de entrega
                </Typography>
                <NextLink href="/checkout/address" passHref legacyBehavior>
                  <Link underline="always">Editar</Link>
                </NextLink>
              </Box>

              <Typography>
                {order.shippingAddress.firstName}{" "}
                {order.shippingAddress.lastName}
              </Typography>
              <Typography>
                {order.shippingAddress.address2 !== ""
                  ? `${order.shippingAddress.address}, ${order.shippingAddress.address2}`
                  : `${order.shippingAddress.address}`}
              </Typography>
              <Typography>{`${order.shippingAddress.city}, ${order.shippingAddress.zip}`}</Typography>
              <Typography>
                {
                  countries.filter(
                    (country) => country.code === order.shippingAddress.country
                  )[0].name
                }
              </Typography>
              <Typography>{order.shippingAddress.phone}</Typography>

              <Divider sx={{ marginY: 1 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle1">Productos</Typography>
                <NextLink href="/cart" passHref legacyBehavior>
                  <Link underline="always">Editar</Link>
                </NextLink>
              </Box>

              <OrderSummary
                orderValues={{
                  numberOfItems: order.numberOfItems,
                  subTotal: order.subTotal,
                  total: order.total,
                  tax: order.tax,
                }}
              />
              <Box flexDirection="column" display="flex">
                {order.isPaid ? (
                  <Chip
                    sx={{ my: 2, flex: 1 }}
                    label="Pagada con éxito"
                    color="success"
                    icon={<CreditScoreOutlined />}
                  />
                ) : (
                  <Chip
                    sx={{ my: 2, flex: 1 }}
                    label="Pendiente de pago"
                    color="error"
                    icon={<CreditCardOffOutlined />}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const { id = "" } = query;

  const session: any = await getToken({ req });

  if (!session) {
    //Puede que el token haya caducado entonces lo redireccionamos al login
    return {
      redirect: {
        destination: `/auth/login?p=/orders/${id}`,
        permanent: false,
      },
    };
  }

  const order = await dbOrders.getOrderById(id.toString());

  if (!order) {
    return {
      redirect: {
        destination: "/admin/orders",
        permanent: false,
      },
    };
  }

  return {
    props: {
      order,
    },
  };
};

export default AdminOrderPage;
