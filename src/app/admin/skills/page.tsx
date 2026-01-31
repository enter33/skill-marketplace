"use client";

import { useState, useEffect } from "react";
import { Search, Package, User, Download, Trash2, Edit3, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";

interface Skill {
  id: string;
  name: string;
  description: string;
  downloadCount: number;
  createdAt: string;
  author: {
    id: string;
    username: string;
    email: string;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function SkillsManagement() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'createdAt' | 'downloadCount' | 'name'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSkills();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, page, sortBy, sortOrder]);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("page", page.toString());
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const res = await fetch(`/api/admin/skills?${params}`);
      const data = await res.json();

      if (res.ok) {
        setSkills(data.skills);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSkill = async (skillId: string) => {
    if (!confirm("确定要删除此 Skill 吗？此操作不可恢复。")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/skills/${skillId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchSkills();
      } else {
        const error = await res.json();
        alert(error.error || "删除失败");
      }
    } catch (error) {
      console.error("Failed to delete skill:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Skill 管理</h2>
        <p className="mt-1 text-gray-600">管理系统中的所有 Skills</p>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="搜索 Skill 名称..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as 'createdAt' | 'downloadCount' | 'name');
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="createdAt">按时间</option>
            <option value="downloadCount">按下载量</option>
            <option value="name">按名称</option>
          </select>
          <button
            onClick={() => {
              setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
              setPage(1);
            }}
            className="flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
          >
            {sortOrder === 'desc' ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
            {sortOrder === 'desc' ? '降序' : '升序'}
          </button>
        </div>
      </div>

      {/* Skills Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      ) : skills.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">没有找到匹配的 Skills</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skill
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    下载量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {skills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-violet-600" />
                        </div>
                        <div className="ml-4">
                          <Link
                            href={`/skill/${skill.id}`}
                            className="text-sm font-medium text-violet-600 hover:text-violet-900"
                          >
                            {skill.name}
                          </Link>
                          <p className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                            {skill.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{skill.author.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Download className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{skill.downloadCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(skill.createdAt).toLocaleDateString("zh-CN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/skill/${skill.id}`}
                          className="text-violet-600 hover:text-violet-900 p-1"
                          title="查看详情"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => deleteSkill(skill.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="删除 Skill"
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
