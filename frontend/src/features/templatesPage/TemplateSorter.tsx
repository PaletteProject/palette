import React, { useCallback } from "react";
import { Template } from "palette-types";

const TemplateSorter = ({
  sortConfig,
  setSortConfig,
  windowTemplates,
  searchQuery,
  selectedTagFilters,
}: {
  sortConfig: {
    key: "title" | "dateCreated" | "lastModified";
    direction: "asc" | "desc";
  };
  setSortConfig: React.Dispatch<
    React.SetStateAction<{
      key: "title" | "dateCreated" | "lastModified";
      direction: "asc" | "desc";
    }>
  >;
  windowTemplates: Template[];
  searchQuery: string;
  selectedTagFilters: string[];
}) => {
  const getSortedTemplates = (templatesToSort: Template[]) => {
    return [...templatesToSort].sort((a, b) => {
      switch (sortConfig.key) {
        case "title": {
          // Handle null/undefined titles by converting to empty string
          const titleA = a.title || "";
          const titleB = b.title || "";
          const comparison = titleA.localeCompare(titleB);
          return sortConfig.direction === "asc" ? comparison : -comparison;
        }
        case "dateCreated": {
          // Handle null/undefined dates by using 0 (earliest possible date)
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        }
        case "lastModified": {
          // Handle null/undefined dates by using 0 (earliest possible date)
          const modifiedA = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
          const modifiedB = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
          return sortConfig.direction === "asc"
            ? modifiedA - modifiedB
            : modifiedB - modifiedA;
        }
        default:
          return 0;
      }
    });
  };

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
