import withHandler from "@libs/server/withHandler";
import withSession from "@libs/server/withSession";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    req.session.destroy();
    return res.json({ ok: true });
  } catch (error) {
    res.json({ ok: false, error });
  }
}

export default withSession(
  withHandler({ handler, methods: ["POST"], isPrivate: false })
);
