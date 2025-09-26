import React, { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { dashboardAPI } from "../../services/api";

const Dashboard = () => {
  // Fetch dashboard data using custom hooks
  const {
    data: overview,
    loading: overviewLoading,
    error: overviewError,
  } = useApi(() => dashboardAPI.getOverview());

  const {
    data: contentStats,
    loading: contentLoading,
    error: contentError,
  } = useApi(() => dashboardAPI.getContentStatistics());

  const {
    data: contactAnalysis,
    loading: contactLoading,
    error: contactError,
  } = useApi(() => dashboardAPI.getContactAnalysis());

  const {
    data: recentActivitiesData,
    loading: activitiesLoading,
    error: activitiesError,
  } = useApi(() => dashboardAPI.getRecentActivities());

  // Time greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "contact":
        return "📧";
      case "project":
        return "🏗️";
      case "blog":
        return "📝";
      case "service":
        return "⚙️";
      case "user":
        return "👤";
      default:
        return "📋";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "in_progress":
        return "text-blue-600 bg-blue-100";
      case "published":
        return "text-green-600 bg-green-100";
      case "processing":
        return "text-blue-600 bg-blue-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "Đang chờ xử lý":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      case "spam":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Process and combine recent activities from different sources
  const getRecentActivities = () => {
    if (!recentActivitiesData) return [];

    const activities = [];

    // Add recent projects
    if (recentActivitiesData.recentProjects) {
      recentActivitiesData.recentProjects.forEach((project) => {
        activities.push({
          type: "project",
          title: `Dự án: ${project.title}`,
          description: `${project.description} - ${project.area} (${project.year})`,
          created_at: project.updatedAt || project.createdAt,
          status: project.status,
          statusText:
            project.status === "in_progress"
              ? "Đang thực hiện"
              : project.status,
          id: project.id,
          thumbnail: project.thumbnail,
        });
      });
    }

    // Add recent blogs
    if (recentActivitiesData.recentBlogs) {
      recentActivitiesData.recentBlogs.forEach((blog) => {
        activities.push({
          type: "blog",
          title: `Bài viết: ${blog.title}`,
          description: `Tác giả: ${blog.author} - Danh mục: ${blog.category}`,
          created_at: blog.updatedAt || blog.createdAt,
          status: blog.status,
          statusText: blog.status === "published" ? "Đã xuất bản" : blog.status,
          user: blog.author,
          id: blog.id,
          thumbnail: blog.thumbnail,
        });
      });
    }

    // Add recent contacts
    if (recentActivitiesData.recentContacts) {
      recentActivitiesData.recentContacts.forEach((contact) => {
        activities.push({
          type: "contact",
          title: `Liên hệ từ: ${contact.name}`,
          description: `${contact.email} - ${contact.phone}${
            contact.message
              ? ": " + contact.message.substring(0, 50) + "..."
              : ""
          }`,
          created_at: contact.createdAt,
          status: contact.status,
          statusText:
            contact.status === "processing"
              ? "Đang xử lý"
              : contact.status === "completed"
              ? "Hoàn thành"
              : contact.status === "spam"
              ? "Spam"
              : contact.status,
          user: contact.handledBy || "Chưa xử lý",
          id: contact.id,
          note: contact.note,
        });
      });
    }

    // Sort by created_at descending (most recent first)
    return activities
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);
  };

  const recentActivities = getRecentActivities();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {getTimeGreeting()}! 👋
        </h1>
        <p className="text-gray-600">
          Chào mừng trở lại với trang quản trị. Đây là tổng quan về hệ thống của
          bạn.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {overviewLoading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))
        ) : overviewError ? (
          <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              ❌ Lỗi tải dữ liệu tổng quan: {overviewError}
            </p>
          </div>
        ) : (
          <>
            {/* Total Projects */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Tổng Dự Án
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(overview?.totalProjects)}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className="text-green-600">
                      ✅ {overview?.completedProjects || 0} hoàn thành
                    </span>
                    <span className="text-blue-600">
                      ⚡ {overview?.activeProjects || 0} đang thực hiện
                    </span>
                  </div>
                </div>
                <div className="text-4xl">🏗️</div>
              </div>
            </div>

            {/* Total Contacts */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Liên Hệ</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(overview?.totalContacts)}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className="text-yellow-600">
                      ⏳ {overview?.pendingContacts || 0} chờ xử lý
                    </span>
                    <span className="text-green-600">
                      ✅ {overview?.handledContacts || 0} đã xử lý
                    </span>
                  </div>
                </div>
                <div className="text-4xl">📧</div>
              </div>
            </div>

            {/* Total Blog Posts */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bài Viết</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(overview?.totalBlogs)}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className="text-green-600">
                      📖 {overview?.publishedBlogs || 0} đã xuất bản
                    </span>
                    <span className="text-gray-600">
                      📝 {overview?.draftBlogs || 0} bản nháp
                    </span>
                  </div>
                </div>
                <div className="text-4xl">📝</div>
              </div>
            </div>

            {/* Total Services */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Dịch Vụ</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(overview?.totalServices)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {overview?.servicesWithFeatures || 0} dịch vụ có tính năng
                    đặc biệt
                  </p>
                </div>
                <div className="text-4xl">⚙️</div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Content Statistics */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📊 Thống Kê Nội Dung
          </h2>
          {contentLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : contentError ? (
            <p className="text-red-600">❌ Lỗi tải thống kê: {contentError}</p>
          ) : (
            <div className="space-y-6">
              {/* Projects by Area */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  🌍 Dự án theo khu vực
                </h3>
                <div className="space-y-2">
                  {contentStats?.projectsByArea &&
                  Object.keys(contentStats.projectsByArea).length > 0 ? (
                    Object.entries(contentStats.projectsByArea).map(
                      ([area, count], index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-blue-50 rounded-lg"
                        >
                          <span className="text-sm text-gray-700 font-medium">
                            📍 {area}
                          </span>
                          <span className="font-semibold text-blue-600">
                            {formatNumber(count)}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      Chưa có dự án nào
                    </p>
                  )}
                </div>
              </div>

              {/* Projects by Year */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  📅 Dự án theo năm
                </h3>
                <div className="space-y-2">
                  {contentStats?.projectsByYear &&
                  Object.keys(contentStats.projectsByYear).length > 0 ? (
                    Object.entries(contentStats.projectsByYear).map(
                      ([year, count], index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-green-50 rounded-lg"
                        >
                          <span className="text-sm text-gray-700 font-medium">
                            🗓️ Năm {year}
                          </span>
                          <span className="font-semibold text-green-600">
                            {formatNumber(count)}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      Chưa có dự án nào
                    </p>
                  )}
                </div>
              </div>

              {/* Blog Posts by Category */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  📚 Bài viết theo danh mục
                </h3>
                <div className="space-y-2">
                  {contentStats?.blogsByCategory &&
                  Object.keys(contentStats.blogsByCategory).length > 0 ? (
                    Object.entries(contentStats.blogsByCategory).map(
                      ([category, count], index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-purple-50 rounded-lg"
                        >
                          <span className="text-sm text-gray-700 font-medium">
                            {category === "Kiến thức" && "🧠 "}
                            {category === "Công nghệ" && "💻 "}
                            {category === "Giới Thiệu" && "👋 "}
                            {category}
                          </span>
                          <span className="font-semibold text-purple-600">
                            {formatNumber(count)}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      Chưa có bài viết nào
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contact Analysis */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📈 Phân Tích Liên Hệ
          </h2>
          {contactLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : contactError ? (
            <p className="text-red-600">❌ Lỗi tải phân tích: {contactError}</p>
          ) : (
            <div className="space-y-6">
              {/* Contacts by Status */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  📊 Liên hệ theo trạng thái
                </h3>
                <div className="space-y-2">
                  {contactAnalysis?.contactsByStatus &&
                  Object.keys(contactAnalysis.contactsByStatus).length > 0 ? (
                    Object.entries(contactAnalysis.contactsByStatus).map(
                      ([status, count], index) => {
                        let statusColor = "bg-gray-100 text-gray-600";
                        let statusIcon = "⚪";

                        if (status === "processing") {
                          statusColor = "bg-blue-100 text-blue-700";
                          statusIcon = "🔄";
                        } else if (status === "completed") {
                          statusColor = "bg-green-100 text-green-700";
                          statusIcon = "✅";
                        } else if (status === "spam") {
                          statusColor = "bg-red-100 text-red-700";
                          statusIcon = "🚫";
                        } else if (status === "Đang chờ xử lý") {
                          statusColor = "bg-yellow-100 text-yellow-700";
                          statusIcon = "⏳";
                        }

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded-lg border"
                          >
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor} flex items-center`}
                            >
                              <span className="mr-1">{statusIcon}</span>
                              {status === "processing"
                                ? "Đang xử lý"
                                : status === "completed"
                                ? "Hoàn thành"
                                : status === "spam"
                                ? "Spam"
                                : status}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatNumber(count)}
                            </span>
                          </div>
                        );
                      }
                    )
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      Chưa có liên hệ nào
                    </p>
                  )}
                </div>
              </div>

              {/* Contacts by Service */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  🛠️ Liên hệ theo dịch vụ
                </h3>
                <div className="space-y-2">
                  {contactAnalysis?.contactsByService &&
                  Object.keys(contactAnalysis.contactsByService).length > 0 ? (
                    Object.entries(contactAnalysis.contactsByService).map(
                      ([service, count], index) => {
                        let serviceIcon = "🔧";

                        if (service.includes("Nội thất")) serviceIcon = "🏠";
                        else if (service.includes("Cảnh quan"))
                          serviceIcon = "🌳";
                        else if (service.includes("Tư vấn")) serviceIcon = "💬";
                        else if (service.includes("Kiến trúc"))
                          serviceIcon = "🏗️";

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-orange-50 rounded-lg"
                          >
                            <span className="text-sm text-gray-700 font-medium flex items-center">
                              <span className="mr-2">{serviceIcon}</span>
                              {service}
                            </span>
                            <span className="font-semibold text-orange-600">
                              {formatNumber(count)}
                            </span>
                          </div>
                        );
                      }
                    )
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      Chưa có liên hệ theo dịch vụ
                    </p>
                  )}
                </div>
              </div>

              {/* Contacts by Handler */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  👤 Liên hệ theo người xử lý
                </h3>
                <div className="space-y-2">
                  {contactAnalysis?.contactsByHandler &&
                  Object.keys(contactAnalysis.contactsByHandler).length > 0 ? (
                    Object.entries(contactAnalysis.contactsByHandler).map(
                      ([handler, count], index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-indigo-50 rounded-lg"
                        >
                          <span className="text-sm text-gray-700 font-medium flex items-center">
                            <span className="mr-2">👨‍💼</span>
                            {handler}
                          </span>
                          <span className="font-semibold text-indigo-600">
                            {formatNumber(count)}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <span className="text-sm text-gray-500 italic">
                        🔍 Chưa có người xử lý được phân công
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          🕒 Hoạt Động Gần Đây
        </h2>
        {activitiesLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 animate-pulse"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activitiesError ? (
          <p className="text-red-600">
            ❌ Lỗi tải hoạt động: {activitiesError}
          </p>
        ) : recentActivities?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            🔍 Chưa có hoạt động nào gần đây
          </p>
        ) : (
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={`${activity.type}-${activity.id}-${index}`}
                className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-lg">
                      {getActivityIcon(activity.type)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mt-2 space-x-3">
                        <span>📅 {formatDate(activity.created_at)}</span>
                        {activity.user && activity.user !== "Chưa xử lý" && (
                          <span>👤 {activity.user}</span>
                        )}
                      </div>
                      {activity.note && (
                        <p className="text-xs text-blue-600 mt-1 italic">
                          💬{" "}
                          {activity.note.length > 50
                            ? activity.note.substring(0, 50) + "..."
                            : activity.note}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 ml-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          activity.status
                        )}`}
                      >
                        {activity.statusText || activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Show summary if there are more activities */}
            {(recentActivitiesData?.recentProjects?.length > 0 ||
              recentActivitiesData?.recentBlogs?.length > 0 ||
              recentActivitiesData?.recentContacts?.length > 0) && (
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex space-x-4">
                    <span>
                      🏗️ {recentActivitiesData?.recentProjects?.length || 0} dự
                      án
                    </span>
                    <span>
                      📝 {recentActivitiesData?.recentBlogs?.length || 0} bài
                      viết
                    </span>
                    <span>
                      📧 {recentActivitiesData?.recentContacts?.length || 0}{" "}
                      liên hệ
                    </span>
                  </div>
                  <button
                    onClick={() => (window.location.href = "/admin/activities")}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Xem tất cả →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          ⚡ Thao Tác Nhanh
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => (window.location.href = "/projects")}
            className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">➕</div>
            <p className="text-sm font-medium">Tạo Dự Án</p>
          </button>

          <button
            onClick={() => (window.location.href = "/blogs")}
            className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">✏️</div>
            <p className="text-sm font-medium">Viết Bài</p>
          </button>

          <button
            onClick={() => (window.location.href = "/contacts")}
            className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">📨</div>
            <p className="text-sm font-medium">Xem Liên Hệ</p>
          </button>

          <button
            onClick={() => (window.location.href = "/services")}
            className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">🔧</div>
            <p className="text-sm font-medium">Thêm Dịch Vụ</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
