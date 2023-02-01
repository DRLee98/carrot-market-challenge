import withHandler from "@libs/server/withHandler";
import withSession from "@libs/server/withSession";
import db from "@libs/server/db";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      body: { content, urls },
      session: {
        user: { id },
      },
    } = req;
    const tweet = await db.tweet.create({
      data: { content, author: { connect: { id } } },
    });
    const tUrls = urls as string[];
    if (tweet && tUrls && tUrls.length > 0) {
      const files = await Promise.all(
        tUrls.map(
          async (url) =>
            await db.file.create({
              data: { url, tweet: { connect: { id: tweet.id } } },
              select: { url: true },
            })
        )
      );
      res.json({ ok: true, tweet: { ...tweet, files } });
    } else {
      res.json({ ok: true, tweet: { ...tweet, files: [] } });
    }
  } catch (error) {
    console.log(error);
    res.json({ ok: false, error });
  }
}

export default withSession(withHandler({ handler, methods: ["POST"] }));
