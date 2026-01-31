"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Upload, Save, X } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  description: string;
  filePath: string;
}

export default function EditSkillPage() {
  const params = useParams();
  const skillId = params.id as string;
  const router = useRouter();
  const { data: session, status } = useSession();

  const [skill, setSkill] = useState<Skill | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && skillId) {
      fetchSkill();
    }
  }, [status, skillId, router]);

  const fetchSkill = async () => {
    try {
      const res = await fetch(`/api/skills/${skillId}`);
      if (res.ok) {
        const data = await res.json();
        setSkill(data);
        setName(data.name);
        setDescription(data.description);
      } else {
        setError("Skill 未找到");
      }
    } catch (error) {
      console.error("Failed to fetch skill:", error);
      setError("加载失败");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (!file) {
        setError("请选择要上传的 ZIP 文件");
        setSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/skills/${skillId}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "更新失败");
        setSaving(false);
        return;
      }

      const updatedSkill = await res.json();
      setSkill(updatedSkill);
      setFile(null);
      alert("Skill 更新成功！");
    } catch (error) {
      console.error("Failed to update skill:", error);
      setError("更新失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("确定要删除这个 Skill 吗？此操作不可撤销。")) {
      return;
    }

    try {
      const res = await fetch(`/api/skills/${skillId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "删除失败");
      }
    } catch (error) {
      console.error("Failed to delete skill:", error);
      setError("删除失败");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded" />
            <div className="h-96 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!skill && !error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">加载中...</h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-violet-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回我的 Skills
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">编辑 Skill</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  当前名称
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  当前描述
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  上传新 ZIP 文件（可选）
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:mt-4 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>
                {file && (
                  <div className="mt-2 p-3 bg-violet-50 border border-violet-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-violet-900 truncate">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-violet-600 hover:text-violet-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  取消
                </button>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-600 bg-white hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    删除
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        保存更改
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              文件要求
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-violet-600 mr-2">✓</span>
                必须为 ZIP 格式
              </li>
              <li className="flex items-start">
                <span className="text-violet-600 mr-2">✓</span>
                必须包含 SKILL.md 文件
              </li>
              <li className="flex items-start">
                <span className="text-violet-600 mr-2">✓</span>
                SKILL.md 必须包含 name 和 description 字段
              </li>
              <li className="flex items-start">
                <span className="text-violet-600 mr-2">✓</span>
                可选包含 PATTERNS.md、REFERENCE.md、TROUBLESHOOTING.md
              </li>
            </ul>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                当前文件信息
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">名称</span>
                  <span className="font-medium text-gray-900">{skill.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">文件路径</span>
                  <span className="font-medium text-gray-900 truncate max-w-[150px]">
                    {skill.filePath}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
