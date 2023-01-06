import { User } from "@prisma/client";
import { useRouter } from "next/router";
import { useEffect } from "react";
import useSWR from "swr";
import { publicPath } from "./constants";

interface IResponse {
  ok: boolean;
  user: User;
}

export default function (replace: boolean = true) {
  const router = useRouter();
  const { data, error } = useSWR<IResponse>("/api/user/me");

  useEffect(() => {
    if (data && !data.ok && replace) router.replace("/log-in");
    if (data && data.ok && publicPath.includes(router.route))
      router.replace("/");
  }, [data, router]);

  return { user: data?.user, error, loading: !data && !error };
}
