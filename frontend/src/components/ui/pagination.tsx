import type { AnchorHTMLAttributes, HTMLAttributes } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function Pagination({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <nav role="navigation" aria-label="pagination" className={cn("mx-auto flex w-full justify-center", className)} {...props} />;
}

export function PaginationContent({ className, ...props }: HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("flex flex-row items-center gap-1", className)} {...props} />;
}

export function PaginationItem({ className, ...props }: HTMLAttributes<HTMLLIElement>) {
  return <li className={className} {...props} />;
}

type PaginationLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { isActive?: boolean };

export function PaginationLink({ className, isActive, ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors",
        isActive ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100",
        className
      )}
      {...props}
    />
  );
}

export function PaginationPrevious({ className, ...props }: PaginationLinkProps) {
  return (
    <PaginationLink aria-label="Go to previous page" className={cn("gap-1 pl-2.5", className)} {...props}>
      <ChevronLeft className="size-4" aria-hidden="true" />
      <span>Previous</span>
    </PaginationLink>
  );
}

export function PaginationNext({ className, ...props }: PaginationLinkProps) {
  return (
    <PaginationLink aria-label="Go to next page" className={cn("gap-1 pr-2.5", className)} {...props}>
      <span>Next</span>
      <ChevronRight className="size-4" aria-hidden="true" />
    </PaginationLink>
  );
}

export function PaginationEllipsis({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span aria-hidden="true" className={cn("flex size-9 items-center justify-center", className)} {...props}>
      <MoreHorizontal className="size-4" />
    </span>
  );
}