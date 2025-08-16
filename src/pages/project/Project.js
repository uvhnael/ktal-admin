import React, { useState } from "react";
import { projectAPI } from "../../services/api";
import { usePagination, useAsyncApi } from "../../hooks/useApi";
import {
  LoadingSpinner,
  ErrorMessage,
  Pagination,
  StatusBadge,
  ConfirmModal,
} from "../../components/UI";
import ProjectForm from "./ProjectForm";

const Project = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // API calls using custom hooks
  const {
    data: projects,
    loading,
    error,
    pagination,
    refetch,
    changePage,
  } = usePagination(() => projectAPI.getAll());

  const { execute: createProject, loading: creating } = useAsyncApi();
  const { execute: updateProject, loading: updating } = useAsyncApi();
  const { execute: deleteProject, loading: deleting } = useAsyncApi();

  const [formData, setFormData] = useState({
    title: "",
    year: new Date().getFullYear().toString(),
    area: "",
    content: "",
    status: "draft",
  });

  const handleSubmit = async () => {
    try {
      if (showEditForm && selectedProject) {
        // Update project
        await updateProject(() =>
          projectAPI.update(selectedProject.id, formData)
        );
        alert("Cập nhật dự án thành công!");
      } else {
        // Create new project
        await createProject(() => projectAPI.create(formData));
        alert("Tạo dự án thành công!");
      }
      refetch(); // Refresh data
      resetForm();
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Có lỗi xảy ra khi lưu dự án");
    }
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    setFormData({
      title: project.title || "",
      year: project.year || new Date().getFullYear().toString(),
      area: project.area || "",
      content: project.content || "",
      status: project.status || "draft",
    });
    setShowEditForm(true);
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProject(() => projectAPI.delete(projectToDelete.id));
      refetch(); // Refresh data
      setShowDeleteModal(false);
      setProjectToDelete(null);
      alert("Xóa dự án thành công!");
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Có lỗi xảy ra khi xóa dự án");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      year: new Date().getFullYear().toString(),
      area: "",
      content: "",
      status: "draft",
    });
    setShowCreateForm(false);
    setShowEditForm(false);
    setSelectedProject(null);
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

  const handlePreview = (project) => {
    setSelectedProject(project);
    setShowPreviewModal(true);
  };

  const statusConfig = {
    draft: { text: "Bản nháp", className: "bg-gray-100 text-gray-800" },
    published: {
      text: "Đã xuất bản",
      className: "bg-green-100 text-green-800",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý dự án</h1>
          <p className="text-gray-600 mt-2">
            Quản lý các dự án kiến trúc và xây dựng
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
          <span>Thêm dự án</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <ErrorMessage error={error} onRetry={refetch} className="mb-6" />
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-5 mx-auto p-5 border w-[900px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedProject.title}
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
                {/* Project Info */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <strong>Năm thực hiện:</strong> {selectedProject.year}
                  </div>
                  <div>
                    <strong>Diện tích:</strong> {selectedProject.area}
                  </div>
                  <div>
                    <strong>Trạng thái:</strong>
                    <StatusBadge
                      status={selectedProject.status}
                      statusConfig={statusConfig}
                      className="ml-2"
                    />
                  </div>
                  {selectedProject.createdAt && (
                    <div>
                      <strong>Ngày tạo:</strong>{" "}
                      {new Date(selectedProject.createdAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </div>
                  )}
                  {selectedProject.updatedAt && (
                    <div>
                      <strong>Cập nhật:</strong>{" "}
                      {new Date(selectedProject.updatedAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </div>
                  )}
                </div>

                {/* Rich Content */}
                {selectedProject.content && (
                  <div>
                    <h4 className="text-lg font-medium mb-2">Nội dung dự án</h4>
                    <div
                      className="prose max-w-none border border-gray-200 rounded-lg p-4 bg-white"
                      dangerouslySetInnerHTML={{
                        __html: selectedProject.content,
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
        title="Xác nhận xóa dự án"
        message={`Bạn có chắc chắn muốn xóa dự án "${projectToDelete?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        type="danger"
      />

      {/* Create/Edit Form Modal */}
      {(showCreateForm || showEditForm) && (
        <ProjectForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          isEditing={showEditForm}
          loading={creating || updating}
        />
      )}

      {/* Projects List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Danh sách dự án
          </h2>
        </div>
        {loading ? (
          <LoadingSpinner text="Đang tải dự án..." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiêu đề dự án
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Năm thực hiện
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diện tích
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
                  {projects?.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {project.title}
                          </div>
                          {project.content && (
                            <div className="text-xs text-gray-400 mt-1 max-w-xs">
                              {truncateText(project.content, 50)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {project.year}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {project.area}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge
                          status={project.status}
                          statusConfig={statusConfig}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {project.createdAt
                            ? new Date(project.createdAt).toLocaleDateString(
                                "vi-VN"
                              )
                            : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handlePreview(project)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Xem
                        </button>
                        <button
                          onClick={() => handleEdit(project)}
                          disabled={creating || updating || deleting}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteClick(project)}
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

export default Project;
