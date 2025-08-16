import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CustomUploadAdapterPlugin } from "../../utils/uploadAdapter";
import "../../styles/ckeditor-custom.css";

const ProjectForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEditing = false,
  loading = false,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
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
            {/* Title and Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tiêu đề dự án *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tiêu đề dự án"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Năm thực hiện *
                </label>
                <input
                  type="number"
                  required
                  min="2000"
                  max="2050"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Diện tích *
              </label>
              <input
                type="text"
                required
                value={formData.area}
                onChange={(e) =>
                  setFormData({ ...formData, area: e.target.value })
                }
                placeholder="VD: 300m², 120m², 500m²"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                    // Optional: You can store the editor instance for later use
                    console.log("Editor is ready to use!", editor);
                  }}
                  onError={(error, { willEditorRestart }) => {
                    // If the editor is restarted, the toolbar element will be created once again.
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
                <option value="published">Đã xuất bản</option>
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
