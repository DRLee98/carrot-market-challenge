import withHandler from "@libs/server/withHandler";
import withSession from "@libs/server/withSession";
import db from "@libs/server/db";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { user } = req.session;
    const findUser = await db.user.findUnique({ where: { id: user.id } });
    if (findUser) res.json({ ok: true, user: findUser });
    res.json({ ok: false, error: "Plz log in." });
  } catch (error) {
    res.json({ ok: false, error });
  }
}

export default withSession(withHandler({ handler, methods: ["GET"] }));
