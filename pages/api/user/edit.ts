import withHandler from "@libs/server/withHandler";
import withSession from "@libs/server/withSession";
import db from "@libs/server/db";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      body: { avatar, bio, name },
      session: {
        user: { id },
      },
    } = req;
    const findUser = await db.user.findUnique({ where: { id } });
    if (findUser) {
      await db.user.update({ where: { id }, data: { avatar, bio, name } });
      return res.json({ ok: true });
    }
    res.json({ ok: false, error: "존재하지 않는 유저입니다." });
  } catch (error) {
    res.json({ ok: false, error });
  }
}

export default withSession(withHandler({ handler, methods: ["POST"] }));
