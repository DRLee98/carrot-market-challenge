import Button from "@components/Button";
import Input from "@components/Input";
import TitleBox from "@components/TitleBox";
import useMe from "@libs/client/useMe";
import useMutation from "@libs/client/useMutation";
import { User } from "@prisma/client";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface IForm extends Pick<User, "password"> {
  newPassword: string;
  error?: string;
}

interface ChangePasswordResponse {
  ok: boolean;
  error?: string;
}

export default () => {
  const router = useRouter();
  const { user } = useMe();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<IForm>({
    mode: "onChange",
  });
  const [changePassword, { data, loading }] = useMutation<
    IForm,
    ChangePasswordResponse
  >("/api/user/change-password");

  const onValid = (formData: IForm) => {
    if (loading) return;
    changePassword(formData);
  };

  useEffect(() => {
    if (data?.ok && user) {
      router.push(`/user/${user.id}`);
    }
    if (data?.error) {
      setValue("error", data.error);
    }
  }, [data]);

  useEffect(() => {
    setValue("error", undefined);
  }, [watch("password"), watch("newPassword")]);

  return (
    <div>
      <TitleBox title="비밀번호 변경" back />
      <form
        onSubmit={handleSubmit(onValid)}
        className="px-6 flex flex-col gap-4"
      >
        <Input
          type="password"
          label="현재 비밀번호"
          error={errors.password?.message}
          {...register("password", {
            required: "현재 비밀번호는 필수입니다.",
            minLength: {
              value: 6,
              message: "비밀번호는 6자 이상으로 입력해 주시기 바랍니다.",
            },
          })}
        />
        <Input
          type="password"
          label="새 비밀번호"
          error={errors.newPassword?.message}
          {...register("newPassword", {
            required: "새 비밀번호는 필수입니다.",
            minLength: {
              value: 6,
              message: "비밀번호는 6자 이상으로 입력해 주시기 바랍니다.",
            },
          })}
        />
        {watch("error") && (
          <span className="text-red-600 font-bold">{watch("error")}</span>
        )}
        <Button
          text="비밀번호 변경하기"
          disabled={!isValid}
          loading={loading}
        />
      </form>
    </div>
  );
};
