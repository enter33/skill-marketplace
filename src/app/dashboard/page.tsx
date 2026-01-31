"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Download, Trash2, Edit, Package } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  description: string;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      fetchMySkills();
    }
  }, [status, router, page]);

  const fetchMySkills = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "6");
      
      const res = await fetch(`/api/skills/my?${params}`);
      const data = await res.json();
      setSkills(data.skills);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (skillId: string) => {
    if (!confirm("确定要删除这个 Skill 吗？此操作不可撤销。")) {
      return;
    }

    setDeleting(skillId);
    try {
      const res = await fetch(`/api/skills/${skillId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSkills(skills.filter((s) => s.id !== skillId));
      } else {
        alert("删除失败");
      }
    } catch (error) {
      console.error("Failed to delete skill:", error);
      alert("删除失败");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN");
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">我的 Skills</h1>
          <p className="mt-2 text-gray-600">管理你上传的 Agent Skills</p>
        </div>
        <Link
          href="/dashboard/upload"
          className="flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          上传 Skill
        </Link>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            还没有上传任何 Skill
          </h3>
          <p className="text-gray-500 mb-6">开始分享你的 Agent Skills 吧</p>
          <Link
            href="/dashboard/upload"
            className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            上传第一个 Skill
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {skill.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {skill.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <Download className="h-4 w-4 mr-1" />
                    {skill.downloadCount} 次下载
                  </span>
                  <span>更新于 {formatDate(skill.updatedAt)}</span>
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                  <Link
                    href={`/skill/${skill.id}`}
                    className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    查看
                  </Link>
                  <Link
                    href={`/dashboard/edit/${skill.id}`}
                    className="flex items-center justify-center p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    disabled={deleting === skill.id}
                    className="flex items-center justify-center p-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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