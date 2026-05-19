import { useEffect, useState } from "react";
import { useUserauth } from "../context/UserAuthContext";

const useLoggedInUser = () => {
  const { user } = useUserauth();
  const email = user?.email;

  const [loggedInUser, setLoggedInUser] = useState({});

  useEffect(() => {
    if (!email) return;

    fetch(`${process.env.REACT_APP_BASE_URL}/auth/loggedInUser?email=${email}`)
      .then((res) => res.json())
      .then((data) => {
        setLoggedInUser(data);
      })
      .catch((err) => console.log(err));
  }, [email]);

  return [loggedInUser, setLoggedInUser];
};

export default useLoggedInUser;
