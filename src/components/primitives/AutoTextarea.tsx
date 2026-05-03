import * as React from "react";
import { cn } from "@/lib/utils";

export interface AutoTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
}

export const AutoTextarea = React.forwardRef<HTMLTextAreaElement, AutoTextareaProps>(
  ({ className, minRows = 2, onInput, value, ...props }, forwardedRef) => {
    const ref = React.useRef<HTMLTextAreaElement | null>(null);

    React.useImperativeHandle<HTMLTextAreaElement | null, HTMLTextAreaElement | null>(
      forwardedRef,
      () => ref.current,
    );

    const resize = React.useCallback(() => {
      const el = ref.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }, []);

    React.useLayoutEffect(resize, [value, resize]);

    return (
      <textarea
        ref={ref}
        rows={minRows}
        value={value}
        onInput={(event) => {
          resize();
          onInput?.(event);
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
