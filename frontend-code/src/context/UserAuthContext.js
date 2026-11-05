import {
  createContext,
  useContext,
  useState,
} from "react";
import { signOut } from "firebase/auth";
import auth from "../firebase.init";

const userAuthcontext = createContext(null);
const API_URL = process.env.REACT_APP_BASE_URL;

export function UserauthcontextProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );

  const setAuthSession = ({ token, user }) => {
    if (!token || !user) {
      throw new Error("Invalid authentication response.");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setToken(token);
    setUser(user);
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success || !data.token) {
      throw new Error(data.message || "Login failed.");
    }

    setAuthSession(data);
    return data;
  };

  const signin = async (username, name, email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.token || !data.user) {
      throw new Error(data.message || "Registration failed.");
    }

    setAuthSession(data);
    return data;
  };

  const logout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Firebase signout error:", error);
    }
  };

  return (
    <userAuthcontext.Provider
      value={{
        user,
        token,
        login,
        signin,
        logout,
        setAuthSession,
      }}
    >
      {children}
    </userAuthcontext.Provider>
  );
}

export function useUserauth() {
  const context = useContext(userAuthcontext);

  if (!context) {
    throw new Error(
      "useUserauth must be used inside UserauthcontextProvider"
    );
  }

  return context;
}
