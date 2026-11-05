import { useEffect, useState } from "react";
import { authFetch } from "../utils/authfetch.js";

const useLoggedInUser = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchLoggedInUser = async () => {
      try {
        setLoading(true);

        const response = await authFetch("/auth/loggedInUser");

        if (!response.ok) {
          throw new Error("Failed to fetch logged-in user");
        }

        const data = await response.json();

        if (!cancelled) {
          setLoggedInUser(data.user);
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

    fetchLoggedInUser();

    return () => {
      cancelled = true;
    };
  }, []);

  return [loggedInUser, setLoggedInUser, loading];
};

export default useLoggedInUser;