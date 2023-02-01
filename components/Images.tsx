import { cls, getImageGrid } from "@libs/client/utils";
import { useState } from "react";

interface IImages {
  urls: {
    url: string;
  }[];
}

export default ({ urls }: IImages) => {
  const [image, setImage] = useState("");

  const onOpenImagePopup = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    setImage(url);
  };

  const onCloseImagePopup = () => {
    setImage("");
  };
  return (
    <>
      <ul className={cls("my-6 rounded-xl", getImageGrid(urls.length))}>
        {urls.map(({ url }, i) => (
          <li
            key={`image_${url}_${i}`}
            className="flex items-center justify-center rounded-xl overflow-hidden hover:ring ring-offset-4 transition-shadow"
          >
            <img
              src={url}
              className="w-full"
              onClick={(e) => onOpenImagePopup(e, url)}
            />
          </li>
        ))}
      </ul>
      {image && (
        <div
          className="fixed inset-0 bg-gray-300/50 flex items-center justify-center"
          onClick={onCloseImagePopup}
        >
          <img src={image} className="max-h-full max-w-4xl bg-white" />
        </div>
      )}
    </>
  );
};
