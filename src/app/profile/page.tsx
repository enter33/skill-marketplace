"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Package,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    skills: number;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // 密码修改表单状态
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
      } else {
        console.error("Failed to fetch profile:", data.error);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // 验证
    if (newPassword.length < 6) {
      setPasswordError("新密码至少需要6位字符");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("两次输入的新密码不一致");
      return;
    }

    setUpdatingPassword(true);

    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordSuccess("密码修改成功！");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(data.error || "密码修改失败");
      }
    } catch (error) {
      setPasswordError("网络错误，请重试");
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载失败，请刷新页面重试</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* 返回按钮 */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-violet-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回首页
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">个人信息</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 用户信息卡片 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <User className="h-5 w-5 mr-2 text-violet-600" />
              基本信息
            </h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-violet-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">用户名</p>
                  <p className="text-base font-medium text-gray-900">
                    {user.username}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">邮箱</p>
                  <p className="text-base font-medium text-gray-900">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">角色</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.role === "admin" ? "管理员" : "普通用户"}
                  </span>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">上传 Skills</p>
                  <p className="text-base font-medium text-gray-900">
                    {user._count.skills} 个
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">注册时间</p>
                  <p className="text-base font-medium text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 修改密码卡片 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Lock className="h-5 w-5 mr-2 text-violet-600" />
              修改密码
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {passwordSuccess}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  当前密码
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 pr-10"
                    placeholder="请输入当前密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  新密码
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 pr-10"
                    placeholder="至少6位字符"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  确认新密码
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                  placeholder="再次输入新密码"
                />
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingPassword ? "修改中..." : "修改密码"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
