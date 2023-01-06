import withHandler from "@libs/server/withHandler";
import withSession from "@libs/server/withSession";
import db from "@libs/server/db";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      user: { id },
    } = req.session;
    const likes = (
      await db.likeTweet.findMany({
        where: {
          userId: id,
        },
        select: {
          tweetId: true,
        },
      })
    ).map(({ tweetId }) => tweetId);
    const tweets = (
      await db.tweet.findMany({
        include: {
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
          author: {
            select: {
              email: true,
              avatar: true,
              name: true,
              id: true,
            },
          },
          files: {
            select: {
              url: true,
            },
          },
        },
        orderBy: {
          updateAt: "desc",
        },
      })
    ).map((tweet) => ({ ...tweet, isLiked: likes.includes(tweet.id) }));

    res.json({ ok: true, tweets });
  } catch (error) {
    res.json({ ok: false, error });
  }
}

export default withSession(withHandler({ handler, methods: ["GET"] }));
