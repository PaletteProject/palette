import React from "react";
import { useTemplatesContext } from "./TemplateContext";
import { Tag } from "palette-types";
import { useEffect, useState } from "react";
import { Dialog } from "../../components/modals/Dialog.tsx";
import { useFetch } from "../../hooks/useFetch";

const AllTags = () => {
  const { availableTags, setAvailableTags } = useTemplatesContext();

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTagIndex, setSelectedTagIndex] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  const { fetchData: deleteTags } = useFetch("/tags/bulk", {
    method: "DELETE",
    body: JSON.stringify(selectedTags),
  });

  const { fetchData: getAvailableTags } = useFetch("/tags", {
    method: "GET",
  });

  const handleTagClick = (tag: Tag) => {
    setSelectedTags((prevTags) => [...prevTags, tag]);
    setShowDialog(true);
  };

  const getTags = async () => {
    const response = await getAvailableTags();
    const tags = response.data as Tag[];
    setAvailableTags(tags);
  };

  const handleRemoveTags = () => {
    deleteTags();
    setSelectedTags([]);
    getTags();
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="mt-4 border-gray-700 bg-gradient-to-br from-slate-900 to-gray-700 rounded-lg p-4 w-full">
          <div className="grid grid-cols-4 gap-4 gap-x-10 sm:gap-y-8">
            {availableTags.map((tag, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-all ${
                  selectedTags.includes(tag) ? "ring-2 ring-white" : ""
                }`}
                style={{ backgroundColor: tag.color }}
                onClick={() => {
                  setSelectedTags((prevTags) =>
                    prevTags.includes(tag)
                      ? prevTags.filter((t) => t !== tag)
                      : [...prevTags, tag]
                  );
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
        {selectedTags.length > 0 && (
          <div className="w-full">
            <button
              onClick={handleRemoveTags}
              className="bg-red-500 text-white font-bold rounded-lg py-2 px-4 mr-4 hover:bg-red-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Remove Selected Tags
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AllTags;
