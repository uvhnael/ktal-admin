import React, { useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CustomUploadAdapterPlugin } from "../../utils/uploadAdapter";
import { fileAPI } from "../../services/api";
import "../../styles/ckeditor-custom.css";

const ProjectForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEditing = false,
  loading = false,
}) => {
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  useEffect(() => {
    if (formData.thumbnail) {
      setThumbnailPreview(formData.thumbnail);
    }
  }, [formData.thumbnail]);

  // Function to generate slug from title
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

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title: title,
      slug: generateSlug(title),
    });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let updatedFormData = { ...formData };

    // Handle thumbnail upload if there's a new file
    if (thumbnailFile) {
      try {
        const response = await fileAPI.uploadImage(thumbnailFile);
        console.log("Thumbnail upload response:", response);
        if (response.data && response.data.url) {
          updatedFormData = {
            ...updatedFormData,
            thumbnail: response.data.url,
          };
        }
      } catch (error) {
        console.error("Error uploading thumbnail:", error);
      }
    }

    // Pass the updated form data to parent's onSubmit
    onSubmit(updatedFormData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-5 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {isEditing ? "Chỉnh sửa dự án" : "Thêm dự án mới"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 max-h-[80vh] overflow-y-auto"
          >
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tiêu đề dự án *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={handleTitleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tiêu đề dự án"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="slug-du-an"
              />
              <p className="text-xs text-gray-500 mt-1">
                Slug được tạo tự động từ tiêu đề, bạn có thể chỉnh sửa nếu cần
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mô tả ngắn
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mô tả ngắn về dự án (tối đa 500 ký tự)"
                maxLength={500}
              />
            </div>

            {/* Year and Area */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Năm thực hiện
                </label>
                <input
                  type="number"
                  min="2000"
                  max="2050"
                  value={formData.year || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Khu vực
                </label>
                <input
                  type="text"
                  value={formData.area || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, area: e.target.value })
                  }
                  placeholder="VD: Hà Nội, TP. Hồ Chí Minh, Đà Nẵng..."
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Thumbnail Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ảnh đại diện
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="block w-full text-sm text-gray-500 
                    file:mr-4 file:py-2 file:px-4 
                    file:rounded-md file:border-0 
                    file:text-sm file:font-semibold 
                    file:bg-blue-50 file:text-blue-700 
                    hover:file:bg-blue-100"
                />
                {thumbnailPreview && (
                  <div className="relative w-20 h-20">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnailPreview(null);
                        setThumbnailFile(null);
                        setFormData({ ...formData, thumbnail: null });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ảnh đại diện cho dự án. Khuyến nghị tỷ lệ 16:9
              </p>
            </div>

            {/* Rich Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung dự án
              </label>
              <div className="border border-gray-300 rounded-md overflow-hidden">
                <CKEditor
                  editor={ClassicEditor}
                  data={formData.content}
                  config={{
                    extraPlugins: [CustomUploadAdapterPlugin],
                    toolbar: [
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "underline",
                      "strikethrough",
                      "|",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "outdent",
                      "indent",
                      "|",
                      "blockQuote",
                      "insertTable",
                      "|",
                      "link",
                      "imageUpload",
                      "|",
                      "undo",
                      "redo",
                    ],
                    placeholder: "Nhập nội dung chi tiết về dự án...",
                    image: {
                      toolbar: [
                        "imageTextAlternative",
                        "imageStyle:full",
                        "imageStyle:side",
                        "linkImage",
                      ],
                      styles: [
                        "full",
                        "side",
                        "alignLeft",
                        "alignCenter",
                        "alignRight",
                      ],
                      resizeOptions: [
                        {
                          name: "resizeImage:original",
                          value: null,
                          label: "Original",
                        },
                        {
                          name: "resizeImage:50",
                          value: "50",
                          label: "50%",
                        },
                        {
                          name: "resizeImage:75",
                          value: "75",
                          label: "75%",
                        },
                      ],
                      resizeUnit: "%",
                    },
                  }}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    setFormData({ ...formData, content: data });
                  }}
                  onReady={(editor) => {
                    console.log("Editor is ready to use!", editor);
                  }}
                  onError={(error, { willEditorRestart }) => {
                    if (willEditorRestart) {
                      console.log("Editor will restart");
                    }
                    console.error("CKEditor error:", error);
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Bạn có thể kéo thả hoặc dán ảnh trực tiếp vào editor. Hỗ trợ
                định dạng: JPG, PNG, GIF, WebP
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Bản nháp</option>
                <option value="in_progress">Đang thực hiện</option>
                <option value="completed">Hoàn thành</option>
                <option value="archived">Đã lưu trữ</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang lưu..." : isEditing ? "Cập nhật" : "Thêm"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;
