export type CommentPost = {
  title: string;
  content: string;
};

export type CommentGet = {
  id: number;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
};

export type CommentUpdate = {
  title: string;
  content: string;
};
