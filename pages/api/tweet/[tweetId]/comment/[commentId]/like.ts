import withHandler from "@libs/server/withHandler";
import withSession from "@libs/server/withSession";
import db from "@libs/server/db";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      query: { commentId },
      session: {
        user: { id },
      },
    } = req;
    const like = await db.likeComment.findFirst({
      where: { commentId: +commentId, userId: id },
    });
    if (like) {
      await db.likeComment.delete({
        where: {
          id: like.id,
        },
      });
      res.json({ ok: true, isLiked: false });
    } else {
      await db.likeComment.create({
        data: {
          comment: {
            connect: {
              id: +commentId,
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
