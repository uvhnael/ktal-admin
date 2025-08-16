import React, { useState } from "react";
import ProjectForm from "./ProjectForm";

const ProjectFormDemo = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    year: new Date().getFullYear(),
    area: "",
    content: "",
    status: "draft",
  });

  const handleSubmit = () => {
    console.log("Form data submitted:", formData);
    alert("Dự án đã được lưu thành công! Kiểm tra console để xem dữ liệu.");
    setShowForm(false);
    // Reset form
    setFormData({
      title: "",
      year: new Date().getFullYear(),
      area: "",
      content: "",
      status: "draft",
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    // Reset form
    setFormData({
      title: "",
      year: new Date().getFullYear(),
      area: "",
      content: "",
      status: "draft",
    });
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Demo CKEditor với Upload Ảnh
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Hướng dẫn sử dụng:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Nhấn nút "Tạo dự án mới" để mở form</li>
            <li>Trong CKEditor, bạn có thể:</li>
            <ul className="list-disc list-inside ml-6 space-y-1">
              <li>Nhấn vào icon hình ảnh trên toolbar để upload</li>
              <li>Kéo thả ảnh trực tiếp vào editor</li>
              <li>Copy/paste ảnh từ clipboard</li>
              <li>Hỗ trợ định dạng: JPG, PNG, GIF, WebP</li>
            </ul>
            <li>Ảnh sẽ được upload tự động và hiển thị trong editor</li>
            <li>Bạn có thể chỉnh sửa kích thước, căn chỉnh ảnh</li>
          </ul>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
        >
          Tạo dự án mới
        </button>

        {showForm && (
          <ProjectForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEditing={false}
            loading={false}
          />
        )}

        {formData.content && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Preview nội dung:</h3>
            <div
              className="bg-white border border-gray-300 rounded-md p-4"
              dangerouslySetInnerHTML={{ __html: formData.content }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectFormDemo;
