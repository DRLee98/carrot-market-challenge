import { cls } from "@libs/client/utils";

interface IAvatar {
  size?: "md" | "lg" | "xl";
  image: string | null;
  name: string;
}

export default ({ size = "md", image, name }: IAvatar) => {
  const getFirstLatter = () =>
    name.length > 0 ? name.slice(0, 1).toUpperCase() : "";
  const getDefaultStyle = () => {
    switch (size) {
      case "lg":
        return "w-16 h-16 min-w-[4rem] rounded-full text-2xl";
      case "xl":
        return "w-24 h-24 min-w-[6rem] rounded-full text-4xl";
      default:
        return "w-12 h-12 min-w-[3rem] rounded-full text-2xl";
    }
  };

  return image ? (
    <img className={getDefaultStyle()} src={image} />
  ) : (
    <div
      className={cls(
        "flex items-center justify-center bg-gradient-to-b from-purple-500 to-pink-500 text-white text-center font-bold",
        getDefaultStyle()
      )}
    >
      {getFirstLatter()}
    </div>
  );
};
