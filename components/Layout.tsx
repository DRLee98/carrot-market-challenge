import { publicPath } from "@libs/client/constants";
import useMe from "@libs/client/useMe";
import useMutation from "@libs/client/useMutation";
import { cls } from "@libs/client/utils";
import { Tweet } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { TweetsResponse } from "pages";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSWRConfig } from "swr";
import Avatar from "./Avatar";
import Button from "./Button";
import Textarea from "./Textarea";
import { TweetWithAuthorAndCount } from "./Tweet";

interface ILayout {
  children: React.ReactNode;
}

interface LogOutResponse {
  ok: boolean;
}

interface Image {
  key: string;
  url: string;
}

interface IForm extends Pick<Tweet, "content"> {
  url: string;
}

export interface TweetWithFiles extends Tweet {
  files: {
    url: string;
  }[];
}

interface TweetSendData extends Pick<Tweet, "content"> {
  urls: string[];
}

interface TweetResponse {
  ok: boolean;
  tweet: Omit<TweetWithFiles, "_count">;
}

export default ({ children }: ILayout) => {
  const router = useRouter();
  const { user } = useMe(!publicPath.includes(router.route));

  const navItemStyle = (path?: string) =>
    cls(
      "w-12 h-12 flex items-center justify-center cursor-pointer rounded-lg transition bg-gray-50",
      router.route === path ? "" : "group-hover:bg-gray-200"
    );
  const navItemIconStyle = (path?: string) =>
    cls("w-8 h-8 transition", router.route === path ? "stroke-sky-300" : "");

  // 트윗 작성 관련 코드 시작
  const [openForm, setOpenForm] = useState(false);
  const [imageKeys, setImageKeys] = useState<Image[]>([]);

  const { mutate } = useSWRConfig();
  const [tweet, { data, loading, reset }] = useMutation<
    TweetSendData,
    TweetResponse
  >("/api/tweet");
  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
    watch,
    setValue,
    getValues,
    reset: formReset,
  } = useForm<IForm>({ mode: "onChange" });

  const openFormFn = () => setOpenForm(true);
  const closeFormFn = () => setOpenForm(false);

  const addImageKey = (url: string) => {
    const key = new Date().getTime().toString();
    setImageKeys((prev) => (prev.length < 4 ? [...prev, { key, url }] : prev));
    setValue("url", "");
  };
  const removeImageKey = (target: string) =>
    setImageKeys((prev) => prev.filter(({ key }) => key !== target));

  const onValid = (formData: IForm) => {
    if (loading) return;
    const urls = imageKeys.map(({ url }) => url);
    tweet({ ...formData, urls });
  };

  useEffect(() => {
    if (user && data?.ok) {
      const newTweet: TweetWithAuthorAndCount = {
        ...data.tweet,
        author: user,
        isLiked: false,
        _count: {
          likes: 0,
          comments: 0,
        },
      };
      mutate<TweetsResponse>(
        "/api/tweet/all",
        (prev) =>
          prev
            ? { ok: true, tweets: [newTweet, ...prev.tweets] }
            : { ok: true, tweets: [newTweet] },
        false
      );
      reset();
      formReset();
      closeFormFn();
      setImageKeys([]);
    }
  }, [data]);
  // 트윗 작성 관련 코드 끝

  // 로그아웃 관련 시작
  const [logOut, { data: logOutData }] = useMutation<{}, LogOutResponse>(
    "/api/user/log-out"
  );

  useEffect(() => {
    if (logOutData?.ok) {
      router.reload();
    }
  }, [logOutData, router]);
  // 로그아웃 관련 코드 끝

  return (
    <div className="h-screen flex justify-center">
      {user && (
        <>
          <nav className="h-full w-20 bg-gray-50 flex flex-col justify-between lg:w-52 transition-all">
            <div className="w-12 mx-auto px-0 lg:mx-0 lg:px-8 lg:w-full mt-4 flex flex-col gap-4">
              <Link href={`/user/${user.id}`}>
                <a className="rounded-full ring-sky-200 ring-0 ring-offset-4 hover:ring transition-all flex items-center gap-4 overflow-hidden">
                  <Avatar image={user.avatar} name={user.name} />
                  <span className="font-bold lg:inline whitespace-nowrap">
                    내 프로필
                  </span>
                </a>
              </Link>
              <Link href="/">
                <a className="group flex items-center overflow-hidden">
                  <div className={navItemStyle("/")}>
                    <svg
                      className={navItemIconStyle("/")}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      ></path>
                    </svg>
                  </div>
                  <span
                    className={cls(
                      "font-bold whitespace-nowrap lg:pl-4 pl-0 hidden lg:inline",
                      router.route === "/" ? "text-sky-300" : ""
                    )}
                  >
                    홈
                  </span>
                </a>
              </Link>
              <button
                onClick={openFormFn}
                className="group flex items-center overflow-hidden"
              >
                <div className="w-12 h-12 flex items-center justify-center cursor-pointer rounded-lg transition bg-gray-300 group-hover:bg-sky-400 duration-300">
                  <svg
                    className="w-8 h-8 stroke-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    ></path>
                  </svg>
                </div>
                <span className="font-bold whitespace-nowrap lg:pl-4 pl-0 hidden lg:inline group-hover:text-sky-400 transition duration-300">
                  트윗
                </span>
              </button>
            </div>
            <div className="lg:w-full w-12 mx-auto lg:mx-0 mb-4 px-0 lg:px-8">
              <button
                onClick={() => logOut({})}
                className={cls(
                  navItemStyle(),
                  "lg:w-full lg:justify-start lg:pl-2 hover:bg-gray-200"
                )}
              >
                <svg
                  className={navItemIconStyle()}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  ></path>
                </svg>
                <span className="font-bold whitespace-nowrap lg:pl-4 pl-0 hidden lg:inline">
                  로그아웃
                </span>
              </button>
            </div>
          </nav>
          {openForm && (
            <div className="fixed w-screen h-screen bg-gray-300/50 flex items-center justify-center">
              <div className=" w-full max-w-xl h-96 flex flex-col bg-white rounded-2xl p-8">
                <button
                  onClick={closeFormFn}
                  className="p-1 flex items-center justify-center rounded-full hover:bg-gray-100 border-white transition self-end"
                >
                  <svg
                    className="w-8 h-8 hover:stroke-red-500 transition"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </button>
                <div className="flex gap-4 h-full">
                  <Avatar image={user.avatar} name={user.name} />
                  <div className="flex flex-col w-full h-full">
                    <span className="capitalize font-bold">{user.name}</span>
                    <form
                      onSubmit={handleSubmit(onValid)}
                      className="mt-4 h-full flex flex-col gap-6 justify-between"
                    >
                      <div className="h-full flex flex-col">
                        <Textarea
                          placeholder="무슨 일이야?"
                          {...register("content")}
                        />
                        <div
                          className={cls(
                            "overflow-y-scroll relative transition-all",
                            imageKeys.length > 0 ? "h-full mt-2" : "h-0 mt-0"
                          )}
                        >
                          <ul className="flex absolute inset-y-0 gap-4">
                            {imageKeys.map(({ key, url }) => (
                              <li
                                key={`image_key_${key}`}
                                className="relative h-full aspect-square flex items-center"
                              >
                                <span
                                  onClick={() => removeImageKey(key)}
                                  className="absolute right-1 top-1 cursor-pointer hover:bg-white hover:ring hover:ring-red-600 rounded-full transition"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M6 18L18 6M6 6l12 12"
                                    ></path>
                                  </svg>
                                </span>
                                <img src={url} className="m-auto" />
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <div className="w-full col-span-2 flex border rounded-lg">
                          <span className="inline-block p-2 rounded-lg">
                            <svg
                              className={cls(
                                "w-8 h-8 transition",
                                watch("url") &&
                                  !Boolean(errors.url) &&
                                  imageKeys.length < 4
                                  ? "stroke-sky-300"
                                  : "stroke-gray-400"
                              )}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              ></path>
                            </svg>
                          </span>
                          <input
                            className="w-full focus:outline-none"
                            placeholder={
                              imageKeys.length < 4
                                ? "이미지 URL"
                                : "4장까지 가능합니다."
                            }
                            disabled={imageKeys.length >= 4}
                            {...register("url", {
                              pattern: {
                                value:
                                  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#()?&//=]*)/,
                                message: "URL 형태의 주소만 가능합니다.",
                              },
                            })}
                          />
                          <div
                            onClick={() => addImageKey(getValues("url"))}
                            className={cls(
                              "flex items-center justify-center transition w-1/3 rounded-r-md",
                              watch("url") &&
                                !Boolean(errors.url) &&
                                imageKeys.length < 4
                                ? "bg-sky-300 hover:bg-sky-500 cursor-pointer"
                                : "bg-gray-400 cursor-not-allowed"
                            )}
                          >
                            <svg
                              className="w-4 h-4 stroke-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <Button
                          text="작성하기"
                          disabled={!isValid}
                          loading={loading}
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <main className="h-full w-full max-w-xl bg-white border-x overflow-y-scroll overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};
