import withHandler from "@libs/server/withHandler";
import withSession from "@libs/server/withSession";
import db from "@libs/server/db";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      body: { password, newPassword },
      session: {
        user: { id },
      },
    } = req;
    const findUser = await db.user.findUnique({ where: { id } });
    if (findUser) {
      const passwordCompare = bcrypt.compareSync(password, findUser.password);
      if (!passwordCompare) {
        return res.json({
          ok: false,
          error: "기존 비밀번호가 일치하지 않습니다.",
        });
      }
      await db.user.update({
        where: { id },
        data: { password: bcrypt.hashSync(newPassword, 10) },
      });
      return res.json({ ok: true });
    }
    res.json({ ok: false, error: "존재하지 않는 유저입니다." });
  } catch (error) {
    res.json({ ok: false, error });
  }
}

export default withSession(withHandler({ handler, methods: ["POST"] }));
