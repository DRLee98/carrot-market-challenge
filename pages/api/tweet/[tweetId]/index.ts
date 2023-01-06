import withHandler from "@libs/server/withHandler";
import withSession from "@libs/server/withSession";
import db from "@libs/server/db";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      query: { tweetId },
      session: {
        user: { id },
      },
    } = req;
    const userOption = {
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    };
    const tweet = await db.tweet.findUnique({
      where: { id: +tweetId },
      include: {
        files: {
          select: {
            url: true,
          },
        },
        author: userOption,
        comments: {
          select: {
            id: true,
            text: true,
            file: true,
            createAt: true,
            author: userOption,
            likes: {
              select: {
                userId: true,
              },
            },
          },
          orderBy: {
            createAt: "desc",
          },
        },
        likes: {
          select: {
            user: userOption,
          },
        },
      },
    });
    if (!tweet)
      return res.json({ ok: false, error: "존재하지 않는 트윗입니다" });
    const isLiked = Boolean(tweet.likes.find(({ user }) => user.id === id));
    const commentsWithIsLiked = tweet.comments.map((comment) => ({
      ...comment,
      isLiked: Boolean(comment.likes.find(({ userId }) => userId === id)),
    }));
    res.json({
      ok: true,
      tweet: { ...tweet, isLiked, comments: commentsWithIsLiked },
    });
  } catch (error) {
    res.json({ ok: false, error });
  }
}

export default withSession(withHandler({ handler, methods: ["GET"] }));
