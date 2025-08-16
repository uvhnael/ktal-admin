import React, { useState, useCallback } from "react";
import { serviceAPI } from "../../services/api";
import { usePagination, useAsyncApi } from "../../hooks/useApi";
import {
  LoadingSpinner,
  ErrorMessage,
  Pagination,
  ConfirmModal,
} from "../../components/UI";

const Service = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  const {
    data: rawServices,
    loading,
    error,
    refetch,
    pagination,
    changePage,
  } = usePagination(serviceAPI.getAll);

  // Xử lý features JSON một cách an toàn mà không mutate data gốc
  const services = rawServices?.map((service) => ({
    ...service,
    features: (() => {
      try {
        // Parse lần 1: lấy string ra
        const firstParse =
          typeof service.features === "string"
            ? JSON.parse(service.features)
            : service.features;

        // Nếu kết quả vẫn là string JSON → parse lần 2
        if (typeof firstParse === "string") {
          return JSON.parse(firstParse);
        }
        return firstParse;
      } catch {
        return service.features;
      }
    })(),
  }));

  const { execute: createServiceAction, loading: creating } = useAsyncApi();
  const { execute: updateServiceAction, loading: updating } = useAsyncApi();
  const { execute: deleteServiceAction, loading: deleting } = useAsyncApi();

  const [formData, setFormData] = useState({
    icon: "",
    title: "",
    description: "",
    features: "",
    price: "",
  });

  function stringToJsonArray(input) {
    // Tách bằng dấu "," và loại bỏ khoảng trắng thừa
    const arr = input
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0); // bỏ phần rỗng

    return JSON.stringify(arr);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // chuyển features về ["Thiết kế 3D", "Tư vấn miễn phí", "Bảo hành 1 năm"] ở dạng string
      //    stringfyly theem dấu []

      if (showEditForm && selectedService) {
        // Update service
        formData.features = JSON.stringify(formData.features);
        await updateServiceAction(() =>
          serviceAPI.update(selectedService.id, formData)
        );
        alert("Cập nhật dịch vụ thành công!");
      } else {
        // Create new service
        formData.features = stringToJsonArray(formData.features);
        await createServiceAction(() => serviceAPI.create(formData));
        alert("Tạo dịch vụ thành công!");
      }

      resetForm();
      // Chỉ refetch khi thực sự cần thiết (sau một khoảng delay nhỏ để tránh conflict)
      setTimeout(() => {
        refetch();
      }, 100);
    } catch (error) {
      console.error("Error saving service:", error);
      if (error.message.includes("JSON")) {
        alert(
          "Lỗi định dạng JSON trong trường Features. Vui lòng kiểm tra lại."
        );
      } else {
        alert("Có lỗi xảy ra khi lưu dịch vụ");
      }
    }
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setFormData({
      icon: service.icon || "",
      title: service.title || "",
      description: service.description || "",
      features: service.features || "",
      price: service.price || "",
    });
    setShowEditForm(true);
  };

  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteServiceAction(() => serviceAPI.delete(serviceToDelete.id));
      setShowDeleteModal(false);
      setServiceToDelete(null);
      alert("Xóa dịch vụ thành công!");

      // Delay refetch để tránh conflict
      setTimeout(() => {
        refetch();
      }, 100);
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Có lỗi xảy ra khi xóa dịch vụ");
    }
  };

  const resetForm = () => {
    setFormData({
      icon: "",
      title: "",
      description: "",
      features: "",
      price: "",
    });
    setShowCreateForm(false);
    setShowEditForm(false);
    setSelectedService(null);
  };

  const formatPrice = (price) => {
    // If price is already formatted or contains text, return as is
    if (
      typeof price === "string" &&
      (price.includes("VNĐ") ||
        price.includes("Liên hệ") ||
        isNaN(price.replace(/[,.]/g, "")))
    ) {
      return price;
    }
    // Try to format as currency if it's a number
    const numericPrice = parseFloat(price?.toString().replace(/[,.]/g, ""));
    if (!isNaN(numericPrice)) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(numericPrice);
    }
    return price;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý dịch vụ</h1>
          <p className="text-gray-600 mt-2">
            Quản lý các dịch vụ kiến trúc và xây dựng
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
          <span>Thêm dịch vụ</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <ErrorMessage error={error} onRetry={refetch} className="mb-6" />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa dịch vụ"
        message={`Bạn có chắc chắn muốn xóa dịch vụ "${serviceToDelete?.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        type="danger"
      />

      {/* Create/Edit Form Modal */}
      {(showCreateForm || showEditForm) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {showEditForm ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Icon
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    placeholder="VD: fas fa-home hoặc URL hình ảnh"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tiêu đề dịch vụ
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mô tả
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tính năng (JSON format)
                    <span className="text-xs text-gray-500 block mt-1">
                      VD: ["Thiết kế 3D", "Tư vấn miễn phí", "Bảo hành 1 năm"]
                    </span>
                  </label>
                  <textarea
                    required
                    value={formData.features}
                    onChange={(e) =>
                      setFormData({ ...formData, features: e.target.value })
                    }
                    rows="4"
                    placeholder='["Tính năng 1", "Tính năng 2", "Tính năng 3"]'
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Giá (VNĐ)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="VD: 10,000,000 VNĐ hoặc Liên hệ"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={creating || updating}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating || updating
                      ? "Đang lưu..."
                      : showEditForm
                      ? "Cập nhật"
                      : "Thêm"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Danh sách dịch vụ
          </h2>
        </div>
        {loading ? (
          <LoadingSpinner text="Đang tải dịch vụ..." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Icon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiêu đề dịch vụ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tính năng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {services?.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {service.icon?.startsWith("http") ? (
                            <img
                              src={service.icon}
                              alt="icon"
                              className="w-8 h-8 rounded"
                            />
                          ) : (
                            <i
                              className={`${service.icon} text-xl text-blue-600`}
                            ></i>
                          )}
                          <span className="ml-2 text-sm text-gray-500">
                            {service.icon}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {service.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {service.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs">
                          {Array.isArray(service.features) ? (
                            <ul className="list-disc list-inside">
                              {service.features
                                .slice(0, 3)
                                .map((feature, index) => (
                                  <li key={index} className="truncate">
                                    {feature}
                                  </li>
                                ))}
                              {service.features.length > 3 && (
                                <li className="text-gray-400">
                                  +{service.features.length - 3} tính năng khác
                                </li>
                              )}
                            </ul>
                          ) : (
                            <span>{service.features}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {service.price}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(service)}
                          disabled={creating || updating || deleting}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteClick(service)}
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

        {services?.length === 0 && !loading && (
          <div className="p-6 text-center text-gray-500">
            Chưa có dịch vụ nào.
          </div>
        )}
      </div>
    </div>
  );
};

export default Service;
