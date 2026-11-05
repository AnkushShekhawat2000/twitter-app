import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
} from "react";

import { useUserauth } from "./UserAuthContext";
import { authFetch } from "../utils/authfetch.js";

const LoggedInUserContext = createContext(null);

export const LoggedInUserProvider = ({ children }) => {
  const { token, user: authUser } = useUserauth();

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLoggedInUser = useCallback(async () => {
    if (!token) {
      setLoggedInUser(null);
      setLoading(false);
      return null;
    }

    setLoading(true);

    try {
      const response = await authFetch("/auth/loggedInUser");

      if (!response.ok) {
        throw new Error("Failed to fetch logged-in user.");
      }

      const data = await response.json();
      const profile = data.user ?? data;

      setLoggedInUser(profile);
      return profile;
    } catch (error) {
      console.error("Logged-in user error:", error);
      setLoggedInUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      if (!token) {
        setLoggedInUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await authFetch("/auth/loggedInUser");

        if (!response.ok) {
          throw new Error("Failed to fetch logged-in user.");
        }

        const data = await response.json();
        const profile = data.user ?? data;

        if (!cancelled) {
          setLoggedInUser(profile);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Logged-in user error:", error);
          setLoggedInUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [token, authUser?._id]);

  return (
    <LoggedInUserContext.Provider
      value={{
        loggedInUser,
        setLoggedInUser,
        loading,
        fetchLoggedInUser,
      }}
    >
      {children}
    </LoggedInUserContext.Provider>
  );
};

export const useLoggedInUser = () => {
  const context = useContext(LoggedInUserContext);

  if (!context) {
    throw new Error(
      "useLoggedInUser must be used inside LoggedInUserProvider"
    );
  }

  return context;
};

