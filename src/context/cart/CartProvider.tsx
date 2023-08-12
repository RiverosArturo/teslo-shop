import { FC, PropsWithChildren, useEffect, useReducer } from "react";

import Cookie from "js-cookie";

import { CartContext, cartReducer } from "./";
import { Address, ICartProduct, IOrder } from "@/interfaces";
import { tesloApi } from "@/api";
import axios from "axios";

export interface CartState {
  isLoaded: boolean;
  cart: ICartProduct[];
  numberOfItems: number;
  subTotal: number;
  tax: number;
  total: number;
  shippingAddress?: Address;
}

const CART_INITIAL_STATE: CartState = {
  isLoaded: false,
  cart: Cookie.get("cart") ? JSON.parse(Cookie.get("cart")!) : [],
  numberOfItems: 0,
  subTotal: 0,
  tax: 0,
  total: 0,
  shippingAddress: undefined,
};

export const CartProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, CART_INITIAL_STATE);

  useEffect(() => {
    //Verificamos que tengamos datos en nuestra cookie cart, si no tenemos regresamos []
    try {
      const cookieProducts = Cookie.get("cart")
        ? JSON.parse(Cookie.get("cart")!)
        : [];
      dispatch({
        type: "Cart - LoadCart from cookies | storage",
        payload: cookieProducts,
      });
    } catch (error) {
      //Por si llegan a modificar la cookie desde el navegador
      dispatch({
        type: "Cart - LoadCart from cookies | storage",
        payload: [],
      });
    }
  }, []);

  //Almacenamos nuestro carrito de compras en las cookies
  useEffect(() => {
    //Creamos la cookie cart y serealizamos nuestro carrito state.cart
    Cookie.set("cart", JSON.stringify(state.cart), {
      expires: 1000 * 60 * 60 * 24,
    });
  }, [state.cart]);

  useEffect(() => {
    if (Cookie.get("firstName")) {
      const address = {
        firstName: Cookie.get("firstName") || "",
        lastName: Cookie.get("lastName") || "",
        address: Cookie.get("address") || "",
        address2: Cookie.get("address2") || "",
        zip: Cookie.get("zip") || "",
        city: Cookie.get("city") || "",
        country: Cookie.get("country") || "",
        phone: Cookie.get("phone") || "",
      };

      dispatch({
        type: "Cart - LoadAddress from Cookies",
        payload: address,
      });
    }
  }, []);

  //useEffect para conseguir los valores de nuestro pedido
  useEffect(() => {
    const numberOfItems = state.cart.reduce(
      (prev, current) => current.quantity + prev,
      0
    );

    const subTotal = state.cart.reduce(
      (prev, current) => current.quantity * current.price + prev,
      0
    );

    const taxRate = Number(process.env.TAX_RATE || 0);

    const orderSummary = {
      //prev es nuestro valor acterior y current es del tipo ICartProduct, 0 es nuestro valor inicial
      numberOfItems,
      subTotal,
      tax: subTotal * taxRate,
      total: subTotal * (taxRate + 1),
    };

    // console.log({ orderSummary });
    dispatch({ type: "Cart - Update order summary", payload: orderSummary });
  }, [state.cart]);

  const addProductToCart = (product: ICartProduct) => {
    // dispatch({ type: "Cart - Add Product", payload: product });
    const productInCart = state.cart.some((p) => p._id === product._id);
    if (!productInCart)
      return dispatch({
        type: "Cart - Update products in cart",
        payload: [...state.cart, product],
      });

    const productInCartVutDifferentSize = state.cart.some(
      (p) => p._id === product._id && p.size === product.size
    );
    if (!productInCartVutDifferentSize)
      return dispatch({
        type: "Cart - Update products in cart",
        payload: [...state.cart, product],
      });

    //Acumular
    const updatedProducts = state.cart.map((p) => {
      if (p._id !== product._id) return p;
      if (p.size !== product.size) return p;

      //actualizar cantidad
      p.quantity += product.quantity;

      return p;
    });

    dispatch({
      type: "Cart - Update products in cart",
      payload: updatedProducts,
    });
  };

  const updateCartQuantity = (product: ICartProduct) => {
    dispatch({ type: "Cart - Change cart quantity", payload: product });
  };

  const removeCartProduct = (product: ICartProduct) => {
    dispatch({ type: "Cart - Remove product in cart", payload: product });
  };

  const updateAddress = (address: Address) => {
    Cookie.set("firstName", address.firstName);
    Cookie.set("lastName", address.lastName);
    Cookie.set("address", address.address);
    Cookie.set("address2", address.address2 || "");
    Cookie.set("zip", address.zip);
    Cookie.set("city", address.city);
    Cookie.set("country", address.country);
    Cookie.set("phone", address.phone);
    dispatch({ type: "Cart - Update Address", payload: address });
  };

  const createOrder = async (): Promise<{
    hasError: boolean;
    message: string;
  }> => {
    if (!state.shippingAddress) {
      throw new Error("No hay dirección de entrega.");
    }

    const body: IOrder = {
      //En order items hacremos el spreed de p y ponemos que size: siempre tendra el valor de p.size,
      //Para asegurarnos de que orderItems no sea undefined
      orderItems: state.cart.map((p) => ({
        ...p,
        size: p.size!,
      })),
      shippingAddress: state.shippingAddress,
      numberOfItems: state.numberOfItems,
      subTotal: state.subTotal,
      tax: state.tax,
      total: state.total,
      isPaid: false,
      transactionId: "",
    };

    try {
      const { data } = await tesloApi.post<IOrder>("/orders", body);
      // console.log(data);
      //Dispatch para vaciar el carrito y limpiar el state:
      dispatch({ type: "Cart - Order complete" });
      return {
        hasError: false,
        message: data._id!,
      };
    } catch (error) {
      // console.log(error);
      //si es un error de axios
      if (axios.isAxiosError(error)) {
        return {
          hasError: true,
          message: error.response?.data.message,
        };
      }
      //Si es un error pero no de axios
      return {
        hasError: true,
        message: "Error no encontrado hable con el administrador",
      };
    }
  };
  return (
    <CartContext.Provider
      value={{
        ...state,

        //Methods
        addProductToCart,
        updateCartQuantity,
        removeCartProduct,
        updateAddress,
        //Orders
        createOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
