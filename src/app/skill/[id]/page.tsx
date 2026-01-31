"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Download, User, Calendar, FileText, ChevronRight, Folder, File, ChevronDown, ChevronRight as ChevronRightIcon, ChevronLeft } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  description: string;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    username: string;
  };
}

interface FileEntry {
  path: string;
  isDirectory: boolean;
  size: number;
}

interface TreeNode {
  path: string;
  name: string;
  isDirectory: boolean;
  size: number;
  children?: TreeNode[];
  level: number;
}

export default function SkillDetailPage() {
  const params = useParams();
  const skillId = params.id as string;
  
  const [skill, setSkill] = useState<Skill | null>(null);
  const [allFiles, setAllFiles] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [currentPath, setCurrentPath] = useState<string>("");

  useEffect(() => {
    if (skillId) {
      fetchSkill();
      fetchFiles();
    }
  }, [skillId]);

  const fetchSkill = async () => {
    try {
      const res = await fetch(`/api/skills/${skillId}`);
      if (res.ok) {
        const data = await res.json();
        setSkill(data);
      }
    } catch (error) {
      console.error("Failed to fetch skill:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await fetch(`/api/skills/${skillId}/files`);
      if (res.ok) {
        const data = await res.json();
        setAllFiles(data.files);
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
    }
  };

  const buildTree = (files: FileEntry[], parentPath: string = ""): TreeNode[] => {
    // 辅助函数：获取路径的各部分（处理末尾的/）
    const getParts = (path: string) => {
      const cleanPath = path.replace(/\/$/, '');
      return cleanPath === '' ? [] : cleanPath.split('/');
    };

    const children = files
      .filter(f => {
        const parts = getParts(f.path);
        const parentParts = parentPath.split('/');

        // 如果是根目录，显示所有第一级的文件和目录
        if (parentPath === "") {
          return parts.length === 1;
        }

        // 如果是子目录，显示该目录下的直接文件和子目录
        // 必须是以 parentPath 开头的
        if (parts.length <= parentParts.length) return false;
        if (parts.slice(0, parentParts.length).join('/') !== parentPath) return false;
        // 只显示直接子项
        return parts.length === parentParts.length + 1;
      })
      .map(f => {
        const parts = getParts(f.path);
        const name = parts[parts.length - 1];
        const fullPath = parts.join('/');

        // 检查是否是目录：如果还有其他文件以该路径开头，则是目录
        const isDir = files.some(other =>
          other.path !== f.path && getParts(other.path).length > parts.length &&
          getParts(other.path).slice(0, parts.length).join('/') === fullPath
        );

        return {
          path: fullPath,
          name: name,
          isDirectory: isDir,
          size: isDir ? 0 : f.size,
          level: parentPath === "" ? 0 : parentPath.split('/').length,
          children: isDir ? buildTree(files, fullPath) : undefined,
        };
      });

    return children;
  };

  const getVisibleFiles = (): TreeNode[] => {
    // 辅助函数：获取路径的层级深度（处理末尾的/）
    const getDepth = (path: string) => {
      const cleanPath = path.replace(/\/$/, '');
      return cleanPath === '' ? 0 : cleanPath.split('/').length;
    };

    // 辅助函数：获取路径的各部分（处理末尾的/）
    const getParts = (path: string) => {
      const cleanPath = path.replace(/\/$/, '');
      return cleanPath === '' ? [] : cleanPath.split('/');
    };

    if (currentPath === "") {
      // 根目录：只显示根目录下的直接文件和目录
      const rootItems = new Map<string, TreeNode>();

      allFiles.forEach(f => {
        const parts = getParts(f.path);
        if (parts.length === 0) return;

        const rootName = parts[0];

        if (!rootItems.has(rootName)) {
          // 检查是否是目录：如果还有其他文件以该路径开头，则是目录
          const isDir = allFiles.some(other =>
            other.path !== f.path && getParts(other.path)[0] === rootName && getParts(other.path).length > 1
          );

          rootItems.set(rootName, {
            path: rootName,
            name: rootName,
            isDirectory: isDir,
            size: isDir ? 0 : f.size,
            level: 0,
            children: isDir ? buildTree(allFiles, rootName) : undefined,
          });
        }
      });

      return Array.from(rootItems.values());
    }

    // 子目录：显示该目录下的直接文件和子目录
    const parentParts = currentPath.split('/');
    const childItemsMap = new Map<string, TreeNode>();

    allFiles
      .filter(f => {
        const parts = getParts(f.path);
        // 必须是以当前路径开头的
        if (parts.length <= parentParts.length) return false;
        if (parts.slice(0, parentParts.length).join('/') !== currentPath) return false;
        // 只显示直接子项
        return parts.length === parentParts.length + 1;
      })
      .forEach(f => {
        const parts = getParts(f.path);
        const name = parts[parts.length - 1];

        if (!childItemsMap.has(name)) {
          // 检查是否是目录：如果还有其他文件以该路径开头，则是目录
          const fullPath = parts.join('/');
          const isDir = allFiles.some(other =>
            other.path !== f.path && getParts(other.path).length > parts.length &&
            getParts(other.path).slice(0, parts.length).join('/') === fullPath
          );

          childItemsMap.set(name, {
            path: fullPath,
            name: name,
            isDirectory: isDir,
            size: isDir ? 0 : f.size,
            level: parentParts.length,
            children: isDir ? buildTree(allFiles, fullPath) : undefined,
          });
        }
      });

    return Array.from(childItemsMap.values());
  };

  const toggleExpand = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handlePathClick = (path: string) => {
    if (path === currentPath) return;
    setCurrentPath(path);
  };

  const handleBack = () => {
    const parts = currentPath.split("/");
    parts.pop();
    setCurrentPath(parts.join("/"));
  };

  const fetchFileContent = async (path: string) => {
    try {
      const res = await fetch(`/api/skills/${skillId}/files?path=${encodeURIComponent(path)}`);
      if (res.ok) {
        const data = await res.json();
        setFileContent(data.content);
        setSelectedFile(path);
      }
    } catch (error) {
      console.error("Failed to fetch file content:", error);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/skills/${skillId}/download`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${skill?.name}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setSkill(prev => prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : null);
      }
    } catch (error) {
      console.error("Failed to download:", error);
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const renderTreeNode = (node: TreeNode): JSX.Element => {
    const isExpanded = expandedPaths.has(node.path);
    const isSelected = selectedFile === node.path;
    const paddingLeft = `${node.level * 16}px`;

    return (
      <div key={node.path}>
        <button
          onClick={() => node.isDirectory ? toggleExpand(node.path) : fetchFileContent(node.path)}
          className={`w-full px-4 py-3 flex items-center text-left hover:bg-gray-50 transition-colors ${
            isSelected ? "bg-violet-50 border-l-4 border-violet-600" : "border-l-4 border-transparent"
          }`}
          style={{ paddingLeft }}
        >
          {node.isDirectory ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
            )
          ) : (
            <File className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {node.name}
            </p>
            <p className="text-xs text-gray-500">
              {node.isDirectory ? "文件夹" : formatFileSize(node.size)}
            </p>
          </div>
        </button>
        {isExpanded && node.children && node.children.length > 0 && (
          <div className="ml-4">
            {node.children.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
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

  if (!skill) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Skill 未找到</h1>
        <Link href="/" className="text-violet-600 hover:text-violet-700">
          返回首页
        </Link>
      </div>
    );
  }

  const visibleFiles = getVisibleFiles();
  const pathParts = currentPath.split("/").filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-violet-600">首页</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-900">{skill.name}</span>
        <ChevronRight className="h-4 w-4 mx-2" />
        {pathParts.map((part, index) => (
          <span key={index} className="flex items-center">
            <button
              onClick={() => handlePathClick(pathParts.slice(0, index + 1).join("/"))}
              className="hover:text-violet-600 transition-colors"
            >
              {part}
            </button>
            {index < pathParts.length - 1 && <ChevronRight className="h-4 w-4 mx-2" />}
          </span>
        ))}
        {currentPath && (
          <button
            onClick={handleBack}
            className="ml-2 hover:text-violet-600 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </nav>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{skill.name}</h1>
            <p className="text-gray-600 mb-6 whitespace-pre-wrap">{skill.description}</p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                {skill.author.username}
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                创建于 {formatDate(skill.createdAt)}
              </span>
              <span className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                {skill.downloadCount} 次下载
              </span>
            </div>
          </div>
          
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center px-6 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
          >
            {downloading ? (
              "下载中..."
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                下载
              </>
            )}
          </button>
        </div>
      </div>

      {/* Files Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* File Tree */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Folder className="h-4 w-4 mr-2" />
                文件目录
              </h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {visibleFiles.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  暂无文件
                </div>
              ) : (
                visibleFiles.map(node => renderTreeNode(node))
              )}
            </div>
          </div>
        </div>

        {/* File Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                {selectedFile ? selectedFile.split("/").pop() : "文件预览"}
              </h3>
            </div>
            <div className="p-4">
              {selectedFile ? (
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-lg overflow-x-auto max-h-[600px] overflow-y-auto">
                  {fileContent}
                </pre>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>点击左侧文件查看内容</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}