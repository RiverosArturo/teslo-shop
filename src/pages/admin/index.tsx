import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { SummaryTile } from "@/components/admin";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  AccessTimeOutlined,
  AttachMoneyOutlined,
  CancelPresentationOutlined,
  CategoryOutlined,
  CreditCardOffOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  GroupOutlined,
  ProductionQuantityLimitsOutlined,
} from "@mui/icons-material";
import { Card, CardContent, Grid, Typography } from "@mui/material";
import { DashboardSummaryResponse } from "@/interfaces";

const DashboardPage = () => {
  const { data, error } = useSWR<DashboardSummaryResponse>(
    "/api/admin/dashboard",
    {
      refreshInterval: 30 * 1000, //30 segundos
    }
  );

  const [refreshIn, setRefreshIn] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      //   console.log("Tick");
      setRefreshIn((refreshIn) => (refreshIn > 0 ? refreshIn - 1 : 30));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!error && !data) {
    return <></>;
  }

  if (error) {
    console.log(error);
    return <Typography>Error al cargar la información</Typography>;
  }

  const {
    numberOfOrders,
    paidOrders,
    notPaidOrders,
    numberOfClients,
    numberOfProducts,
    productsWithNoInventory,
    lowInventory,
  } = data!;

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Estadisticas generales"
      icon={<DashboardOutlined />}
    >
      <Grid container spacing={2}>
        <SummaryTile
          title={numberOfOrders}
          subtitle="Ordenes totales"
          icon={<CreditCardOutlined color="secondary" sx={{ fondtSize: 40 }} />}
        />

        <SummaryTile
          title={paidOrders}
          subtitle="Ordenes Pagadas"
          icon={<AttachMoneyOutlined color="success" sx={{ fondtSize: 40 }} />}
        />

        <SummaryTile
          title={notPaidOrders}
          subtitle="Ordenes Pendientes"
          icon={<CreditCardOffOutlined color="error" sx={{ fondtSize: 40 }} />}
        />

        <SummaryTile
          title={numberOfClients}
          subtitle="Clientes"
          icon={<GroupOutlined color="primary" sx={{ fondtSize: 40 }} />}
        />

        <SummaryTile
          title={numberOfProducts}
          subtitle="Productos"
          icon={<CategoryOutlined color="warning" sx={{ fondtSize: 40 }} />}
        />

        <SummaryTile
          title={productsWithNoInventory}
          subtitle="Sin existencias"
          icon={
            <CancelPresentationOutlined color="error" sx={{ fondtSize: 40 }} />
          }
        />

        <SummaryTile
          title={lowInventory}
          subtitle="Bajo inventario"
          icon={
            <ProductionQuantityLimitsOutlined
              color="warning"
              sx={{ fondtSize: 40 }}
            />
          }
        />

        <SummaryTile
          title={refreshIn}
          subtitle="Actualización en: "
          icon={<AccessTimeOutlined color="secondary" sx={{ fondtSize: 40 }} />}
        />
      </Grid>
    </AdminLayout>
  );
};

export default DashboardPage;
