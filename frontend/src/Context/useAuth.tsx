import React, { createContext, useEffect, useState } from "react";
import { UserProfile } from "../Models/User.ts";
import { useNavigate } from "react-router-dom";
import { loginApi, registerApi } from "../Services/AuthService.tsx";
import { toast } from "react-toastify";
import axios from "axios";

type UserContextType = {
  user: UserProfile | null;
  token: string | null;
  registerUser: (email: string, username: string, password: string) => void;
  loginUser: (username: string, password: string) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
};

type Props = { children: React.ReactNode };

const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({ children }: Props) => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (user && token) {
      setUser(JSON.parse(user));
      setToken(token);
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
    }
    setIsReady(true);
  }, []);

  const registerUser = async (
    email: string,
    username: string,
    password: string,
  ) => {
    await registerApi(email, username, password)
      .then((respond) => {
        if (respond) {
          localStorage.setItem("token", respond?.data.token);
          const userObj = {
            userName: respond?.data.userName,
            email: respond?.data.email,
          };
          localStorage.setItem("user", JSON.stringify(userObj));
          setToken(respond?.data.token);
          setUser(userObj);
          toast.success("Login Success!");
          navigate("/search");
        }
      })
      .catch(() => toast.warning("Server error occurred"));
  };

  const loginUser = async (username: string, password: string) => {
    await loginApi(username, password)
      .then((respond) => {
        if (respond) {
          localStorage.setItem("token", respond?.data.token);
          const userObj = {
            userName: respond?.data.userName,
            email: respond?.data.email,
          };
          localStorage.setItem("user", JSON.stringify(userObj));
          setToken(respond?.data.token);
          setUser(userObj);
          toast.success("Login Success!");
          navigate("/search");
        }
      })
      .catch(() => toast.warning("Server error occurred"));
  };

  const isLoggedIn = () => {
    return !!user;
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken("");
    navigate("/");
  };

  return (
    <UserContext.Provider
      value={{ loginUser, user, token, logout, isLoggedIn, registerUser }}
    >
      {isReady ? children : null}
    </UserContext.Provider>
  );
};

export const useAuth = () => React.useContext(UserContext);
