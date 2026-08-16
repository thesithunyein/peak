"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function Nav() {
  const pathname = usePathname();
  const onApp = pathname === "/app";
  return (
    <header className="sticky top-0 z-20 border-b border-edge bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Peak"
            width={26}
            height={26}
            className="rounded-md"
          />
          <span className="text-[15px] font-semibold tracking-tight">Peak</span>
        </Link>
        <Link
          href={onApp ? "/" : "/app"}
          className="rounded-lg border border-edge px-3 py-1.5 text-sm text-dim transition-colors hover:text-ink"
        >
          {onApp ? "Home" : "Open Peak"}
        </Link>
      </div>
    </header>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-edge bg-panel ${className}`}>
      {children}
    </div>
  );
}

type BadgeTone = "hit" | "miss" | "peak" | "default";

export function Badge({
  tone = "default",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  const tones: Record<BadgeTone, string> = {
    hit: "bg-hit/10 text-hit border-hit/25",
    miss: "bg-miss/10 text-miss border-miss/25",
    peak: "bg-peak/10 text-peak border-peak/25",
    default: "bg-white/5 text-dim border-edge",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  className?: string;
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-peak text-black hover:bg-peak/90",
    secondary: "border border-edge bg-panel2 text-ink hover:bg-panel",
    ghost: "text-dim hover:text-ink",
    danger: "bg-miss text-black hover:bg-miss/90",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-xs font-semibold uppercase tracking-widest text-dim">
      {children}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-miss/25 bg-miss/10 px-3 py-2 text-sm text-miss">
      {message}
    </div>
  );
}
