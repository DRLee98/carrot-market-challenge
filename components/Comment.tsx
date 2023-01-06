import useMutation from "@libs/client/useMutation";
import { setTimestampFn } from "@libs/client/utils";
import { Comment, User } from "@prisma/client";
import { useEffect, useState } from "react";
import Avatar from "@components/Avatar";
import DeletePopup from "@components/DeletePopup";

interface CommentWithUserAndLikes
  extends Pick<Comment, "id" | "text" | "file" | "createAt"> {
  author: Pick<User, "id" | "name" | "avatar" | "email">;
  likes: {
    userId: number;
  }[];
  isLiked: boolean;
}

interface IComment extends CommentWithUserAndLikes {
  tweetId: number;
  userId?: number;
  likeCallbackFn: (id: number) => void;
  deleteCallbackFn: (id: number) => void;
}

interface DeleteResponse {
  ok: boolean;
}

export default ({
  id,
  text,
  file,
  author,
  likes,
  isLiked,
  createAt,
  tweetId,
  userId,
  likeCallbackFn,
  deleteCallbackFn,
}: IComment) => {
  const [toggleLike] = useMutation(`/api/tweet/${tweetId}/comment/${id}/like`);

  const onLikeClick = () => {
    toggleLike({});
    likeCallbackFn(id);
  };

  const [deletePopup, setDeletePopup] = useState(false);
  const [deleteComment, { data, loading }] = useMutation<{}, DeleteResponse>(
    `/api/tweet/${tweetId}/comment/${id}/delete`,
    "DELETE"
  );

  const onDeleteClick = () => {
    if (author.id !== userId) return;
    if (loading) return;
    deleteComment({});
  };

  const onOpenPopup = () => setDeletePopup(true);
  const onClosePopup = () => setDeletePopup(false);

  useEffect(() => {
    if (data?.ok) {
      deleteCallbackFn(id);
      onClosePopup();
    }
  }, [data]);

  return (
    <li
      key={`comment_${id}`}
      className="flex gap-2 py-4 border-t first:border-t-0"
    >
      <Avatar name={author.name} image={author.avatar} />
      <div className="flex flex-col gap-2 w-full">
        <div className="flex gap-2 items-center">
          <span className="font-bold capitalize">{author.name}</span>
          <span className="text-gray-500 font-light text-sm">
            {author.email}
          </span>
          <div className="text-gray-500">·</div>
          <span className="text-gray-500 font-light text-sm">
            {setTimestampFn(createAt)}
          </span>
          {author.id === userId && (
            <button
              onClick={onOpenPopup}
              className="ml-auto p-0.5 rounded-full hover:bg-gray-200 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </button>
          )}
        </div>
        <div className="flex justify-between items-start">
          <p className="text-slate-700 text-sm">{text}</p>
          <button
            onClick={onLikeClick}
            className="group flex gap-1 bg-white hover:bg-red-100 transition p-0.5 rounded-full"
          >
            {isLiked ? (
              <svg
                className="w-6 h-6 fill-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-6 h-6 stroke-slate-500 group-hover:stroke-red-600 transition"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                ></path>
              </svg>
            )}
          </button>
        </div>
        {file && <img src={file} className="rounded" />}
        <span className="text-slate-400 text-sm">
          좋아요 수: {likes.length}
        </span>
      </div>
      {deletePopup && (
        <DeletePopup
          text="댓글을 삭제하시겠습니까?"
          onDeleteFn={onDeleteClick}
          onCloseFn={onClosePopup}
        />
      )}
    </li>
  );
};
