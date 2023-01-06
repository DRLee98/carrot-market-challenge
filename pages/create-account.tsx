import Button from "@components/Button";
import Input from "@components/Input";
import useMutation from "@libs/client/useMutation";
import { cls } from "@libs/client/utils";
import { User } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface IFrom extends Pick<User, "name" | "email" | "password"> {
  error?: string;
}

interface CreateAccountResponse {
  ok: boolean;
  error: string;
}

export default () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<IFrom>({ mode: "onChange" });

  const [createAccount, { data, loading }] = useMutation<
    IFrom,
    CreateAccountResponse
  >("/api/user/create-account");

  const onValid = (formData: IFrom) => {
    if (loading || data) return;
    createAccount(formData);
  };

  useEffect(() => {
    setValue("error", undefined);
  }, [watch("name"), watch("email"), watch("password")]);

  useEffect(() => {
    if (data?.ok) {
      router.push("/log-in");
    }
    if (data?.error) {
      setValue("error", data.error);
    }
  }, [data]);

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <form
        onSubmit={handleSubmit(onValid)}
        className={cls("w-full flex flex-col gap-6 p-8")}
      >
        <Input
          {...register("name", { required: "이름은 필수입니다." })}
          label="이름"
          error={errors.name?.message}
          required
        />
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
        <Button text="회원가입" loading={loading} disabled={!isValid} />
      </form>
      <div>
        <span className="text-gray-400 mr-2">이미 회원가입을 하셨나요?</span>
        <Link href="/log-in">
          <a className="text-sky-500 hover:text-sky-700 underline transition">
            로그인
          </a>
        </Link>
      </div>
    </div>
  );
};
