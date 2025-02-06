import { useFetch } from "@hooks";
import { useTemplatesContext } from "./TemplateContext";
import TemplateTagCreator from "src/features/templatesPage/TemplateTagCreator";
import { useEffect, useState } from "react";
import { Tag } from "palette-types";
const AddTemplateTag = () => {
  const {
    templates,
    selectedTagFilters,
    setSelectedTagFilters,
    availableTags,
    setTagModalOpen,

    tagModalOpen,
    setAvailableTags,
    setAddingTagFromBuilder,
  } = useTemplatesContext();

  const { fetchData: getAvailableTags } = useFetch("/tags", {
    method: "GET",
  });

  const getTags = async () => {
    console.log("getting tags");
    const response = await getAvailableTags();
    const tags = response.data as Tag[];
    setAvailableTags(tags);
  };

  useEffect(() => {
    getTags();
  }, []);

  useEffect(() => {
    console.log(availableTags);
  }, [availableTags]);

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <span className="text-white">Filter by tags:</span>
        {availableTags.map((tag) => (
          <button
            key={tag.key}
            onClick={() =>
              setSelectedTagFilters(
                selectedTagFilters.includes(tag.key)
                  ? selectedTagFilters.filter((t) => t !== tag.key)
                  : [...selectedTagFilters, tag.key]
              )
            }
            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1
              ${
                selectedTagFilters.includes(tag.key)
                  ? "ring-2 ring-white"
                  : "opacity-70 hover:opacity-100"
              }`}
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
            <span className="text-xs">
              (
              {
                templates.filter((t) =>
                  t.tags.some((tTag) => tTag.key === tag.key)
                ).length
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
            setAddingTagFromBuilder(false);
          }}
          className="px-3 py-1 rounded-full text-sm bg-gray-700 text-white hover:bg-gray-600"
        >
          + New Tag
        </button>
      </div>

      <TemplateTagCreator
        isOpen={tagModalOpen}
        onClose={() => setTagModalOpen(false)}
        setAvailableTags={setAvailableTags}
        onCreateTags={() => {
          setTagModalOpen(false);
          getTags();
        }}
      />
    </>
  );
};

export default AddTemplateTag;
