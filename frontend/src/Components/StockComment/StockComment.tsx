import StockCommentForm from "./StockCommentForm/StockCommentForm.tsx";
import {
  commentGetAPI,
  commentPostAPI,
} from "../../Services/CommentService.tsx";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { CommentGet } from "../../Models/Comment.ts";
import Spinner from "../Spinner/Spinner.tsx";
import StockCommentList from "../StockCommentList/StockCommentList.tsx";

type Props = {
  stockSymbol: string;
};

type CommentFormInputs = {
  title: string;
  content: string;
};

const StockComment = ({ stockSymbol }: Props) => {
  const [comments, setComments] = useState<CommentGet[] | null>(null);
  const [loading, setLoading] = useState<boolean>();

  useEffect(() => {
    getComments();
  }, []);

  const handleComment = (e: CommentFormInputs) => {
    commentPostAPI(e.title, e.content, stockSymbol)
      .then((respond) => {
        if (respond) {
          toast.success("Comment created successfully!");
          getComments();
        }
      })
      .catch((e) => {
        toast.warning(e);
      });
  };

  const getComments = () => {
    setLoading(true);
    commentGetAPI(stockSymbol).then((respond) => {
      setLoading(false);
      setComments(respond?.data ?? null);
    });
  };
  return (
    <div className="flex flex-col">
      {loading ? (
        <Spinner />
      ) : (
        <StockCommentList comments={comments!} onChanged={getComments} />
      )}
      <StockCommentForm handleComment={handleComment} />
    </div>
  );
};

export default StockComment;
