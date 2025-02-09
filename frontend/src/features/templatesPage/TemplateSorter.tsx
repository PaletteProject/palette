import { useTemplatesContext } from "./TemplateContext.tsx";

const TemplateSorter = () => {
  const { sortConfig, setSortConfig } = useTemplatesContext();
  return (
    <>
      <select
        className="bg-gray-700 text-white px-3 py-2 rounded-lg"
        value={`${sortConfig.key}-${sortConfig.direction}`}
        onChange={(e) => {
          const [key, direction] = e.target.value.split("-");
          const newSortConfig = {
            key: key as typeof sortConfig.key,
            direction: direction as "asc" | "desc",
          };
          setSortConfig(newSortConfig);
        }}
      >
        {/* Sorting Options */}
        <option value="title-asc">Title (A-Z)</option>
        <option value="title-desc">Title (Z-A)</option>
        <option value="dateCreated-desc">Newest First</option>
        <option value="dateCreated-asc">Oldest First</option>
      </select>
    </>
  );
};

export default TemplateSorter;
