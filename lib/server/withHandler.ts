import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

type TMethod = "GET" | "POST" | "DELETE";

interface IConfig {
  methods: TMethod[];
  handler: NextApiHandler;
  isPrivate?: boolean;
}

export default function ({ methods, handler, isPrivate = true }: IConfig) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    try {
      if (!methods.includes(req.method as TMethod)) {
        return res.status(405).end();
      }
      if (isPrivate && !req.session.user) {
        return res.status(401).json({ ok: false, error: "Plz log in." });
      }
      return await handler(req, res);
    } catch (error) {
      return res.status(500).json({ error });
    }
  };
}
