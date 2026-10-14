import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "记账本",
  description: "个人记账系统",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="border-b border-gray-400">
          <nav className="mx-auto flex max-w-2xl gap-4 p-4 text-sm">
            <Link href="/" className="font-semibold">
              记账本
            </Link>
            <Link href="/transactions/new" className="hover:underline">
              记一笔
            </Link>
            <Link href="/categories" className="hover:underline">
              分类
            </Link>
            <Link href="/accounts" className="hover:underline">
              账户
            </Link>
          </nav>
        </header>
        {/* 用 div 不用 main：页面自己已经渲染了一个 main，嵌套 main 是非法 HTML */}
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
