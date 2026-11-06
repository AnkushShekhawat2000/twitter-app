// const API_URL = process.env.REACT_APP_BASE_URL;

// export const authenticatedRequest = async (
//   endpoint,
//   method = "POST",
//   body = null
// ) => {
//   if (!token) {
//     navigate("/login", { replace: true });
//     return null;
//   }

//   try {
//     const response = await fetch(`${API_URL}${endpoint}`, {
//       method,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       ...(body ? { body: JSON.stringify(body) } : {}),
//     });

//     const data = await response.json().catch(() => ({}));

//     if (response.status === 401) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       navigate("/login", { replace: true });
//       return null;
//     }

//     if (!response.ok) {
//       throw new Error(data.message || "Request failed");
//     }

//     return data;

//   } catch (error) {
//     throw error;
//   }
// };



// const API_URL = process.env.REACT_APP_BASE_URL;

// export const authenticatedRequest = async (
//   endpoint,
//   method = "POST",
//   body = null
// ) => {
  
//   const token = localStorage.getItem("token");

//   if (!token) {
//     throw new Error("Authentication token not found");
//   }

//   const response = await fetch(`${API_URL}${endpoint}`, {
//     method,
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     ...(body ? { body: JSON.stringify(body) } : {}),
//   });

//   const data = await response.json().catch(() => ({}));

//   if (!response.ok) {
//     throw new Error(data.message || "Request failed");
//   }

//   return data;
// };



const API_URL = process.env.REACT_APP_BASE_URL;

export const authenticatedRequest = async (
  endpoint,
  method = "POST",
  body = null
) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("LOGIN_REQUIRED");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    throw new Error("SESSION_EXPIRED");
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};
