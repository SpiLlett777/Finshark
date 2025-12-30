import { CommentGet } from "../../Models/Comment.ts";
import StockCommentListItem from "../StockCommentListItem/StockCommentListItem.tsx";
import { v4 as uuidv4 } from "uuid";

type Props = {
  comments: CommentGet[];
  onChanged: () => void;
};

const StockCommentList = ({ comments, onChanged }: Props) => {
  return (
    <>
      {comments
        ? comments.map((comment) => {
            return (
              <StockCommentListItem
                key={uuidv4()}
                comment={comment}
                onChanged={onChanged}
              ></StockCommentListItem>
            );
          })
        : ""}
    </>
  );
};

export default StockCommentList;
