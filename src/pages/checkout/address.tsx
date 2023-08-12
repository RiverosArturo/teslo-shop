import { GetServerSideProps } from "next";
import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { ShopLayout } from "@/components/layout";
import { countries } from "@/utils";
import { useForm } from "react-hook-form";
import { ErrorOutline } from "@mui/icons-material";
import { useContext, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { CartContext } from "@/context";
import { Address } from "@/interfaces";

const getAddressFromCookies = (): Address => {
  return {
    firstName: Cookies.get("firstName") || "",
    lastName: Cookies.get("lastName") || "",
    address: Cookies.get("address") || "",
    address2: Cookies.get("address2") || "",
    zip: Cookies.get("zip") || "",
    city: Cookies.get("city") || "",
    country: Cookies.get("country") || "",
    phone: Cookies.get("phone") || "",
  };
};

const AddressPage = () => {
  const router = useRouter();
  const { updateAddress } = useContext(CartContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Address>({
    defaultValues: getAddressFromCookies(),
  });

  const [countryValue, setCountryValue] = useState("");

  const onSubmitAddress = async (data: Address) => {
    updateAddress(data);
    router.push("/checkout/summary");
  };
  return (
    <ShopLayout
      title="Direción"
      pageDescription="Confirmar drección del destino"
    >
      <form onSubmit={handleSubmit(onSubmitAddress)} noValidate>
        <Typography variant="h1" component="h1">
          Dirección
        </Typography>
        <Chip
          label="Verifica que todos los campos hayan sido llenados correctamente"
          color="error"
          icon={<ErrorOutline />}
          className="fadeIn"
          sx={{
            display:
              errors.lastName ||
              errors.firstName ||
              errors.address ||
              errors.zip ||
              errors.city ||
              errors.country ||
              errors.phone
                ? "flex"
                : "none",
          }}
        />
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              type="text"
              label="Nombre"
              variant="filled"
              fullWidth
              {...register("firstName", {
                required: "Este campo es requerido",
                minLength: { value: 3, message: "Mínimo 3 caracteres" },
              })}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="text"
              label="Apellido"
              variant="filled"
              fullWidth
              {...register("lastName", {
                required: "Este campo es requerido",
                minLength: { value: 3, message: "Mínimo 3 caracteres" },
              })}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              type="text"
              label="Direción"
              variant="filled"
              fullWidth
              {...register("address", {
                required: "Este campo es requerido",
              })}
              error={!!errors.address}
              helperText={errors.address?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="text"
              label="Direción 2"
              variant="filled"
              fullWidth
              {...register("address2")}
              error={!!errors.address2}
              helperText={errors.address2?.message}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              type="text"
              label="Código Postal"
              variant="filled"
              fullWidth
              {...register("zip", {
                required: "Este campo es requerido",
              })}
              error={!!errors.zip}
              helperText={errors.zip?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="text"
              label="Ciudad"
              variant="filled"
              fullWidth
              {...register("city", {
                required: "Este campo es requerido",
              })}
              error={!!errors.city}
              helperText={errors.city?.message}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <TextField
                select
                variant="filled"
                label="País"
                value={
                  countryValue === ""
                    ? Cookies.get("country") || ""
                    : countryValue
                }
                {...register("country", {
                  required: "Este campo es requerido",
                })}
                error={!!errors.country}
                // helperText={ errors.country?.message }
              >
                {countries.map((country) => (
                  <MenuItem
                    key={country.code}
                    value={country.code}
                    onClick={() => setCountryValue(country.code)}
                  >
                    {country.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="tel"
              label="Teléfono"
              variant="filled"
              fullWidth
              {...register("phone", {
                required: "Este campo es requerido",
                minLength: { value: 3, message: "Mínimo 3 caracteres" },
              })}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 5 }} display="flex" justifyContent="center">
          <Button
            color="secondary"
            className="circular-btn"
            size="large"
            type="submit"
          >
            Revisar pedido
          </Button>
        </Box>
      </form>
    </ShopLayout>
  );
};

//Función de validación
// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time
// export const getServerSideProps: GetServerSideProps = async (ctx) => {
//   const { token = "" } = ctx.req.cookies;
//   let isValidToken = false;

//   try {
//     await jwt.isValidToken(token);
//     isValidToken = true;
//   } catch (error) {
//     isValidToken = false;
//   }

//   if (!isValidToken) {
//     return {
//       redirect: {
//         destination: "/auth/login?p=/checkout/address",
//         permanent: false,
//       },
//     };
//   }

//   return {
//     props: {},
//   };
// };
export default AddressPage;
