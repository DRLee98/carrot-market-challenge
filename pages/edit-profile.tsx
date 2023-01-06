import Avatar from "@components/Avatar";
import Button from "@components/Button";
import Input from "@components/Input";
import Textarea from "@components/Textarea";
import TitleBox from "@components/TitleBox";
import useMe from "@libs/client/useMe";
import useMutation from "@libs/client/useMutation";
import { User } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSWRConfig } from "swr";

interface IForm extends Pick<User, "name" | "avatar" | "bio"> {}

interface EditProfileResponse {
  ok: boolean;
}

export default () => {
  const router = useRouter();
  const { user } = useMe();
  const { mutate } = useSWRConfig();
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IForm>({
    mode: "onChange",
  });
  const [editProfile, { data, loading }] = useMutation<
    IForm,
    EditProfileResponse
  >("/api/user/edit");

  const onValid = (formData: IForm) => {
    if (loading) return;
    editProfile(formData);
    mutate(
      "/api/user/me",
      (prev: User) => (prev ? { ...prev, ...formData } : undefined),
      false
    );
  };

  useEffect(() => {
    if (user && data?.ok) {
      router.push(`/user/${user.id}`);
    }
  }, [data]);

  useEffect(() => {
    if (user) {
      setValue("name", user.name);
      setValue("avatar", user.avatar);
      setValue("bio", user.bio);
    }
  }, [user]);
  return (
    <div>
      <TitleBox title="프로필 수정" back />
      <form
        onSubmit={handleSubmit(onValid)}
        className="px-6 flex flex-col gap-4"
      >
        <div className="flex gap-6 items-center">
          <Avatar
            id={user?.id || 0}
            name={watch("name") || ""}
            image={!Boolean(errors.avatar) ? watch("avatar") : null}
            size="xl"
          />
          <div className="flex flex-col gap-2 w-full">
            <Input
              label="이름"
              error={errors.name?.message}
              {...register("name", { required: "이름은 필수입니다." })}
            />
            <Input
              placeholder="이미지 URL"
              label="프로필 사진"
              error={errors.avatar?.message}
              {...register("avatar", {
                required: false,
                pattern: {
                  value:
                    /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#()?&//=]*)/,
                  message: "URL 형태의 주소만 가능합니다.",
                },
              })}
            />
          </div>
        </div>
        <div>
          <label className="text-gray-600 font-light text-sm">
            상태 메시지
          </label>
          <div className="border p-2 rounded-xl">
            <Textarea {...register("bio", { required: false })} />
          </div>
        </div>
        <Button
          text="프로필 수정하기"
          disabled={Object.keys(errors).length !== 0}
          loading={loading}
        />
        <Link href={"/chage-password"}>
          <a className="underline text-center text-sky-500 hover:text-sky-700 transition text-sm">
            비밀번호 변경하기
          </a>
        </Link>
      </form>
    </div>
  );
};
