import * as React from "react";
import { cn } from "@/lib/utils";

export interface AutoTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
}

export const AutoTextarea = React.forwardRef<HTMLTextAreaElement, AutoTextareaProps>(
  ({ className, minRows = 3, onInput, value, ...props }, ref) => {
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

    React.useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

    const resize = React.useCallback(() => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }, []);

    React.useEffect(() => {
      resize();
    }, [value, resize]);

    return (
      <textarea
        ref={innerRef}
        rows={minRows}
        value={value}
        onInput={(e) => {
          resize();
          onInput?.(e);
        }}
        className={cn(
          "flex w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed",
          "ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
AutoTextarea.displayName = "AutoTextarea";
