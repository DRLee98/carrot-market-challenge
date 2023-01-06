import React from "react";
import useSWR from "swr";
import Tweet, { TweetWithAuthorAndCount } from "@components/Tweet";
import TitleBox from "@components/TitleBox";

export interface TweetsResponse {
  ok: boolean;
  tweets: TweetWithAuthorAndCount[];
}

export default () => {
  const { data: tweetsData, mutate } = useSWR<TweetsResponse>("/api/tweet/all");

  const updateLike = (id: number) => {
    mutate(
      (prev) =>
        prev
          ? {
              ok: true,
              tweets: prev.tweets.map((tweet) => ({
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
              })),
            }
          : tweetsData,
      false
    );
  };

  const deleteTweet = (id: number) => {
    mutate(
      (prev) =>
        prev
          ? {
              ok: true,
              tweets: prev.tweets.filter((tweet) => tweet.id !== id),
            }
          : tweetsData,
      false
    );
  };

  return (
    <div>
      <TitleBox title="홈" />
      <ul>
        {tweetsData?.tweets?.map((tweet) => (
          <Tweet
            {...tweet}
            likeCallbackFn={updateLike}
            deleteCallbackFn={deleteTweet}
          />
        ))}
      </ul>
    </div>
  );
};
