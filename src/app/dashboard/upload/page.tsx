"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".zip")) {
      setFile(droppedFile);
      setError("");
    } else {
      setError("请上传 ZIP 格式的文件");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith(".zip")) {
        setFile(selectedFile);
        setError("");
      } else {
        setError("请上传 ZIP 格式的文件");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("请选择要上传的文件");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/skills/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setError(data.error || data.details?.join(", ") || "上传失败");
      }
    } catch (error) {
      setError("上传失败，请重试");
    } finally {
      setUploading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-violet-600"
        >
          ← 返回我的 Skills
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">上传 Skill</h1>
        <p className="mt-2 text-gray-600">
          上传符合 Claude Skill 结构的 ZIP 文件
        </p>
      </div>

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-900 mb-2">
            上传成功！
          </h3>
          <p className="text-green-700">正在跳转到管理页面...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragging
                ? "border-violet-500 bg-violet-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            {file ? (
              <div className="flex items-center justify-center space-x-4">
                <File className="h-12 w-12 text-violet-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  拖拽文件到此处
                </p>
                <p className="text-gray-500 mb-4">或</p>
                <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                  选择文件
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </>
            )}
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">文件要求：</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>必须为 ZIP 格式</li>
              <li>必须包含 SKILL.md 文件</li>
              <li>SKILL.md 必须包含 name 和 description 字段</li>
              <li>可选包含 PATTERNS.md、REFERENCE.md、TROUBLESHOOTING.md</li>
            </ul>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              取消
            </Link>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "上传中..." : "上传"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}