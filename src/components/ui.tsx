"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { HTMLAttributes, ReactNode } from "react";

const VIDEO_BACKGROUND =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260806_133255_956f653f-5d80-4b06-abd5-0f46c98b60fa.mp4";

export function PeakBackground() {
  return (
    <div className="peak-background" aria-hidden="true">
      <video autoPlay muted loop playsInline preload="metadata">
        <source src={VIDEO_BACKGROUND} type="video/mp4" />
      </video>
    </div>
  );
}

export function Nav() {
  const pathname = usePathname();
  const onApp = pathname === "/app";
  return (
    <header className="relative z-20 mx-auto flex h-[76px] w-full max-w-[1180px] items-center justify-between px-5 sm:px-8">
      <Link href="/" className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-[#11121b] shadow-sm">
          <Image src="/logo.png" alt="Peak" width={22} height={22} />
        </span>
        <span className="text-[16px] font-semibold tracking-[-0.02em]">Peak</span>
      </Link>
      <div className="flex items-center gap-3">
        <span className="hidden text-xs font-medium text-dim sm:inline">
          Personal content intelligence
        </span>
        <Link
          href={onApp ? "/" : "/app"}
          className="rounded-full bg-[#171827] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-[#25263a]"
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
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div {...props} className={`glass-card rounded-[22px] ${className}`}>
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
    hit: "bg-emerald-50/90 text-hit border-emerald-200/70",
    miss: "bg-rose-50/90 text-miss border-rose-200/70",
    peak: "bg-indigo-50/90 text-[#4e53d9] border-indigo-200/70",
    default: "bg-white/65 text-dim border-white/80",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
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
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40";
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-[#171827] text-white shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 hover:bg-[#25263a]",
    secondary: "border border-white/90 bg-white/72 text-[#27283a] shadow-sm hover:-translate-y-0.5 hover:bg-white",
    ghost: "text-dim hover:bg-white/55 hover:text-ink",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function Spinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-dim">{children}</div>;
}

export function ErrorNote({ message }: { message: string }) {
  if (!message) return null;
  return <div className="rounded-2xl border border-rose-200/75 bg-rose-50/85 px-4 py-3 text-sm text-miss shadow-sm">{message}</div>;
}
