import Button from "@components/Button";
import Input from "@components/Input";
import useMutation from "@libs/client/useMutation";
import { User } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSWRConfig } from "swr";

interface IFrom extends Pick<User, "email" | "password"> {
  error?: string;
}

interface LogInResponse {
  ok: boolean;
  user: User;
  error: string;
}

export default () => {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<IFrom>({ mode: "onChange" });

  const [logIn, { data, loading }] = useMutation<IFrom, LogInResponse>(
    "/api/user/log-in"
  );

  const onValid = (formData: IFrom) => {
    if (loading || data) return;
    logIn(formData);
  };

  useEffect(() => {
    setValue("error", undefined);
  }, [watch("email"), watch("password")]);

  useEffect(() => {
    if (data?.ok && data.user) {
      router.push("/");
      mutate("/api/user/me", data.user);
    }
    if (data?.error) {
      setValue("error", data.error);
    }
  }, [data]);

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <form
        onSubmit={handleSubmit(onValid)}
        className="w-full flex flex-col gap-6 p-8"
      >
        <Input
          {...register("email", {
            required: "이메일은 필수입니다.",
            pattern: {
              value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
              message: "이메일 형식에 맞지 않는 메일 주소입니다.",
            },
          })}
          label="이메일"
          error={errors.email?.message}
          required
        />
        <Input
          {...register("password", {
            required: "비밀번호는 필수입니다.",
            minLength: {
              value: 6,
              message: "비밀번호는 6자 이상으로 입력해 주시기 바랍니다.",
            },
          })}
          label="비밀번호"
          error={errors.password?.message}
          type="password"
          required
        />
        {watch("error") && (
          <span className="text-red-600 font-bold">{watch("error")}</span>
        )}
        <Button text="로그인" loading={loading} disabled={!isValid} />
      </form>
      <div>
        <span className="text-gray-400 mr-2">아직 회원이 아니신가요?</span>
        <Link href="/create-account">
          <a className="text-sky-500 hover:text-sky-700 underline transition">
            회원가입
          </a>
        </Link>
      </div>
    </div>
  );
};
