import withHandler from "@libs/server/withHandler";
import withSession from "@libs/server/withSession";
import db from "@libs/server/db";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      query: { id },
      session: {
        user: { id: myId },
      },
    } = req;
    const findUser = await db.user.findUnique({
      where: { id: +id },
      select: {
        id: true,
        avatar: true,
        name: true,
        bio: true,
        email: true,
        createAt: true,
      },
    });
    if (findUser) {
      const tweetInclude = {
        author: {
          select: {
            id: true,
            email: true,
            avatar: true,
            name: true,
          },
        },
        files: {
          select: {
            url: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      };
      const tweets = await db.tweet.findMany({
        where: { authorId: +id },
        include: tweetInclude,
        orderBy: {
          updateAt: "desc",
        },
      });
      const likedTweets = await db.tweet.findMany({
        where: {
          likes: {
            some: {
              user: {
                id: +id,
              },
            },
          },
        },
        include: tweetInclude,
        orderBy: {
          updateAt: "desc",
        },
      });
      const myLikedTweets = (
        await db.likeTweet.findMany({
          where: {
            tweetId: {
              in: [
                ...tweets.map(({ id }) => id),
                ...likedTweets.map(({ id }) => id),
              ],
            },
            userId: myId,
          },
          select: {
            tweetId: true,
          },
        })
      ).map(({ tweetId }) => tweetId);
      return res.json({
        ok: true,
        user: findUser,
        tweets: tweets.map((tweet) => ({
          ...tweet,
          isLiked: myLikedTweets.includes(tweet.id),
        })),
        likedTweets: likedTweets.map((tweet) => ({
          ...tweet,
          isLiked: myLikedTweets.includes(tweet.id),
        })),
      });
    }
    res.json({ ok: false, error: "존재하지 않는 유저입니다." });
  } catch (error) {
    res.json({ ok: false, error });
  }
}

export default withSession(withHandler({ handler, methods: ["GET"] }));
