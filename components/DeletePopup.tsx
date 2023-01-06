interface IDeletePopup {
  text: string;
  onDeleteFn: () => void;
  onCloseFn: () => void;
}

export default ({ text, onDeleteFn, onCloseFn }: IDeletePopup) => {
  return (
    <div className="fixed inset-0 bg-gray-300/50 flex items-center justify-center">
      <div className="w-96 h-52 bg-white rounded-2xl py-6 flex flex-col justify-between">
        <svg
          className="w-20 h-20 self-center ring-8 rounded-full ring-red-500/75 bg-white -translate-y-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          ></path>
        </svg>
        <p className="self-center -translate-y-2">{text}</p>
        <div className="grid grid-cols-2 gap-4 px-6">
          <button
            onClick={onDeleteFn}
            className="font-bold hover:bg-red-500 hover:text-white transition py-2 rounded-lg"
          >
            삭제
          </button>
          <button
            onClick={onCloseFn}
            className="font-bold hover:bg-gray-400 hover:text-white transition py-2 rounded-lg"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};
