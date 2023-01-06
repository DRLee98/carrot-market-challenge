import Avatar from "@components/Avatar";
import TitleBox from "@components/TitleBox";
import Tweet, { TweetWithAuthorAndCount } from "@components/Tweet";
import useMe from "@libs/client/useMe";
import { cls, getDateText } from "@libs/client/utils";
import { User } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import useSWR from "swr";

type TTab = "my" | "liked";

interface ProfileResponse {
  ok: boolean;
  user: Pick<User, "id" | "name" | "email" | "avatar" | "bio" | "createAt">;
  tweets: TweetWithAuthorAndCount[];
  likedTweets: TweetWithAuthorAndCount[];
}

export default () => {
  const router = useRouter();
  const { user } = useMe();

  const [tab, setTab] = useState<TTab>("my");

  const { data, mutate } = useSWR<ProfileResponse>(
    router.query.id ? `/api/user/${router.query.id}` : null
  );

  const updateLikeTweet = (id: number, tweet: TweetWithAuthorAndCount) => ({
    ...tweet,
    isLiked: tweet.id === id ? !tweet.isLiked : tweet.isLiked,
    _count: {
      ...tweet._count,
      likes:
        tweet.id === id
          ? tweet.isLiked
            ? tweet._count.likes - 1
            : tweet._count.likes + 1
          : tweet._count.likes,
    },
  });

  const updateLikeFn = (id: number) => {
    mutate(
      (prev) =>
        prev
          ? {
              ...prev,
              tweets: prev.tweets.map((tweet) => updateLikeTweet(id, tweet)),
              likedTweets: prev.likedTweets.map((tweet) =>
                updateLikeTweet(id, tweet)
              ),
            }
          : undefined,
      false
    );
  };

  const deleteTweetFn = (id: number) => {
    mutate(
      (prev) =>
        prev
          ? {
              ...prev,
              tweets: prev.tweets.filter((tweet) => tweet.id !== id),
              likedTweets: prev.likedTweets.filter((tweet) => tweet.id !== id),
            }
          : undefined,
      false
    );
  };

  return (
    <>
      <TitleBox title={data?.user?.name || ""} back />
      {data?.ok && (
        <div className="px-6 flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <Avatar
              id={data.user.id}
              name={data.user.name}
              image={data.user.avatar}
              size="xl"
            />
            <div className="flex flex-col w-full">
              <div className="w-full flex items-center justify-between">
                <strong className="text-2xl">{data.user.name}</strong>
                {user?.id === data.user.id && (
                  <Link href={"/edit-profile"}>
                    <a className="self-end font-bold border rounded-full py-1 px-4 hover:bg-sky-500 hover:text-white transition">
                      프로필 수정
                    </a>
                  </Link>
                )}
              </div>
              <span className="text-gray-500 font-light">
                {data.user.email}
              </span>
            </div>
          </div>
          <p>{data.user.bio}</p>
          <div className="flex gap-2 items-center">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
            <span className="text-slate-500">
              가입일: {getDateText(data.user.createAt).split("·")[0]}
            </span>
          </div>
          <div className="grid grid-cols-2 border-b">
            <button
              onClick={() => setTab("my")}
              className={cls(
                "py-4 border-b-4 transition duration-300",
                tab === "my" ? "border-sky-300" : "border-white"
              )}
            >
              <span>트윗</span>
            </button>
            <button
              onClick={() => setTab("liked")}
              className={cls(
                "py-4 border-b-4 transition duration-300",
                tab === "liked" ? "border-sky-300" : "border-white"
              )}
            >
              <span>좋아한 트윗</span>
            </button>
          </div>
          <ul>
            {tab === "my"
              ? data.tweets.map((tweet) => (
                  <Tweet
                    {...tweet}
                    likeCallbackFn={updateLikeFn}
                    deleteCallbackFn={deleteTweetFn}
                  />
                ))
              : data.likedTweets.map((tweet) => (
                  <Tweet
                    {...tweet}
                    likeCallbackFn={updateLikeFn}
                    deleteCallbackFn={deleteTweetFn}
                  />
                ))}
          </ul>
        </div>
      )}
    </>
  );
};
