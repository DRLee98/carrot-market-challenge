import withHandler from "@libs/server/withHandler";
import withSession from "@libs/server/withSession";
import db from "@libs/server/db";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      query: { tweetId, commentId },
      session: {
        user: { id },
      },
    } = req;

    const comment = await db.comment.findUnique({
      where: { id: +commentId },
      select: {
        id: true,
        authorId: true,
        tweetId: true,
      },
    });
    if (!comment) {
      return res.json({ ok: false, error: "존재하지 않는 댓글입니다." });
    }
    if (comment.tweetId !== +tweetId) {
      return res.json({
        ok: false,
        error: "해당 트윗의 댓글이 아닙니다.",
      });
    }
    if (comment.authorId !== id) {
      return res.json({
        ok: false,
        error: "자신이 작성한 댓글만 삭제할 수 있습니다.",
      });
    }
    await db.comment.delete({ where: { id: comment.id } });
    res.json({ ok: true });
  } catch (error) {
    res.json({ ok: false, error });
  }
}

export default withSession(withHandler({ handler, methods: ["DELETE"] }));
