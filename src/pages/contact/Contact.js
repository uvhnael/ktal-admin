import React, { useState, useEffect, useCallback } from "react";
import { contactAPI, serviceAPI } from "../../services/api";
import { usePagination, useAsyncApi } from "../../hooks/useApi";

const Contact = () => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [filter, setFilter] = useState("all"); // all, new, replied, archived
  const [services, setServices] = useState({}); // Service mapping for serviceId -> name
  const [editingNotes, setEditingNotes] = useState({}); // Track note edits in table

  // Memoize the API function to prevent infinite loops
  const getContactsApi = useCallback(
    (params) => {
      const finalParams = { ...params };
      if (filter !== "all") {
        finalParams.status = filter;
      }
      return contactAPI.getAll(finalParams);
    },
    [filter]
  );

  // Sử dụng custom hooks cho API calls
  const {
    data: contacts,
    loading,
    error,
    pagination,
    refetch,
    updateParams,
  } = usePagination(getContactsApi, {});

  const { execute: updateStatus, loading: updating } = useAsyncApi();
  const { execute: deleteContact, loading: deleting } = useAsyncApi();

  // Load services for display names
  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await serviceAPI.getAll();
        const serviceMap = {};
        (response.data || response).forEach((service) => {
          serviceMap[service.id] = service.title;
        });
        setServices(serviceMap);
      } catch (error) {
        console.error("Error loading services:", error);
      }
    };
    loadServices();
  }, []);

  // Handle filter change
  useEffect(() => {
    // Reset to page 1 and refetch when filter changes
    updateParams({ page: 1 });
    // eslint-disable-next-line
  }, [filter]);

  //   const handleStatusChange = async (contactId, newStatus) => {
  //     try {
  //       await updateStatus(() => contactAPI.updateStatus(contactId, newStatus));

  //       // Refresh data after update
  //       refetch();

  //       // Show success message
  //       alert("Cập nhật trạng thái thành công!");
  //     } catch (error) {
  //       console.error("Error updating contact status:", error);
  //       alert("Có lỗi xảy ra khi cập nhật trạng thái");
  //     }
  //   };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa liên hệ này?")) {
      try {
        await deleteContact(() => contactAPI.delete(id));
        refetch();
        alert("Xóa liên hệ thành công!");
      } catch (error) {
        console.error("Error deleting contact:", error);
        alert("Có lỗi xảy ra khi xóa liên hệ");
      }
    }
  };

  const handleViewDetail = (contact) => {
    setSelectedContact(contact);
    setShowDetailModal(true);
  };

  //   const getStatusText = (status) => {
  //     const statusMap = {
  //       pending: "Đang chờ xử lý",
  //       processing: "Trong quá trình",
  //       completed: "Đã xong",
  //       spam: "Spam",
  //     };
  //     return statusMap[status] || status;
  //   };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      spam: "bg-red-100 text-red-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  const getServiceName = (serviceId) => {
    return services[serviceId] || `Dịch vụ #${serviceId}` || "Không xác định";
  };

  const formatMessage = (message) => {
    if (!message) return "";
    // Convert newlines to proper line breaks and preserve spacing
    return message.replace(/\n/g, "\n").trim();
  };

  const filteredContacts = contacts || [];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý liên hệ</h1>
          <p className="text-gray-600 mt-2">
            Quản lý các yêu cầu liên hệ từ khách hàng
          </p>
        </div>

        {/* Filter */}
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Đang chờ xử lý</option>
            <option value="processing">Trong quá trình</option>
            <option value="completed">Đã xong</option>
            <option value="spam">Spam</option>
          </select>
        </div>
      </div>

      {/* Contact Detail Modal */}
      {showDetailModal && selectedContact && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Chi tiết liên hệ
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
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

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Họ tên
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedContact.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Trạng thái
                    </label>
                    <select
                      value={selectedContact.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        try {
                          await updateStatus(() =>
                            contactAPI.updateStatus(
                              selectedContact.id,
                              newStatus
                            )
                          );
                          setSelectedContact({
                            ...selectedContact,
                            status: newStatus,
                          });
                          refetch();
                        } catch (error) {
                          console.error("Error updating status:", error);
                          alert("Có lỗi xảy ra khi cập nhật trạng thái");
                        }
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="pending">Đang chờ xử lý</option>
                      <option value="processing">Trong quá trình</option>
                      <option value="completed">Đã xong</option>
                      <option value="spam">Spam</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedContact.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Điện thoại
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedContact.phone}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Dịch vụ quan tâm
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedContact.serviceId
                      ? getServiceName(selectedContact.serviceId)
                      : "Không xác định"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nội dung
                  </label>
                  <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                    {formatMessage(selectedContact.message)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú quản trị
                  </label>
                  <textarea
                    value={selectedContact.note || ""}
                    onChange={(e) => {
                      setSelectedContact({
                        ...selectedContact,
                        note: e.target.value,
                      });
                    }}
                    onBlur={async () => {
                      try {
                        await updateStatus(() =>
                          contactAPI.updateNote(
                            selectedContact.id,
                            selectedContact.note
                          )
                        );
                        refetch();
                      } catch (error) {
                        console.error("Error updating note:", error);
                        alert("Có lỗi xảy ra khi cập nhật ghi chú");
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) {
                        e.target.blur();
                      }
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    rows="4"
                    placeholder="Thêm ghi chú cho liên hệ này... (Ctrl+Enter để lưu)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Ghi chú sẽ được lưu tự động khi bạn click ra ngoài hoặc nhấn
                    Ctrl+Enter
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Thời gian gửi
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedContact.createdAt)}
                    </p>
                  </div>
                  {selectedContact.handledAt ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Thời gian xử lý
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedContact.handledAt)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Xử lý bởi: {selectedContact.handledBy}
                      </p>
                    </div>
                  ) : (
                    selectedContact.status === "pending" && (
                      <div>
                        <button
                          onClick={async () => {
                            try {
                              const currentUser = JSON.parse(
                                localStorage.getItem("admin_user")
                              );
                              await updateStatus(() =>
                                contactAPI.updateHandled(
                                  selectedContact.id,
                                  currentUser.id,
                                  new Date().toISOString()
                                )
                              );
                              refetch();
                            } catch (error) {
                              console.error("Error marking as handled:", error);
                              alert(
                                "Có lỗi xảy ra khi cập nhật trạng thái xử lý"
                              );
                            }
                          }}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Đánh dấu đã xử lý
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Có lỗi xảy ra
              </h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={refetch}
                className="mt-2 text-sm text-red-800 underline hover:text-red-900"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contacts List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Danh sách liên hệ ({filteredContacts.length})
          </h2>
        </div>
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Đang tải...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thông tin liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dịch vụ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nội dung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ghi chú
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          {contact.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {contact.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {contact.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {contact.serviceId
                          ? getServiceName(contact.serviceId)
                          : "Không xác định"}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm text-gray-900 whitespace-pre-line break-words line-clamp-3 max-w-xs">
                        {contact.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(contact.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={contact.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            await updateStatus(() =>
                              contactAPI.updateStatus(contact.id, newStatus)
                            );
                            refetch();
                          } catch (error) {
                            console.error("Error updating status:", error);
                            alert("Có lỗi xảy ra khi cập nhật trạng thái");
                          }
                        }}
                        className={`text-xs font-semibold rounded px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(
                          contact.status
                        )}`}
                        disabled={updating || deleting}
                      >
                        <option value="pending">Đang chờ xử lý</option>
                        <option value="processing">Trong quá trình</option>
                        <option value="completed">Đã xong</option>
                        <option value="spam">Spam</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <input
                          type="text"
                          value={
                            editingNotes[contact.id] !== undefined
                              ? editingNotes[contact.id]
                              : contact.note || ""
                          }
                          onChange={(e) => {
                            setEditingNotes((prev) => ({
                              ...prev,
                              [contact.id]: e.target.value,
                            }));
                          }}
                          onBlur={async (e) => {
                            try {
                              await updateStatus(() =>
                                contactAPI.updateNote(
                                  contact.id,
                                  e.target.value
                                )
                              );
                              // Clear the editing state
                              setEditingNotes((prev) => {
                                const newState = { ...prev };
                                delete newState[contact.id];
                                return newState;
                              });
                              refetch();
                            } catch (error) {
                              console.error("Error updating note:", error);
                              alert("Có lỗi xảy ra khi cập nhật ghi chú");
                            }
                          }}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.target.blur();
                            }
                          }}
                          className="w-full truncate text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Thêm ghi chú..."
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewDetail(contact)}
                        className="text-blue-600 hover:text-blue-900"
                        disabled={updating || deleting}
                      >
                        Xem chi tiết
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        disabled={updating || deleting}
                      >
                        {deleting ? "Đang xóa..." : "Xóa"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredContacts.length === 0 && !loading && (
          <div className="p-6 text-center text-gray-500">
            Không có liên hệ nào.
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() =>
                  pagination.page > 1 &&
                  updateParams({ page: pagination.page - 1 })
                }
                disabled={pagination.page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() =>
                  pagination.page < pagination.totalPages &&
                  updateParams({ page: pagination.page + 1 })
                }
                disabled={pagination.page >= pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị{" "}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  đến{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}
                  </span>{" "}
                  trong tổng số{" "}
                  <span className="font-medium">{pagination.total}</span> kết
                  quả
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => updateParams({ page: pagination.page - 1 })}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Trang trước</span>
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    const isCurrentPage = pageNumber === pagination.page;

                    if (
                      pageNumber === 1 ||
                      pageNumber === pagination.totalPages ||
                      (pageNumber >= pagination.page - 1 &&
                        pageNumber <= pagination.page + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => updateParams({ page: pageNumber })}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            isCurrentPage
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === pagination.page - 2 ||
                      pageNumber === pagination.page + 2
                    ) {
                      return (
                        <span
                          key={pageNumber}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() => updateParams({ page: pagination.page + 1 })}
                    disabled={pagination.page >= pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Trang sau</span>
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contact;
