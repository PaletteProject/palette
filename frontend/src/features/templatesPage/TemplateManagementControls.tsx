import { useTemplatesContext } from "./TemplateContext.tsx";

const TemplateManagementControls = () => {
  const { layoutStyle, setLayoutStyle, showBulkActions, setShowBulkActions } =
    useTemplatesContext();

  return (
    <div className="flex items-center gap-4">
      {/* Add bulk actions toggle button */}
      <button
        onClick={() => setShowBulkActions(!showBulkActions)}
        className={`px-4 py-2 rounded-lg focus:outline-none  ${
          showBulkActions
            ? "bg-gray-700 text-white focus:ring-blue-500 focus:ring-2"
            : "bg-gray-700 text-gray-300"
        }`}
      >
        <i className="fas fa-tasks mr-2" /> Bulk Actions
      </button>

      {/* View Toggle */}
      <div className="flex items-center">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={layoutStyle === "grid"}
            onChange={() =>
              setLayoutStyle(layoutStyle === "list" ? "grid" : "list")
            }
          />
          <div className="w-[120px] h-8 bg-gray-700 rounded-full peer peer-checked:after:translate-x-[60px] after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-[56px] after:transition-all">
            <div className="flex justify-between items-center h-full px-2 text-sm">
              <span
                className={`${layoutStyle === "list" ? "text-white" : "text-gray-400"}`}
              >
                <i className="fas fa-list mr-1" /> List
              </span>
              <span
                className={`${layoutStyle === "grid" ? "text-white" : "text-gray-400"}`}
              >
                <i className="fas fa-grid-2 mr-1" /> Grid
              </span>
            </div>
          </div>
        </label>
      </div>
    </div>
  );
};

export default TemplateManagementControls;
