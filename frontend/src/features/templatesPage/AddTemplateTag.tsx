import { Tag, Template } from "palette-types";
import React from "react";

const AddTemplateTag = ({
  availableTags,
  selectedTagFilters,
  setSelectedTagFilters,
  templates,
  setTagModalOpen,
}: {
  availableTags: Tag[];
  selectedTagFilters: string[];
  setSelectedTagFilters: React.Dispatch<React.SetStateAction<string[]>>;
  templates: Template[];
  setTagModalOpen: (tagModalOpen: boolean) => void;
}) => {
  return (
    <div className="mb-4 flex flex-wrap gap-2 items-center">
      <span className="text-white">Filter by tags:</span>
      {availableTags.map((tag) => (
        <button
          key={tag.id}
          onClick={() =>
            setSelectedTagFilters((prev: string[]) =>
              prev.includes(tag.id)
                ? prev.filter((id: string) => id !== tag.id)
                : [...prev, tag.id],
            )
          }
          className={`px-3 py-1 rounded-full text-sm flex items-center gap-1
              ${
                selectedTagFilters.includes(tag.id)
                  ? "ring-2 ring-white"
                  : "opacity-70 hover:opacity-100"
              }`}
          style={{ backgroundColor: tag.color }}
        >
          {tag.name}
          <span className="text-xs">
            (
            {
              templates.filter((t) => t.tags.some((tTag) => tTag.id === tag.id))
                .length
            }
            )
          </span>
        </button>
      ))}
      {selectedTagFilters.length > 0 && (
        <button
          onClick={() => setSelectedTagFilters([])}
          className="px-3 py-1 rounded-full text-sm bg-gray-700 text-white hover:bg-gray-600"
        >
          Clear Filters
        </button>
      )}
      <button
        onClick={() => {
          setTagModalOpen(true);
        }}
        className="px-3 py-1 rounded-full text-sm bg-gray-700 text-white hover:bg-gray-600"
      >
        + New Tag
      </button>
    </div>
  );
};

export default AddTemplateTag;
