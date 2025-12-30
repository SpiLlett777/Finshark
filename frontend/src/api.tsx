// https://site.financialmodelingprep.com/developer/docs

import axios from "axios";
import {
  CompanyBalanceSheet,
  CompanyCashFlow,
  CompanyComparableData,
  CompanyIncomeStatement,
  CompanyKeyMetrics,
  CompanyProfile,
  CompanySearch,
  CompanyTenK,
} from "./company";

interface SearchResponse {
  data: CompanySearch[];
}

export const searchCompanies = async (query: string) => {
  try {
    return await axios.get<SearchResponse>(
      `https://financialmodelingprep.com/stable/search-symbol?query=${query}&limit=10&apikey=${import.meta.env.VITE_API_KEY}`,
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("error message: ", error.message);
      return error.message;
    } else {
      console.log("unexpected error: ", error);
      return "An unexpected error has occurred!";
    }
  }
};

export const getCompanyProfile = async (query: string) => {
  try {
    return await axios.get<CompanyProfile[]>(
      `https://financialmodelingprep.com/stable/profile?symbol=${query}&apikey=${import.meta.env.VITE_API_KEY}`,
    );
  } catch (error: any) {
    console.log("error message from API: ", error.message);
  }
};

export const getKeyMetrics = async (query: string) => {
  try {
    return await axios.get<CompanyKeyMetrics[]>(
      `https://financialmodelingprep.com/stable/key-metrics-ttm?symbol=${query}&apikey=${import.meta.env.VITE_API_KEY}`,
    );
  } catch (error: any) {
    console.log("error message from API: ", error.message);
  }
};

export const getIncomeStatement = async (query: string) => {
  try {
    return await axios.get<CompanyIncomeStatement[]>(
      `https://financialmodelingprep.com/stable/income-statement?symbol=${query}&limit=5&apikey=${import.meta.env.VITE_API_KEY}`,
    );
  } catch (error: any) {
    console.log("error message from API: ", error.message);
  }
};

export const getBalanceSheet = async (query: string) => {
  try {
    return await axios.get<CompanyBalanceSheet[]>(
      `https://financialmodelingprep.com/stable/balance-sheet-statement?symbol=${query}&limit=5&apikey=${import.meta.env.VITE_API_KEY}`,
    );
  } catch (error: any) {
    console.log("error message from API: ", error.message);
  }
};

export const getCashFlowStatement = async (query: string) => {
  try {
    return await axios.get<CompanyCashFlow[]>(
      `https://financialmodelingprep.com/stable/cash-flow-statement?symbol=${query}&limit=5&apikey=${import.meta.env.VITE_API_KEY}`,
    );
  } catch (error: any) {
    console.log("error message from API: ", error.message);
  }
};

export const getComparableData = async (query: string) => {
  try {
    return await axios.get<CompanyComparableData[]>(
      `https://financialmodelingprep.com/stable/stock-peers?symbol=${query}&apikey=${import.meta.env.VITE_API_KEY}`,
    );
  } catch (error: any) {
    console.log("error message from API: ", error.message);
  }
};

export const getTenK = async (query: string) => {
  try {
    return await axios.get<CompanyTenK[]>(
      `https://financialmodelingprep.com/stable/sec-filings-search/symbol?symbol=${query}&from=2025-12-18&to=2025-12-20&page=0&apikey=${import.meta.env.VITE_API_KEY}`,
    );
  } catch (error: any) {
    console.log("error message from API: ", error.message);
  }
};
