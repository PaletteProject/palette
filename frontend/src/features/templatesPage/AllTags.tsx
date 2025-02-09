import React, { useCallback, useEffect, useState } from "react";
import { useTemplatesContext } from "./TemplateContext";
import { Tag, Template } from "palette-types";
import { useFetch } from "../../hooks/useFetch";
import { Choice, ChoiceDialog } from "@components";

const AllTags = ({ onSave }: { onSave: () => void }) => {
  const {
    availableTags,
    setAvailableTags,
    editingTemplate,
    addingTagFromBuilder,

    setEditingTemplate,
    templates,
  } = useTemplatesContext();

  useEffect(() => {
    console.log("availableTags in AllTags", availableTags);
    console.log("editingTemplate in AllTags", editingTemplate?.tags);
    setEditingTemplate(editingTemplate as Template);
  }, [editingTemplate]);

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const closeModal = useCallback(
    () => setModal((prevModal) => ({ ...prevModal, isOpen: false })),
    [],
  );

  // object containing related modal state

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    choices: [] as Choice[],
  });

  const { fetchData: deleteTags } = useFetch("/tags/bulk", {
    method: "DELETE",
    body: JSON.stringify(selectedTags),
  });

  const { fetchData: getAvailableTags } = useFetch("/tags", {
    method: "GET",
  });

  const getTags = async () => {
    const response = await getAvailableTags();
    const tags = response.data as Tag[];
    setAvailableTags(tags);
  };

  const removeTags = async () => {
    try {
      await deleteTags();
      setSelectedTags([]);
      await getTags();
    } catch (error) {
      console.error("error deleting tags", error);
    }
  };

  const [removeMode, setRemoveMode] = useState(false);

  const [tempTagCounts, setTempTagCounts] = useState<Record<string, number>>(
    {},
  );

  // Function to initialize or update the temporary tag counts
  const initializeTempTagCounts = () => {
    const counts = availableTags.reduce(
      (acc, tag) => {
        acc[tag.key] = templates.filter((t) =>
          t.tags.some((tTag) => tTag.key === tag.key),
        ).length;
        return acc;
      },
      {} as Record<string, number>,
    );
    setTempTagCounts(counts);
  };

  useEffect(() => {
    initializeTempTagCounts();
  }, [availableTags, templates]);

  const handleRemoveTags = () => {
    if (!addingTagFromBuilder) {
      setModal({
        isOpen: true,
        title: "Remove Tags",
        message:
          "Are you sure you want to remove the selected tags? This will effect all templates that use these tags.",
        choices: [
          { label: "Yes", action: () => void removeTags(), autoFocus: true },
          { label: "No", action: closeModal, autoFocus: false },
        ],
      });
    } else {
      setModal({
        isOpen: true,
        title: "Remove Tags",
        message: `Are you sure you want to remove the selected tag(s) from ${editingTemplate?.title}?`,
        choices: [
          {
            autoFocus: true,
            label: "Yes",
            action: () => {
              const updatedTags = editingTemplate?.tags?.filter(
                (t) =>
                  !selectedTags.some(
                    (selectedTag) => selectedTag.key === t.key,
                  ),
              );
              const updatedTemplate = {
                ...editingTemplate,
                tags: updatedTags || [],
              } as Template;
              setEditingTemplate(updatedTemplate);
              setSelectedTags([]);
              closeModal();

              // Update temporary tag counts
              const newTempTagCounts = { ...tempTagCounts };
              selectedTags.forEach((tag) => {
                if (newTempTagCounts[tag.key] > 0) {
                  newTempTagCounts[tag.key] -= 1;
                }
              });
              setTempTagCounts(newTempTagCounts);
            },
          },
          {
            autoFocus: false,
            label: "No",
            action: closeModal,
          },
        ],
      });
    }
  };

  const handleAddTagsToTemplate = async () => {
    if (editingTemplate) {
      const updatedTemplate = {
        ...editingTemplate,
        title: editingTemplate.title || "",
        tags: [...editingTemplate.tags, ...selectedTags],
      } as Template;
      setEditingTemplate(updatedTemplate);
      onSave();
      await getTags();
    }
    closeModal();
  };

  const getTagsOnTemplate = () => {
    return (
      editingTemplate?.tags?.filter((t) =>
        availableTags.some((t2) => t2.key === t.key),
      ) || []
    );
  };

  const getTagsNotOnTemplate = () => {
    return availableTags.filter((t) => !getTagsOnTemplate().includes(t));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="mt-4 border-gray-700 bg-gradient-to-br from-slate-900 to-gray-700 rounded-lg p-4 w-full">
        <div
          className="grid grid-cols-4 gap-4 gap-x-10 sm:gap-y-8 max-h-[500px]  rounded-lg overflow-auto 
          scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800 p-4"
        >
          {getTagsNotOnTemplate().map((tag, index) => (
            <span
              key={index}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                selectedTags.includes(tag) ? "ring-2 ring-white" : ""
              } ${
                editingTemplate?.tags.includes(tag)
                  ? "opacity-25 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              style={{ backgroundColor: tag.color }}
              onClick={() => {
                if (!editingTemplate?.tags.includes(tag)) {
                  setSelectedTags((prevSelected) => {
                    // Toggle selection of the tag
                    if (prevSelected.includes(tag)) {
                      return prevSelected.filter((t) => t !== tag);
                    } else {
                      const tagsOnTemplate = getTagsOnTemplate();
                      if (
                        prevSelected.some((t) => tagsOnTemplate.includes(t))
                      ) {
                        return [tag];
                      }
                      return [...prevSelected, tag];
                    }
                  });
                  setRemoveMode(false);
                }
              }}
              title={
                editingTemplate?.tags.includes(tag)
                  ? "This tag is already on the template"
                  : ""
              }
            >
              <span title={tag.name.length > 15 ? tag.name : undefined}>
                {tag.name.length > 15
                  ? `${tag.name.slice(0, 15)}...`
                  : tag.name}
              </span>
              <span className="text-xs">({tempTagCounts[tag.key] || 0})</span>
            </span>
          ))}
        </div>
        <hr className="my-4 border-gray-600" />
        <p className="text-gray-300 text-md  ">Tags on template</p>
        <div
          className="grid grid-cols-4 gap-4 gap-x-10 sm:gap-y-8 max-h-[500px]  rounded-lg overflow-auto 




          scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800 p-4"
        >
          {getTagsOnTemplate().map((tag, index) => (
            <span
              key={index}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                selectedTags.includes(tag) ? "ring-2 ring-white" : ""
              } ${
                !editingTemplate?.tags.includes(tag)
                  ? "opacity-25 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              style={{ backgroundColor: tag.color }}
              onClick={() => {
                if (editingTemplate?.tags.includes(tag)) {
                  setSelectedTags((prevSelected) => {
                    // Toggle selection of the tag
                    if (prevSelected.includes(tag)) {
                      return prevSelected.filter((t) => t !== tag);
                    } else {
                      const tagsNotOnTemplate = getTagsNotOnTemplate();
                      if (
                        prevSelected.some((t) => tagsNotOnTemplate.includes(t))
                      ) {
                        return [tag];
                      }
                      return [...prevSelected, tag];
                    }
                  });
                  setRemoveMode(true);
                }
              }}
              title={
                editingTemplate?.tags.includes(tag)
                  ? "This tag is already on the template"
                  : ""
              }
            >
              <span title={tag.name.length > 15 ? tag.name : undefined}>
                {tag.name.length > 15
                  ? `${tag.name.slice(0, 15)}...`
                  : tag.name}
              </span>
              <span className="text-xs">
                (
                {
                  templates.filter((t) =>
                    t.tags.some((tTag) => tTag.key === tag.key),
                  ).length
                }
                )
              </span>
            </span>
          ))}
        </div>
      </div>
      <div className="flex justify-between gap-4">
        {(selectedTags.length > 0 || addingTagFromBuilder) && (
          <div className="flex justify-between w-full">
            <div className="flex gap-4">
              {selectedTags.length > 0 && (
                <div className="flex gap-4">
                  {removeMode && (
                    <button
                      onClick={handleRemoveTags}
                      className="bg-red-500 text-white font-bold rounded-lg py-2 px-4 mr-4 hover:bg-red-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Remove
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedTags([])}
                    className="bg-yellow-500 text-white font-bold rounded-lg py-2 px-4 mr-4 hover:bg-yellow-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    Clear Selection
                  </button>

                  {!addingTagFromBuilder && (
                    <button
                      onClick={handleRemoveTags}
                      className="bg-red-500 text-white font-bold rounded-lg py-2 px-4 mr-4 hover:bg-red-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Remove Selected Tags
                    </button>
                  )}
                </div>
              )}
            </div>

            {addingTagFromBuilder && selectedTags.length > 0 && !removeMode && (
              <button
                onClick={() => void handleAddTagsToTemplate()}
                className="bg-green-500 text-white font-bold rounded-lg py-2 px-4 hover:bg-green-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Add Tags
              </button>
            )}
          </div>
        )}
      </div>

      {/* ModalChoiceDialog */}
      <ChoiceDialog
        show={modal.isOpen}
        onHide={closeModal}
        title={modal.title}
        message={modal.message}
        choices={modal.choices}
        excludeCancel={false}
      />
    </div>
  );
};

export default AllTags;
