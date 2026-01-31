"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Shield } from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();

  // 检查是否为管理员
  const isAdmin = session?.user?.role === "admin";

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Skill Market</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
            ) : session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-violet-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  我的 Skills
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center text-violet-600 hover:text-violet-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    管理后台
                  </Link>
                )}
                <div className="flex items-center space-x-3">
                  <Link
                    href="/profile"
                    className="text-sm text-gray-600 hover:text-violet-600 transition-colors"
                  >
                    {session.user?.name}
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
                  >
                    退出
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-violet-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  登录
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}