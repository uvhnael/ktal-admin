import React, { useState } from "react";
import { blogAPI } from "../../services/api";
import { usePagination, useAsyncApi } from "../../hooks/useApi";
import {
  LoadingSpinner,
  ErrorMessage,
  Pagination,
  StatusBadge,
  ConfirmModal,
} from "../../components/UI";
import BlogForm from "./BlogForm";

const Blog = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // API calls using custom hooks
  const {
    data: blogs,
    loading,
    error,
    pagination,
    refetch,
    changePage,
  } = usePagination(() => blogAPI.getAll());

  const { execute: createBlog, loading: creating } = useAsyncApi();
  const { execute: updateBlog, loading: updating } = useAsyncApi();
  const { execute: deleteBlog, loading: deleting } = useAsyncApi();

  // Generate a slug from a title
  const generateSlug = (title) => {
    if (!title) return "";
    return title
      .toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
      .replace(/[èéẹẻẽêềếệểễ]/g, "e")
      .replace(/[ìíịỉĩ]/g, "i")
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
      .replace(/[ùúụủũưừứựửữ]/g, "u")
      .replace(/[ỳýỵỷỹ]/g, "y")
      .replace(/đ/g, "d")
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    author: "",
    category: "",
    thumbnail: "",
    content: "",
    status: "draft",
  });

  const handleSubmit = async (updatedFormData) => {
    try {
      // Use the updated form data that includes the thumbnail URL
      // Ensure slug is generated if empty
      const dataToSubmit = {
        ...updatedFormData,
        slug: updatedFormData.slug || generateSlug(updatedFormData.title),
      };

      if (showEditForm && selectedBlog) {
        // Update blog
        await updateBlog(() => blogAPI.update(selectedBlog.id, dataToSubmit));
        alert("Cập nhật bài viết thành công!");
      } else {
        // Create new blog
        await createBlog(() => blogAPI.create(dataToSubmit));
        alert("Tạo bài viết thành công!");
      }
      refetch(); // Refresh data
      resetForm();
    } catch (error) {
      console.error("Error saving blog:", error);
      alert("Có lỗi xảy ra khi lưu bài viết");
    }
  };

  const handleEdit = (blog) => {
    setSelectedBlog(blog);
    setFormData({
      title: blog.title || "",
      slug: blog.slug || "",
      author: blog.author || "",
      category: blog.category || "",
      thumbnail: blog.thumbnail || "",
      content: blog.content || "",
      status: blog.status || "draft",
    });
    setShowEditForm(true);
  };

  const handleDeleteClick = (blog) => {
    setBlogToDelete(blog);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteBlog(() => blogAPI.delete(blogToDelete.id));
      refetch(); // Refresh data
      setShowDeleteModal(false);
      setBlogToDelete(null);
      alert("Xóa bài viết thành công!");
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("Có lỗi xảy ra khi xóa bài viết");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      author: "",
      category: "",
      thumbnail: "",
      content: "",
      status: "draft",
    });
    setShowCreateForm(false);
    setShowEditForm(false);
    setSelectedBlog(null);
  };

  const stripHtmlTags = (html) => {
    if (!html) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    const stripped = stripHtmlTags(text);
    return stripped.length > maxLength
      ? stripped.substring(0, maxLength) + "..."
      : stripped;
  };

  const handlePreview = (blog) => {
    setSelectedBlog(blog);
    setShowPreviewModal(true);
  };

  const statusConfig = {
    draft: { text: "Bản nháp", className: "bg-gray-100 text-gray-800" },
    published: {
      text: "Đã xuất bản",
      className: "bg-green-100 text-green-800",
    },
    archived: {
      text: "Đã lưu trữ",
      className: "bg-yellow-100 text-yellow-800",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý bài viết</h1>
          <p className="text-gray-600 mt-2">
            Quản lý bài viết và tin tức trên blog
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span>Thêm bài viết</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <ErrorMessage error={error} onRetry={refetch} className="mb-6" />
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedBlog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-5 mx-auto p-5 border w-[900px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedBlog.title}
                </h3>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto space-y-4">
                {/* Blog Info */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <strong>Tác giả:</strong> {selectedBlog.author}
                  </div>
                  <div>
                    <strong>Danh mục:</strong> {selectedBlog.category || "-"}
                  </div>
                  <div>
                    <strong>Trạng thái:</strong>
                    <StatusBadge
                      status={selectedBlog.status}
                      statusConfig={statusConfig}
                      className="ml-2"
                    />
                  </div>
                  <div>
                    <strong>Slug:</strong> {selectedBlog.slug}
                  </div>
                  {selectedBlog.created_at && (
                    <div>
                      <strong>Ngày tạo:</strong>{" "}
                      {new Date(selectedBlog.created_at).toLocaleDateString(
                        "vi-VN"
                      )}
                    </div>
                  )}
                  {selectedBlog.updated_at && (
                    <div>
                      <strong>Cập nhật:</strong>{" "}
                      {new Date(selectedBlog.updated_at).toLocaleDateString(
                        "vi-VN"
                      )}
                    </div>
                  )}
                </div>

                {/* Thumbnail if available */}
                {selectedBlog.thumbnail && (
                  <div>
                    <h4 className="text-lg font-medium mb-2">Ảnh đại diện</h4>
                    <img
                      src={selectedBlog.thumbnail}
                      alt={selectedBlog.title}
                      className="max-w-full h-auto rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                {/* Rich Content */}
                {selectedBlog.content && (
                  <div>
                    <h4 className="text-lg font-medium mb-2">Nội dung</h4>
                    <div
                      className="prose max-w-none border border-gray-200 rounded-lg p-4 bg-white"
                      dangerouslySetInnerHTML={{
                        __html: selectedBlog.content,
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa bài viết"
        message={`Bạn có chắc chắn muốn xóa bài viết "${blogToDelete?.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        type="danger"
      />

      {/* Create/Edit Form Modal */}
      {(showCreateForm || showEditForm) && (
        <BlogForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          isEditing={showEditForm}
          loading={creating || updating}
        />
      )}

      {/* Blogs List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Danh sách bài viết
          </h2>
        </div>
        {loading ? (
          <LoadingSpinner text="Đang tải bài viết..." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiêu đề
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tác giả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Danh mục
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {blogs?.map((blog) => (
                    <tr key={blog.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {blog.thumbnail && (
                            <img
                              src={blog.thumbnail}
                              alt={blog.title}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {blog.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {blog.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {blog.author}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {blog.category || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge
                          status={blog.status}
                          statusConfig={statusConfig}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {blog.created_at
                            ? new Date(blog.created_at).toLocaleDateString(
                                "vi-VN"
                              )
                            : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handlePreview(blog)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Xem
                        </button>
                        <button
                          onClick={() => handleEdit(blog)}
                          disabled={creating || updating || deleting}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteClick(blog)}
                          disabled={creating || updating || deleting}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination pagination={pagination} onPageChange={changePage} />
          </>
        )}
      </div>
    </div>
  );
};

export default Blog;
