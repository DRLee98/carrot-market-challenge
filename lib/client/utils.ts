export function cls(...classnames: string[]) {
  return classnames.join(" ");
}

export const getImageGrid = (length: number) =>
  "grid gap-2 " +
  (Math.ceil(length / 2) === 1 ? "grid-row-1 " : "grid-row-2 ") +
  (length % 2 === 1 ? "grid-cols-1" : "grid-cols-2");

export const setTimestampFn = (targetDate: Date) => {
  const targetTime = new Date(targetDate).getTime();
  const nowTime = new Date().getTime();
  const diff = nowTime - targetTime;
  if (diff <= 1000 * 60) {
    return "지금";
  }
  if (diff <= 1000 * 60 * 60) {
    return `${Math.round(diff / (1000 * 60))}분전`;
  }
  if (diff <= 1000 * 60 * 60 * 24) {
    return `${Math.round(diff / (1000 * 60 * 60))}시간전`;
  }
  if (diff <= 1000 * 60 * 60 * 24 * 7) {
    return `${Math.round(diff / (1000 * 60 * 60 * 24))}일전`;
  }
  const { date } = getDateTime(targetTime * 1000);
  return formatDate(date);
};

export const getDateTime = (timeNumber: number) => {
  const offset = new Date().getTimezoneOffset() * 60000;
  const newDate = new Date(timeNumber - offset).toISOString();
  const splitDate = newDate.split("T");
  const date = splitDate[0];
  const time = splitDate[1].slice(0, 5);
  return { date, time };
};

export const formatDate = (target: string) => {
  const splitDate = target.split("-");
  return `${splitDate[1]}월 ${splitDate[2]}일`;
};

export const getDateText = (target: Date) => {
  const timeNumber = new Date(target).getTime();
  const offset = new Date().getTimezoneOffset() * 60000;
  const newDate = new Date(timeNumber - offset).toISOString();
  const [date, time] = newDate.split("T");
  const [year, month, day] = date.split("-");
  const [hour, minute] = time.slice(0, 8).split(":");
  return `${year}년 ${month}월 ${day}일 · ${+hour > 12 ? "오후" : "오전"} ${
    +hour % 12
  }시 ${minute}분`;
};
