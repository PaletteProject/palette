import React, { useState } from "react";
import { Dialog } from "@components";
import { Tag } from "palette-types";

interface TemplateTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  setAvailableTags: React.Dispatch<React.SetStateAction<Tag[]>>;
}

const TemplateTagModal = ({
  isOpen,
  onClose,
  setAvailableTags,
}: TemplateTagModalProps) => {
  interface StagedTag {
    name: string;
    color: string;
  }

  // Add state for tag creation modal
  const [newTag, setNewTag] = useState<{
    name: string;
    workingColor: string;
    stagedTags: StagedTag[];
  }>({
    name: "",
    workingColor: "#3B82F6",
    stagedTags: [],
  });

  // Predefined colors for tags
  const tagColors = [
    "#3B82F6", // blue
    "#EF4444", // red
    "#10B981", // green
    "#F59E0B", // yellow
    "#8B5CF6", // purple
    "#EC4899", // pink
    "#6366F1", // indigo
    "#14B8A6", // teal
  ];

  const handleCreateTag = () => {
    // Create new tags using the stored colors
    const newTags = newTag.stagedTags.map((tag) => ({
      id: crypto.randomUUID(),
      name: tag.name,
      color: tag.color,
    }));

    // Add new tags to availableTags
    setAvailableTags((prevTags: Tag[]) => [...prevTags, ...newTags]);

    // Reset form and close modal
    setNewTag({
      name: "",
      workingColor: "#3B82F6",
      stagedTags: [],
    });
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Create New Tags">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="block text-white mb-2">
            Tag Names (one per line)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              className="bg-gray-600 text-white rounded-lg p-2 flex-1"
              value={newTag.name}
              onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
              placeholder="Enter tag name"
            />
            <button
              onClick={() => {
                if (newTag.name.trim()) {
                  setNewTag((prev) => ({
                    ...prev,
                    stagedTags: [
                      ...prev.stagedTags,
                      {
                        name: prev.name.trim(),
                        color: prev.workingColor,
                      },
                    ],
                    name: "", // Clear the input after staging
                  }));
                }
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
              disabled={!newTag.name.trim()}
            >
              Stage Tag
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="block text-white mb-2">Tag Colors</label>
          <div className="grid grid-cols-4 gap-2">
            {tagColors.map((color) => (
              <button
                key={color}
                onClick={() => setNewTag({ ...newTag, workingColor: color })}
                className={`w-8 h-8 rounded-full ${
                  newTag.workingColor === color ? "ring-2 ring-white" : ""
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Preview section */}
        {newTag.stagedTags.length > 0 && (
          <div className="mt-4">
            <label className="block text-white mb-2">Preview:</label>
            <div className="flex flex-wrap gap-2">
              {newTag.stagedTags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Update create button logic */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => {
              handleCreateTag();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            disabled={newTag.stagedTags.length === 0}
          >
            Create Tag(s)
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default TemplateTagModal;
