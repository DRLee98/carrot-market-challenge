import withHandler from "@libs/server/withHandler";
import withSession from "@libs/server/withSession";
import db from "@libs/server/db";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email, password } = req.body;
    const findUser = await db.user.findUnique({ where: { email } });
    if (findUser) {
      const passwordCompare = bcrypt.compareSync(password, findUser.password);
      if (!passwordCompare) {
        return res.json({ ok: false, error: "비밀번호가 일치하지 않습니다." });
      }
      req.session.user = findUser;
      await req.session.save();
      return res.json({ ok: true, user: findUser });
    }
    res.json({ ok: false, error: "존재하지 않는 유저입니다." });
  } catch (error) {
    res.json({ ok: false, error });
  }
}

export default withSession(
  withHandler({ handler, methods: ["POST"], isPrivate: false })
);
