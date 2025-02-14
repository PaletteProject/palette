import React, { useState } from "react";
import { Tag } from "palette-types";
import { useFetch } from "@hooks";
import { createTag } from "@utils";
import { useTemplatesContext } from "./TemplateContext";

interface TemplateTagCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  setAvailableTags: (tags: Tag[]) => void;
  onCreateTags: () => void;
}

const TemplateTagCreator = ({
  isOpen,
  onClose,
  onCreateTags,
}: TemplateTagCreatorProps) => {
  // Add state for tag creation modal
  const [newTag, setNewTag] = useState<Tag>(createTag());

  const [stagedTags, setStagedTags] = useState<Tag[]>([]);

  // Add state for selected tag index
  const [selectedTagIndex, setSelectedTagIndex] = useState<number | null>(null);

  const { fetchData: postTags } = useFetch("/tags/bulk", {
    method: "POST",
    body: JSON.stringify(stagedTags),
  });

  // Predefined colors for tags
  const tagColors = [
    "#C70039", // crimson
    "#EF4444", // red
    "#FF5733", // new color 1 (orange-red)
    "#F59E0B", // yellow/orange
    "#10B981", // green
    "#14B8A6", // teal
    "#0EA5E9", // blue
    "#4338CA", // indigo
    "#8B5CF6", // purple
    "#EC4899", // pink
    "#F472B6", // light pink
    "#9CA3AF", // gray
  ];

  // Placeholder suggestions
  const placeholderSuggestions = [
    "Enter tag name",
    "e.g. Sprint Planning",
    "e.g. Sprint Review",
    "e.g. Sprint Retrospective",
    "e.g. Sprint Backlog",
  ];

  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const { addingTagFromBuilder, editingTemplate, setEditingTemplate } =
    useTemplatesContext();

  // Add effect to rotate placeholders
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholderIndex(
        (prev) => (prev + 1) % placeholderSuggestions.length,
      );
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      setSelectedTag(null);
      setSelectedTagIndex(null);
      setStagedTags([]);
    }
  }, [isOpen]);

  const handleCreateTag = async () => {
    // Loop through each tag and perform a POST request
    console.log("addingTagFromBuilder", addingTagFromBuilder);
    if (addingTagFromBuilder && editingTemplate) {
      const updatedTags = [...editingTemplate.tags, ...stagedTags];
      const updatedTemplate = { ...editingTemplate, tags: updatedTags };
      setEditingTemplate(updatedTemplate);
      console.log("editingTemplate", editingTemplate.tags);
      onClose();
    } else {
      const response = await postTags();
      if (response.success) {
        console.log(response);
        onCreateTags();
        setSelectedTag(null);
        setSelectedTagIndex(null);
        setStagedTags([]);
        onClose();
      }
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="">
      <div className="flex flex-col gap-4">
        {/* Tag Name Input Section */}
        <div className="flex flex-col gap-2 w-full">
          <label className="block text-white mb">Tag Name</label>
          <p className="text-gray-400 text-sm">Max 25 characters</p>
          <div className="flex gap-2">
            <input
              type="text"
              className="bg-gray-600 text-white rounded-lg p-2 flex-1"
              value={newTag.name}
              onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
              placeholder={
                selectedTag === null
                  ? placeholderSuggestions[currentPlaceholderIndex]
                  : selectedTag.name
              }
              maxLength={25}
            />
            <button
              onClick={() => {
                if (newTag.name.trim()) {
                  setStagedTags((prev) => {
                    const updatedTags = [...prev, newTag];
                    setSelectedTag(newTag);
                    setSelectedTagIndex(updatedTags.length - 1);
                    return updatedTags;
                  });
                  setNewTag(createTag()); // Clear the input field
                }
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
              disabled={!newTag.name.trim()}
            >
              Stage Tag
            </button>
          </div>
        </div>

        {/* Tag ActionButtons Section */}
        {stagedTags.length > 0 && (
          <div className="flex justify-between gap-2 mt-4">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleCreateTag()
                    .then(() => {
                      console.log("tags created");
                    })
                    .catch((error) => {
                      console.error("error creating tags", error);
                    });
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                disabled={stagedTags.length === 0}
              >
                Create Tag(s)
              </button>
              <button
                onClick={() => {
                  setStagedTags((prev) =>
                    prev.map((tag) => ({
                      ...tag,

                      color:
                        tagColors[Math.floor(Math.random() * tagColors.length)],
                    })),
                  );
                }}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Randomize Colors
              </button>

              <button
                onClick={() => {
                  setStagedTags([]);
                  setSelectedTagIndex(null);
                  setSelectedTag(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                disabled={stagedTags.length === 0}
              >
                Clear All Tags
              </button>

              {selectedTagIndex !== null && (
                <button
                  onClick={() => {
                    setStagedTags((prev) =>
                      prev.filter((_, index) => index !== selectedTagIndex),
                    );
                    setSelectedTagIndex(null);
                    setSelectedTag(null);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  disabled={selectedTagIndex === null}
                >
                  Delete Selected Tag
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tag Colors Section */}
        <div className="flex flex-col gap-4 w-full">
          <label className="block text-white mb-4">Tag Colors</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 sm:gap-14 lg:gap-x-20 xl:gap-x-24 w-full border-2 border-gray-700 rounded-lg bg-gradient-to-br from-gray-700 to-slate-900 p-4 sm:p-10">
            {tagColors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color);
                  if (selectedTagIndex !== null) {
                    const updatedTags = stagedTags.map((tag, index) =>
                      index === selectedTagIndex ? { ...tag, color } : tag,
                    );
                    setStagedTags(updatedTags);
                    setSelectedTag({ ...stagedTags[selectedTagIndex], color });
                  }
                }}
                className={`w-10 h-10 rounded-full ${
                  selectedColor === color ? "ring-2 ring-white" : ""
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Preview section */}
        {stagedTags.length > 0 && (
          <div className="mt-4">
            <label className="block text-white mb-2">Preview:</label>

            <div className="flex flex-wrap gap-2">
              {stagedTags.map((tag, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-all ${
                    selectedTagIndex === index ? "ring-2 ring-white" : ""
                  }`}
                  style={{ backgroundColor: tag.color }}
                  onClick={() => {
                    if (selectedTagIndex === index) {
                      setSelectedTagIndex(null);
                      setSelectedTag(null);
                    } else {
                      setSelectedTagIndex(index);
                      setSelectedTag(tag);
                    }
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default TemplateTagCreator;
