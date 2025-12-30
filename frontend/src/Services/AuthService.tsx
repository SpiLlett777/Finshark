import axios from "axios";
import { handleError } from "../Helpers/ErrorHandler.tsx";
import { UserProfileToken } from "../Models/User.ts";

const accountApiBase = import.meta.env.VITE_ACCOUNT_API;

export const loginApi = async (username: string, password: string) => {
  try {
    return await axios.post<UserProfileToken>(
      accountApiBase + "/api/account/login",
      {
        username: username,
        password: password,
      },
    );
  } catch (error) {
    handleError(error);
  }
};

export const registerApi = async (
  email: string,
  username: string,
  password: string,
) => {
  try {
    return await axios.post<UserProfileToken>(
      accountApiBase + "/api/account/register",
      {
        email: email,
        username: username,
        password: password,
      },
    );
  } catch (error) {
    handleError(error);
  }
};

export const getUserIdByUsernameAPI = async (username: string) => {
  if (!username) return null;
  try {
    return await axios.get<{ userId: string; username: string }>(
      accountApiBase + `/api/account/username/${username}`,
      { params: { username } },
    );
  } catch (error) {
    return handleError(error);
  }
};
