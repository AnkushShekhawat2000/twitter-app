import { createContext, useContext, useEffect, useState } from "react";
import { useUserauth } from "./UserAuthContext";

const LoggedInUserContext = createContext();

export const LoggedInUserProvider = ({ children }) => {

  const { user } = useUserauth();

//   console.log("user--->",user);
  const [loggedInUser, setLoggedInUser] = useState(null);
  
//   console.log("loggedInUser--->",loggedInUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (!user?.email) return;

    const fetchLoggedInUser = async () => {

      try {

        const res = await fetch(
          `${process.env.REACT_APP_BASE_URL}/auth/loggedInUser?email=${user?.email}`
        );

        const data = await res.json();

        setLoggedInUser(data);

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }
    };

    fetchLoggedInUser();

  }, [user?.email]);

  return (
    <LoggedInUserContext.Provider
      value={{ loggedInUser, setLoggedInUser, loading }}
    >
      {children}
    </LoggedInUserContext.Provider>
  );
};

export const useLoggedInUser = () => {
  return useContext(LoggedInUserContext);
};