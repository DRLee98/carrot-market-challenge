import { NextApiHandler } from "next";
import type { IronSessionOptions } from "iron-session";
import { withIronSessionApiRoute } from "iron-session/next";

declare module "iron-session" {
  interface IronSessionData {
    user: {
      id: number;
    };
  }
}

const cookieOptions: IronSessionOptions = {
  cookieName: "nextChallenge",
  password: process.env.COOKIE_PASSWORD || "",
};

export default function (handler: NextApiHandler) {
  return withIronSessionApiRoute(handler, cookieOptions);
}
