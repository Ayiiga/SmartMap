import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  gradient?: boolean;
}

export function Card({ className, hover, gradient, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-giga-border bg-white p-6 shadow-sm dark:bg-giga-surface dark:border-giga-border-dark",
        hover && "transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer",
        gradient && "bg-gradient-to-br from-white to-giga-purple/5 dark:from-giga-surface dark:to-giga-purple/10",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-xl font-bold text-giga-text dark:text-white", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-giga-muted text-sm mt-1", className)} {...props}>
      {children}
    </p>
  );
}
