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
    const like = await db.likeTweet.findFirst({
      where: { tweetId: +tweetId, userId: id },
    });
    if (like) {
      await db.likeTweet.delete({
        where: {
          id: like.id,
        },
      });
      res.json({ ok: true, isLiked: false });
    } else {
      await db.likeTweet.create({
        data: {
          tweet: {
            connect: {
              id: +tweetId,
            },
          },
          user: {
            connect: {
              id,
            },
          },
        },
      });
      res.json({ ok: true, isLiked: true });
    }
  } catch (error) {
    res.json({ ok: false, error });
  }
}

export default withSession(withHandler({ handler, methods: ["POST"] }));
