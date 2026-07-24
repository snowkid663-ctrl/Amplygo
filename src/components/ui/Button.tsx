import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

interface CommonProps {
  variant?: Variant;
  small?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  small = false,
  className = "",
  children,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`btn btn-${variant} ${small ? "btn-sm" : ""} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  small = false,
  className = "",
  children,
}: CommonProps & { href: string }) {
  return (
    <Link href={href} className={`btn btn-${variant} ${small ? "btn-sm" : ""} ${className}`}>
      {children}
    </Link>
  );
}
