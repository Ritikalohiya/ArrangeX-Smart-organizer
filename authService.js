import api from "./api";

export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);

  console.log("LOGIN API RESPONSE:", response.data);

  return response.data;
}; 

export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);

  console.log("REGISTER API RESPONSE:", response.data);

  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};