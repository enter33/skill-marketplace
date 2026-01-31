"use client";

import { useState, useEffect } from "react";
import { Search, Shield, User, Ban, CheckCircle, Trash2, Edit3 } from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  skillCount: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("page", page.toString());

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();

      if (res.ok) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.error || "操作失败");
      }
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      if (res.ok) {
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.error || "操作失败");
      }
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const deleteUser = async (user: User) => {
    const skillCount = user.skillCount || 0;
    const warningMessage = skillCount > 0
      ? `⚠️ 警告：此用户上传了 ${skillCount} 个 Skill，删除用户将同时删除这些 Skill！`
      : '';

    if (!confirm(`确定要删除用户 "${user.username}" 吗？\n\n${warningMessage}\n\n此操作不可恢复。`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message || "删除成功");
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.error || "删除失败");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("删除失败，请重试");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">用户管理</h2>
        <p className="mt-1 text-gray-600">管理系统中的所有用户账号</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="搜索用户名或邮箱..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">没有找到匹配的用户</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用户
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    角色
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skills
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    注册时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-violet-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <Shield className="h-3 w-3 mr-1" />
                        ) : (
                          <User className="h-3 w-3 mr-1" />
                        )}
                        {user.role === "admin" ? "管理员" : "普通用户"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "正常" : "已禁用"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.skillCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() =>
                            updateUserRole(
                              user.id,
                              user.role === "admin" ? "user" : "admin"
                            )
                          }
                          className="text-violet-600 hover:text-violet-900 p-1"
                          title={user.role === "admin" ? "降级为普通用户" : "设为管理员"}
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id, !user.isActive)}
                          className={`p-1 ${
                            user.isActive
                              ? "text-red-600 hover:text-red-900"
                              : "text-green-600 hover:text-green-900"
                          }`}
                          title={user.isActive ? "禁用账号" : "启用账号"}
                        >
                          {user.isActive ? (
                            <Ban className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteUser(user)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="删除用户"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                上一页
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
