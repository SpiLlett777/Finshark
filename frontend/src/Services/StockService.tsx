import axios from "axios";
import { handleError } from "../Helpers/ErrorHandler.tsx";

const stockApiBase = import.meta.env.VITE_STOCK_API;

export type StockDto = {
  id: number;
  symbol: string;
  companyName: string;
  purchase: number;
  lastDiv: number;
  industry: string;
  marketCap: number;
  comments?: any[];
};

export const stockGetAPI = async (stockId: number) => {
  try {
    return await axios.get<StockDto>(stockApiBase + `/api/stock/${stockId}`);
  } catch (error) {
    return handleError(error);
  }
};

export const stockFindBySymbolAPI = async (symbol: string) => {
  try {
    return await axios.get<StockDto[]>(stockApiBase + `/api/stock`, {
      params: { symbol },
    });
  } catch (error) {
    return handleError(error);
  }
};
