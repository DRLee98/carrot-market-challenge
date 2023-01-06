import { useRouter } from "next/router";

interface ITitleBox {
  title: string;
  back?: boolean;
}

export default ({ title, back }: ITitleBox) => {
  const router = useRouter();

  const onBackClick = () => {
    router.back();
  };
  return (
    <div className="flex gap-6 sticky top-0 py-4 pl-6 w-full bg-white/95">
      {back && (
        <button onClick={onBackClick}>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
        </button>
      )}
      <h1 className="font-bold text-xl">{title}</h1>
    </div>
  );
};
