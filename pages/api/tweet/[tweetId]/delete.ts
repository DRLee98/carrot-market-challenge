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

    const tweet = await db.tweet.findUnique({
      where: { id: +tweetId },
      include: {
        author: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!tweet) {
      return res.json({ ok: false, error: "존재하지 않는 트윗입니다." });
    }
    if (tweet.author.id !== id) {
      return res.json({
        ok: false,
        error: "자신이 작성한 트윗만 삭제할 수 있습니다.",
      });
    }
    await db.tweet.delete({ where: { id: tweet.id } });
    res.json({ ok: true });
  } catch (error) {
    res.json({ ok: false, error });
  }
}

export default withSession(withHandler({ handler, methods: ["DELETE"] }));
