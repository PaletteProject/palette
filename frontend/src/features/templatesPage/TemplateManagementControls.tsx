import { useTemplatesContext } from "./TemplateContext.tsx";
const TemplateManagementControls = () => {
  const {
    layoutStyle,
    setLayoutStyle,
    showBulkActions,
    setShowBulkActions,
    showMetrics,
    setShowMetrics,
  } = useTemplatesContext();

  const renderViewToggle = () => {
    return (
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
    );
  };

  const renderMetricsToggle = () => {
    return (
      <div className="flex flex-col items-center mb-6">
        <p className="text-gray-400 text-xs mb-2">Metrics</p>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={showMetrics}
            onChange={() => setShowMetrics(!showMetrics)}
          />
          <div className="w-[120px] h-8 bg-gray-700 rounded-full peer peer-checked:after:translate-x-[60px] after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-[56px] after:transition-all">
            <div className="flex justify-between items-center h-full px-2 text-sm">
              <span
                className={`${!showMetrics ? "text-white" : "text-gray-400"}`}
              >
                <i className="fas fa-list mr-1" /> Hide
              </span>
              <span
                className={`${showMetrics ? "text-white" : "text-gray-400"}`}
              >
                <i className="fas fa-grid-2 mr-1" /> Show
              </span>
            </div>
          </div>
        </label>
      </div>
    );
  };

  const renderBulkActionsToggle = () => {
    return (
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
    );
  };

  return (
    <div className="flex items-center gap-4">
      {/* Metrics Toggle */}
      {renderMetricsToggle()}

      {/* View Toggle */}
      {renderViewToggle()}

      {/* Add bulk actions toggle button */}
      {renderBulkActionsToggle()}
    </div>
  );
};

export default TemplateManagementControls;
