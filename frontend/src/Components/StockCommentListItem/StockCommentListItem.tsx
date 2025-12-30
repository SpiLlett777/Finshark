import { CommentGet } from "../../Models/Comment.ts";
import { useAuth } from "../../Context/useAuth.tsx";
import { useState } from "react";
import {
  commentDeleteAPI,
  commentUpdateAPI,
} from "../../Services/CommentService.tsx";
import StockCommentForm from "../StockComment/StockCommentForm/StockCommentForm.tsx";

type Props = {
  comment: CommentGet;
  onChanged: () => void;
};

const StockCommentListItem = ({ comment, onChanged }: Props) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;
    await commentDeleteAPI(comment.id);
    onChanged();
  };

  const handleUpdate = async (data: { title: string; content: string }) => {
    await commentUpdateAPI(comment.id, data.title, data.content);
    setIsEditing(false);
    onChanged();
  };

  const isOwn = user?.userName === comment.createdBy;

  const formattedDate = (() => {
    const d = new Date(comment.createdAt);
    return isNaN(d.getTime()) ? "" : d.toLocaleString();
  })();

  return (
    <div className="relative grid grid-cols-1 gap-4 p-4 mb-8 border rounded-lg bg-white shadow-lg">
      {isEditing ? (
        <StockCommentForm
          handleComment={handleUpdate}
          defaultValues={{ title: comment.title, content: comment.content }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div className="flex justify-between">
            <h4 className="text-xl truncate">{comment.title}</h4>
            {isOwn && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-500 text-sm"
                >
                  Edit
                </button>
                <button onClick={handleDelete} className="text-red-500 text-sm">
                  Delete
                </button>
              </div>
            )}
          </div>
          <p className="text-gray-500">
            @{comment.createdBy}
            {formattedDate && `, ${formattedDate}`}
          </p>
          <p className="mt-2">{comment.content}</p>
        </>
      )}
    </div>
  );
};

export default StockCommentListItem;
