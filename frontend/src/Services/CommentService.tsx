import axios from "axios";
import { CommentGet, CommentPost, CommentUpdate } from "../Models/Comment.ts";
import { handleError } from "../Helpers/ErrorHandler.tsx";

const stockApiBase = import.meta.env.VITE_STOCK_API;

export const commentPostAPI = async (
  title: string,
  content: string,
  symbol: string,
) => {
  try {
    return await axios.post<CommentPost>(
      stockApiBase + `/api/comment/${symbol}`,
      {
        title: title,
        content: content,
      },
    );
  } catch (error) {
    handleError(error);
  }
};

export const commentGetAPI = async (symbol: string) => {
  try {
    return await axios.get<CommentGet[]>(
      stockApiBase + `/api/comment?symbol=${symbol}`,
    );
  } catch (error) {
    handleError(error);
  }
};

export const commentUpdateAPI = async (
  id: number,
  title: string,
  content: string,
) => {
  try {
    return await axios.put<CommentUpdate>(stockApiBase + `/api/comment/${id}`, {
      title,
      content,
    });
  } catch (error) {
    handleError(error);
  }
};

export const commentDeleteAPI = async (id: number) => {
  try {
    return await axios.delete<void>(stockApiBase + `/api/comment/${id}`);
  } catch (error) {
    handleError(error);
  }
};
