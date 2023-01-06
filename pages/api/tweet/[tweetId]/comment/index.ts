import withHandler from "@libs/server/withHandler";
import withSession from "@libs/server/withSession";
import db from "@libs/server/db";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      body: { text, file },
      query: { tweetId },
      session: {
        user: { id },
      },
    } = req;
    const comment = await db.comment.create({
      data: {
        text,
        file,
        tweet: { connect: { id: +tweetId } },
        author: { connect: { id } },
      },
      select: {
        id: true,
        text: true,
        file: true,
        createAt: true,
      },
    });
    res.json({ ok: true, comment });
  } catch (error) {
    res.json({ ok: false, error });
  }
}

export default withSession(withHandler({ handler, methods: ["POST"] }));
