import withHandler from "@libs/server/withHandler";
import db from "@libs/server/db";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, email, password } = req.body;
    const findUser = await db.user.findUnique({ where: { email } });
    if (findUser)
      res.json({ ok: false, error: "이미 사용 중인 이메일 입니다" });
    await db.user.create({
      data: { name, email, password: bcrypt.hashSync(password, 10) },
    });
    res.json({ ok: true });
  } catch (error) {
    res.json({ ok: false, error });
  }
}

export default withHandler({ handler, methods: ["POST"], isPrivate: false });
