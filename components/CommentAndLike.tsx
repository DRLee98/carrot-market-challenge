import useMutation from "@libs/client/useMutation";
import { cls } from "@libs/client/utils";
import React from "react";

interface ICommentAndLike {
  id: number;
  commentsCount: number;
  likesCount: number;
  isLiked: boolean;
  likeUrl: string;
  likeCallbackFn: (id: number) => void;
}

export default ({
  id,
  commentsCount,
  likesCount,
  isLiked,
  likeUrl,
  likeCallbackFn,
}: ICommentAndLike) => {
  const [toggleLike] = useMutation(likeUrl);

  const onLikeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    toggleLike({});
    likeCallbackFn(id);
  };
  return (
    <div className="mt-2 flex gap-6">
      <button className="flex gap-1 bg-white py-1 px-2 rounded-full">
        <svg
          className="w-6 h-6 stroke-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          ></path>
        </svg>
        <span className="text-slate-500">{commentsCount}</span>
      </button>
      <button
        onClick={onLikeClick}
        className="group flex gap-1 bg-white hover:bg-red-100 transition py-1 px-2 rounded-full"
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
              stroke-width="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            ></path>
          </svg>
        )}
        <span
          className={cls(
            isLiked
              ? "text-red-600"
              : "text-slate-500 group-hover:text-red-600 transition"
          )}
        >
          {likesCount}
        </span>
      </button>
    </div>
  );
};
