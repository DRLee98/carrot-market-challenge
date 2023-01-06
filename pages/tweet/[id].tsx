import React, { useEffect, useState } from "react";
import useMe from "@libs/client/useMe";
import { useRouter } from "next/router";
import useSWR from "swr";
import { Comment as PrismaComment, Tweet, User } from "@prisma/client";
import Avatar from "@components/Avatar";
import { cls, getDateText, getImageGrid } from "@libs/client/utils";
import useMutation from "@libs/client/useMutation";
import { useForm } from "react-hook-form";
import Textarea from "@components/Textarea";
import Button from "@components/Button";
import Comment from "@components/Comment";
import TitleBox from "@components/TitleBox";
import DeletePopup from "@components/DeletePopup";
import Link from "next/link";

type TUser = Pick<User, "id" | "name" | "avatar" | "email">;

interface CommentWithUserAndLikes
  extends Pick<PrismaComment, "id" | "text" | "file" | "createAt"> {
  author: TUser;
  likes: {
    userId: number;
  }[];
  isLiked: boolean;
}

interface ILike {
  user: TUser;
}

interface TweetData extends Tweet {
  files: { url: string }[];
  author: TUser;
  comments: CommentWithUserAndLikes[];
  likes: ILike[];
  isLiked: boolean;
}

interface TweetResponse {
  ok: boolean;
  tweet: TweetData;
}

interface CommentSendData extends Pick<PrismaComment, "text" | "file"> {}

interface CommentResponse {
  ok: boolean;
  comment: Pick<PrismaComment, "id" | "text" | "file" | "createAt">;
}

interface DeleteResponse {
  ok: boolean;
}

export default () => {
  const router = useRouter();
  const { user } = useMe();
  const { data, mutate } = useSWR<TweetResponse>(
    router.query.id ? `/api/tweet/${router.query.id}` : null
  );

  const getLikeText = (likes: ILike[]) => {
    if (likes.length === 0) return "좋아요 수: 0";
    const firstUser = likes[0].user;
    if (likes.length === 1)
      return (
        <span>
          <strong>{firstUser.name}</strong>님이 좋아합니다
        </span>
      );
    return (
      <span>
        <strong>{firstUser.name}</strong>님 외{" "}
        <strong>{likes.length - 1}명</strong>이 좋아합니다
      </span>
    );
  };

  const [toggleLike] = useMutation(
    router.query.id ? `/api/tweet/${router.query.id}/like` : null
  );

  const toggleLikeFn = () => {
    if (!data?.ok || !user) return;
    toggleLike({});
    mutate(
      (prev) =>
        prev
          ? {
              ok: true,
              tweet: {
                ...prev.tweet,
                isLiked: !prev.tweet.isLiked,
                likes: prev.tweet.isLiked
                  ? prev.tweet.likes.filter(
                      ({ user: likeUser }) => likeUser.id !== user.id
                    )
                  : [...prev.tweet.likes, { user }],
              },
            }
          : undefined,
      false
    );
  };

  const commentLikeCallbackFn = (id: number) => {
    if (!user) return;
    mutate(
      (prev) =>
        prev
          ? {
              ok: true,
              tweet: {
                ...prev.tweet,
                comments: prev.tweet.comments.map((comment) => ({
                  ...comment,
                  isLiked:
                    comment.id === id ? !comment.isLiked : comment.isLiked,
                  likes:
                    comment.id === id
                      ? comment.isLiked
                        ? comment.likes.filter(
                            ({ userId }) => userId !== user.id
                          )
                        : [...comment.likes, { userId: user.id }]
                      : comment.likes,
                })),
              },
            }
          : undefined,
      false
    );
  };

  const commentDeleteCallbackFn = (id: number) => {
    mutate(
      (prev) =>
        prev
          ? {
              ok: true,
              tweet: {
                ...prev.tweet,
                comments: prev.tweet.comments.filter(
                  (comment) => comment.id !== id
                ),
              },
            }
          : undefined,
      false
    );
  };

  const [comment, { data: commentData, loading, reset }] = useMutation<
    CommentSendData,
    CommentResponse
  >(router.query.id ? `/api/tweet/${router.query.id}/comment` : null);

  const {
    register,
    handleSubmit,
    watch,
    reset: formReset,
    formState: { isValid, errors },
  } = useForm<CommentSendData>({ mode: "onChange" });

  const onValid = (formData: CommentSendData) => {
    if (loading) return;
    comment(formData);
  };

  useEffect(() => {
    if (user && commentData?.ok) {
      const newComment: CommentWithUserAndLikes = {
        ...commentData.comment,
        author: user,
        likes: [],
        isLiked: false,
      };
      mutate(
        (prev) =>
          prev
            ? {
                ok: true,
                tweet: {
                  ...prev.tweet,
                  comments: [newComment, ...prev.tweet.comments],
                },
              }
            : undefined,
        false
      );
      reset();
      formReset();
    }
  }, [commentData]);

  const [deletePopup, setDeletePopup] = useState(false);
  const [deleteTweet, { data: deleteData, loading: deleteLoading }] =
    useMutation<{}, DeleteResponse>(
      router.query.id ? `/api/tweet/${router.query.id}/delete` : null,
      "DELETE"
    );

  const onDeleteClick = () => {
    if (data?.tweet.author.id !== user?.id) return;
    if (deleteLoading) return;
    deleteTweet({});
  };

  const onOpenPopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletePopup(true);
  };
  const onClosePopup = () => setDeletePopup(false);

  useEffect(() => {
    if (deleteData?.ok) {
      router.replace("/");
    }
  }, [deleteData]);

  const [likedUsersPopup, setLikedUsersPopup] = useState(false);

  const openLikedUsersPopupFn = () => setLikedUsersPopup(true);
  const closeLikedUsersPopupFn = () => setLikedUsersPopup(false);

  return (
    <>
      <TitleBox title="트윗" back />
      <div className="px-6 pt-4 pb-8">
        {data?.tweet && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <Avatar
                id={data.tweet.author.id}
                name={data.tweet.author.name}
                image={data.tweet.author.avatar}
                size="lg"
              />
              <div className="flex flex-col justify-center w-full">
                <div className="flex justify-between items-center">
                  <span className="font-bold capitalize">
                    {data.tweet.author.name}
                  </span>
                  {data.tweet.author.id === user?.id && (
                    <button
                      onClick={onOpenPopup}
                      className="p-0.5 rounded-full hover:bg-gray-200 transition"
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
                <span className="text-gray-500 font-light text-sm">
                  {data.tweet.author.email}
                </span>
              </div>
            </div>
            <div>
              <p className="text-slate-700 text-lg font-bold">
                {data.tweet.content}
              </p>
              {data.tweet.files.length > 0 && (
                <ul
                  className={cls(
                    "my-6 rounded-xl",
                    getImageGrid(data.tweet.files.length)
                  )}
                >
                  {data.tweet.files.map(({ url }, i) => (
                    <li
                      key={`tweet_image_${data.tweet.id}_${i}`}
                      className="flex items-center justify-center rounded-xl overflow-hidden"
                    >
                      <img src={url} className="w-full" />
                    </li>
                  ))}
                </ul>
              )}
              <span className="text-gray-500 text-sm">
                {getDateText(data.tweet.updateAt)}
              </span>
            </div>
            <div className="flex border-y py-2 gap-6 items-center">
              <div className="flex gap-2">
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  ></path>
                </svg>
                <span>댓글 수: {data.tweet.comments.length}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={toggleLikeFn}
                  className="group flex gap-1 bg-white hover:bg-red-100 transition p-2 rounded-full"
                >
                  {data.tweet.isLiked ? (
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
                </button>
                <button
                  className="hover:underline"
                  onClick={openLikedUsersPopupFn}
                >
                  {getLikeText(data.tweet.likes)}
                </button>
              </div>
            </div>
            {user && (
              <form onSubmit={handleSubmit(onValid)} className="flex gap-2">
                <Avatar id={user.id} name={user.name} image={user.avatar} />
                <div className="w-full flex flex-col gap-2">
                  <Textarea
                    placeholder="댓글을 입력해주세요"
                    {...register("text")}
                  />
                  {watch("file") && !Boolean(errors.file) && (
                    <img src={watch("file") || ""} className="rounded" />
                  )}
                  <div className="grid grid-cols-3 items-center gap-4">
                    <div className="w-full col-span-2 flex border rounded-lg">
                      <span className="inline-block p-2 rounded-lg">
                        <svg
                          className={cls(
                            "w-8 h-8 transition",
                            !Boolean(errors.file)
                              ? "stroke-sky-300"
                              : "stroke-gray-400"
                          )}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          ></path>
                        </svg>
                      </span>
                      <input
                        className="w-full focus:outline-none rounded-r-lg"
                        placeholder={"이미지 URL"}
                        {...register("file", {
                          pattern: {
                            value:
                              /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#()?&//=]*)/,
                            message: "URL 형태의 주소만 가능합니다.",
                          },
                        })}
                      />
                    </div>
                    <Button
                      text="작성하기"
                      disabled={!isValid}
                      loading={loading}
                    />
                  </div>
                </div>
              </form>
            )}
            <ul className="border-t">
              {data.tweet.comments.map((comment) => (
                <Comment
                  {...comment}
                  tweetId={data.tweet.id}
                  userId={user?.id}
                  likeCallbackFn={commentLikeCallbackFn}
                  deleteCallbackFn={commentDeleteCallbackFn}
                />
              ))}
            </ul>
          </div>
        )}
        {deletePopup && (
          <DeletePopup
            text="트윗을 삭제하시겠습니까?"
            onDeleteFn={onDeleteClick}
            onCloseFn={onClosePopup}
          />
        )}
        {likedUsersPopup && (
          <div className="fixed inset-0 bg-gray-300/50 flex items-center justify-center">
            <div className="w-96 h-[500px] bg-white rounded-xl flex flex-col">
              <div className="flex justify-between p-6 items-center">
                <span className="font-bold text-lg">좋아요 누른 유저들</span>
                <button
                  onClick={closeLikedUsersPopupFn}
                  className="p-1 rounded-full hover:bg-gray-100"
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
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
              <ul className="overflow-y-scroll h-full">
                {data?.tweet.likes.map(({ user }) => (
                  <li key={`liked_user_${user.id}`}>
                    <Link href={`/user/${user.id}`}>
                      <a className="px-6 py-4 hover:bg-gray-100 transition flex gap-4">
                        <Avatar
                          id={user.id}
                          name={user.name}
                          image={user.avatar}
                        />
                        <div className="flex flex-col">
                          <strong>{user.name}</strong>
                          <span className="text-gray-500 font-light text-sm">
                            {user.email}
                          </span>
                        </div>
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
