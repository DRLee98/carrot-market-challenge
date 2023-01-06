import { cls } from "@libs/client/utils";

interface IAvatar {
  id: number;
  size?: "md" | "lg" | "xl";
  image: string | null;
  name: string;
}

export default ({ id, size = "md", image, name }: IAvatar) => {
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

  const getAvatarBgColor = (id: number) => {
    const colors = [
      "red",
      "orange",
      "amber",
      "yellow",
      "lime",
      "green",
      "emerald",
      "teal",
      "cyan",
      "sky",
      "blue",
      "indigo",
      "stone",
      "violet",
      "netural",
      "purple",
      "zinc",
      "fuchsia",
      "gray",
      "pink",
      "slate",
      "rose",
    ];
    const colorValue = [50, 900, 200, 700, 100, 600, 500, 300, 800, 400];
    const fromColor = `from-${colors[(id % colors.length) - 1]}-${
      colorValue[(id % colorValue.length) - 1]
    }`;
    const toColor = `to-${colors[colors.length - (id % colors.length)]}-${
      colorValue[colorValue.length - (id % colorValue.length)]
    }`;
    return `${fromColor} ${toColor}`;
  };

  return image ? (
    <img className={getDefaultStyle()} src={image} />
  ) : (
    <div
      className={cls(
        "flex items-center justify-center bg-gradient-to-b text-white text-center font-bold",
        getAvatarBgColor(id),
        getDefaultStyle()
      )}
    >
      {getFirstLatter()}
    </div>
  );
};
