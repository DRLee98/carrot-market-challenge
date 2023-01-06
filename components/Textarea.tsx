import { cls } from "@libs/client/utils";
import { forwardRef } from "react";

interface ITextarea extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default forwardRef<HTMLTextAreaElement, ITextarea>(
  ({ label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 h-full">
        <textarea
          className={cls(
            "w-full h-full focus:outline-none p-2 rounded resize-none",
            error ? "border-red-700" : ""
          )}
          {...props}
          ref={ref}
        />
        {error && <span className="text-red-600 font-bold">{error}</span>}
      </div>
    );
  }
);
