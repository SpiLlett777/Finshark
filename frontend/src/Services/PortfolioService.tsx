import axios from "axios";
import { handleError } from "../Helpers/ErrorHandler.tsx";

const portfolioApiBase = import.meta.env.VITE_PORTFOLIO_API;

export type PortfolioItemBackendDto = {
  appUserId: string;
  stockId: number;
  quantity: number;
  addedAt: string;
};

export type PortfolioResponseDto = {
  username: string;
  items: PortfolioItemBackendDto[];
};

export const portfolioGetAPI = async () => {
  try {
    return await axios.get<PortfolioResponseDto>(
      portfolioApiBase + "/api/portfolio",
    );
  } catch (error) {
    handleError(error);
  }
};

export const portfolioAddAPI = async (stockId: number) => {
  try {
    return await axios.post(
      portfolioApiBase + `/api/portfolio?symbol=${stockId}`,
    );
  } catch (error) {
    handleError(error);
  }
};

export const portfolioDeleteAPI = async (stockId: number) => {
  try {
    return await axios.delete(
      portfolioApiBase + `/api/portfolio?symbol=${stockId}`,
    );
  } catch (error) {
    handleError(error);
  }
};

export const portfolioUpdateAPI = async (stockId: number, quantity: number) => {
  try {
    return await axios.put(portfolioApiBase + "/api/portfolio/update", null, {
      params: { stockId, quantity },
    });
  } catch (error) {
    handleError(error);
  }
};

export const portfolioTransferAPI = async (
  stockId: number,
  quantity: number,
  toUserId: string,
) => {
  try {
    return await axios.post(
      portfolioApiBase + "/api/portfolio/transfer",
      null,
      {
        params: { stockId, quantity, toUserId },
      },
    );
  } catch (error) {
    handleError(error);
  }
};
