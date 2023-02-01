import useMe from "@libs/client/useMe";
import useMutation from "@libs/client/useMutation";
import { cls, getImageGrid, setTimestampFn } from "@libs/client/utils";
import { Tweet, User } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Avatar from "./Avatar";
import CommentAndLike from "./CommentAndLike";
import DeletePopup from "./DeletePopup";
import Images from "./Images";

export interface TweetWithAuthorAndCount extends Tweet {
  files: {
    url: string;
  }[];
  author: Pick<User, "avatar" | "name" | "id" | "email">;
  isLiked: boolean;
  _count: {
    likes: number;
    comments: number;
  };
}

interface ITweet extends TweetWithAuthorAndCount {
  likeCallbackFn: (id: number) => void;
  deleteCallbackFn: (id: number) => void;
}

interface DeleteResponse {
  ok: boolean;
}

export default React.memo(
  ({
    id,
    content,
    files,
    updateAt,
    isLiked,
    author,
    _count,
    likeCallbackFn,
    deleteCallbackFn,
  }: ITweet) => {
    const router = useRouter();
    const { user } = useMe();

    const goUserDetail = (e: React.MouseEvent) => {
      e.stopPropagation();
      router.push(`/user/${author.id}`);
    };

    const [deletePopup, setDeletePopup] = useState(false);
    const [deleteTweet, { data, loading }] = useMutation<{}, DeleteResponse>(
      `/api/tweet/${id}/delete`,
      "DELETE"
    );

    const onDeleteClick = () => {
      if (author.id !== user?.id) return;
      if (loading) return;
      deleteTweet({});
    };

    const onOpenPopup = (e: React.MouseEvent) => {
      e.stopPropagation();
      setDeletePopup(true);
    };
    const onClosePopup = () => setDeletePopup(false);

    useEffect(() => {
      if (data?.ok) {
        deleteCallbackFn(id);
        onClosePopup();
      }
    }, [data]);
    return (
      <li
        key={`tweet_${id}`}
        className="border-t first:border-t-0 py-4 px-6 bg-white hover:bg-gray-50 transition cursor-pointer last:border-b"
      >
        <Link href={`/tweet/${id}`}>
          <div className="flex items-start gap-4">
            <button
              onClick={goUserDetail}
              className="rounded-full ring-sky-200 ring-0 ring-offset-4 hover:ring transition-shadow"
            >
              <Avatar id={author.id} name={author.name} image={author.avatar} />
            </button>
            <div className="w-full">
              <div className="flex gap-2 items-center w-full">
                <span className="font-bold capitalize">{author.name}</span>
                <span className="text-gray-500 font-light text-sm">
                  {author.email}
                </span>
                <div className="text-gray-500">·</div>
                <span className="text-gray-500 font-light text-sm">
                  {setTimestampFn(updateAt)}
                </span>
                {user?.id === author.id && (
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
              <div className="mt-2">
                <p className="text-slate-700">{content}</p>
                {files.length > 0 && (
                  <ul
                    className={cls(
                      "my-6 rounded-xl",
                      getImageGrid(files.length)
                    )}
                  >
                    {files.map(({ url }, i) => (
                      <li
                        key={`tweet_image_${id}_${i}`}
                        className="flex items-center justify-center rounded-xl overflow-hidden"
                      >
                        <img src={url} className="w-full" />
                      </li>
                    ))}
                  </ul>
                )}
                <CommentAndLike
                  id={id}
                  commentsCount={_count.comments}
                  likesCount={_count.likes}
                  isLiked={isLiked}
                  likeUrl={`/api/tweet/${id}/like`}
                  likeCallbackFn={likeCallbackFn}
                />
              </div>
            </div>
          </div>
        </Link>
        {deletePopup && (
          <DeletePopup
            text="트윗을 삭제하시겠습니까?"
            onDeleteFn={onDeleteClick}
            onCloseFn={onClosePopup}
          />
        )}
      </li>
    );
  },
  (prev, next) => JSON.stringify(prev) === JSON.stringify(next)
);
