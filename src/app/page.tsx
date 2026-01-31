"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Download, User, Calendar, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  description: string;
  downloadCount: number;
  createdAt: string;
  author: {
    username: string;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function Home() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'createdAt' | 'downloadCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSkills();
    }, 300); // 300ms 防抖
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
      
      const res = await fetch(`/api/skills?${params}`);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          发现 Agent Skills
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          探索、分享和管理 Claude Agent Skills，提升你的 AI 助手能力
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="搜索 Skills..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 sm:text-lg shadow-sm"
          />
        </div>

        {/* Sort Controls */}
        <div className="max-w-2xl mx-auto flex justify-center gap-3">
          {/* Sort By Select */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as 'createdAt' | 'downloadCount');
                setPage(1);
              }}
              className="appearance-none bg-white border border-gray-300 rounded-lg pl-9 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 cursor-pointer"
            >
              <option value="createdAt">按时间</option>
              <option value="downloadCount">按下载量</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              {sortBy === 'createdAt' ? (
                <Calendar className="h-4 w-4 text-gray-500" />
              ) : (
                <Download className="h-4 w-4 text-gray-500" />
              )}
            </div>
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
              <ArrowUpDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* Sort Order Toggle */}
          <button
            onClick={() => {
              setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
              setPage(1);
            }}
            className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
          >
            {sortOrder === 'desc' ? (
              <>
                <ArrowDown className="h-4 w-4" />
                <span>降序</span>
              </>
            ) : (
              <>
                <ArrowUp className="h-4 w-4" />
                <span>升序</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      {pagination && (
        <div className="mb-8 text-center">
          <span className="text-gray-600">
            共 <span className="font-semibold text-violet-600">{pagination.total}</span> 个 Skills
          </span>
        </div>
      )}

      {/* Skills Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {search ? "没有找到匹配的 Skills" : "暂无 Skills"}
          </h3>
          <p className="text-gray-500">
            {search ? "尝试其他关键词搜索" : "成为第一个上传 Skill 的用户吧"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill) => (
              <Link
                key={skill.id}
                href={`/skill/${skill.id}`}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-violet-300 transition-all duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">
                  {skill.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {skill.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {skill.author.username}
                    </span>
                    <span className="flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      {skill.downloadCount}
                    </span>
                  </div>
                  <span>{formatDate(skill.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
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