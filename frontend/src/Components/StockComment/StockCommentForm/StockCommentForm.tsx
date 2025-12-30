import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

type Props = {
  defaultValues?: CommentFormInputs;
  handleComment: (e: CommentFormInputs) => void;
  onCancel?: () => void;
};

type CommentFormInputs = {
  title: string;
  content: string;
};

const validation = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  content: Yup.string().required("Content is required"),
});

const StockCommentForm = ({
  defaultValues,
  handleComment,
  onCancel,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormInputs>({
    resolver: yupResolver(validation),
    defaultValues,
  });

  const onSubmit = (data: CommentFormInputs) => {
    handleComment(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 ml-4 space-y-4">
      <div>
        <input
          type="text"
          placeholder="Title"
          {...register("title")}
          className="
            block w-full px-3 py-2
            border border-gray-300 rounded-lg
            bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400
            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
          "
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div>
        <textarea
          placeholder="Write a comment..."
          rows={4}
          {...register("content")}
          className="
            block w-full px-3 py-2
            border border-gray-300 rounded-lg
            bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400
            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
          "
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
        )}
      </div>

      <div className="flex space-x-2">
        <button
          type="submit"
          className="
            px-4 py-2 font-medium text-white rounded-lg
            bg-lightGreen hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300
          "
        >
          {defaultValues ? "Save" : "Post"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="
              px-4 py-2 font-medium text-gray-700 rounded-lg
              bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400
              dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500
            "
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default StockCommentForm;
