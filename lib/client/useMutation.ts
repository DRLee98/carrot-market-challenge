import { useState } from "react";

interface UseMutationState<ReturnData> {
  loading: boolean;
  error?: object;
  data?: ReturnData;
  reset: () => void;
}

type UseMutationResult<SendData, ReturnData> = [
  (data: SendData) => void,
  UseMutationState<ReturnData>
];

export default function <SendData, ReturnData>(
  url: string | null,
  method: "POST" | "DELETE" = "POST"
): UseMutationResult<SendData, ReturnData> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [data, setData] = useState<ReturnData>();
  const fn = (data: SendData) => {
    if (!url) return;
    setLoading(true);
    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  };
  const reset = () => {
    setLoading(false);
    setError(undefined);
    setData(undefined);
  };
  return [fn, { loading, error, data, reset }];
}
