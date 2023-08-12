import { FC, PropsWithChildren, useEffect, useReducer } from "react";
import { AuthContext, authReducer } from "./";
import { IUser } from "@/interfaces";
import { tesloApi } from "@/api";
import Cookie from "js-cookie";
import axios from "axios";
import { useSession, signOut } from "next-auth/react";
import { dbUsers } from "@/database";

export interface AuthState {
  isLoggedIn: boolean;
  user?: IUser;
}

const AUTH_INITIAL_STATE: AuthState = {
  isLoggedIn: false,
  user: undefined,
};

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, AUTH_INITIAL_STATE);
  const { data, status } = useSession();
  // const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      // console.log(data?.user);
      dispatch({ type: "Auth - Login", payload: data?.user as IUser });
    }
  }, [data, status]);

  //Para auth sin NextAuth
  // useEffect(() => {
  //   checkToken();
  // }, []);

  const checkToken = async () => {
    if (!Cookie.get("token")) {
      return;
    }

    try {
      const { data } = await tesloApi.get("/user/validate-token");
      const { token, user } = data;
      Cookie.set("token", token);
      dispatch({ type: "Auth - Login", payload: user });
    } catch (error) {
      Cookie.remove("token");
    }
  };

  const loginUser = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const { data } = await tesloApi.post("/user/login", { email, password });
      const { token, user } = data;
      Cookie.set("token", token);
      dispatch({ type: "Auth - Login", payload: user });
      return true;
    } catch (error) {
      return false;
    }
  };

  const registerUser = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ hasError: boolean; message?: string }> => {
    try {
      const { data } = await tesloApi.post("/user/register", {
        name,
        email,
        password,
      });
      const { token, user } = data;
      Cookie.set("token", token);
      dispatch({ type: "Auth - Login", payload: user });
      return {
        hasError: false,
        message: "",
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          hasError: true,
          message: error.response?.data.message,
        };
      }

      return {
        hasError: true,
        message: "No se pudo crear el usuario, intente de nuevo",
      };
    }
  };

  const logout = () => {
    Cookie.remove("firstName");
    Cookie.remove("lastName");
    Cookie.remove("address");
    Cookie.remove("address2");
    Cookie.remove("zip");
    Cookie.remove("city");
    Cookie.remove("country");
    Cookie.remove("phone");
    Cookie.remove("cart");
    signOut();
    //Para auth sin NextAuth
    // Cookie.remove("token");
    // router.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,

        //Methods
        loginUser,
        registerUser,
        checkToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
