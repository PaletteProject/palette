import React, { useEffect, useState } from "react";
import { useTemplatesContext } from "./TemplateContext";
import { Tag, Template } from "palette-types";
import { useFetch } from "../../hooks/useFetch";
import { ChoiceDialog } from "@components";
import TemplateTagCreator from "./TemplateTagCreator";
import { useChoiceDialog } from "src/context/DialogContext";

const AllTags = ({ onSave }: { onSave: () => void }) => {
  const {
    availableTags,
    setAvailableTags,
    editingTemplate,
    addingTagFromBuilder,
    setTagModalOpen,
    tagModalOpen,
    setEditingTemplate,
    templates,
    setTemplates,
    setHasUnsavedChanges,
  } = useTemplatesContext();

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<Template[]>([]);
  const [updatingTemplates, setUpdatingTemplates] = useState(false);

  const { openDialog, closeDialog } = useChoiceDialog();

  useEffect(() => {
    async function updateTemplates() {
      if (updatingTemplates) {
        const response = await putTemplates();
        if (response.success) {
          console.log("templates updated");
        }
      }
    }

    async function fetchTemplates() {
      if (updatingTemplates) {
        const response = await getAllTemplates();
        setTemplates(response.data as Template[]);
      }
    }
    updateTemplates()
      .then(() => {
        fetchTemplates()
          .then(() => {
            console.log("templates fetched");
          })
          .catch((error) => {
            console.error("error fetching templates", error);
          });
      })
      .catch((error) => {
        console.error("error updating templates", error);
      });
  }, [selectedTemplates]);

  const { fetchData: deleteTags } = useFetch("/tags/bulk", {
    method: "DELETE",
    body: JSON.stringify(selectedTags),
  });

  const { fetchData: getAvailableTags } = useFetch("/tags", {
    method: "GET",
  });

  const { fetchData: putTemplates } = useFetch("/templates/bulk", {
    method: "PUT",
    body: JSON.stringify(selectedTemplates),
  });

  const { fetchData: getAllTemplates } = useFetch("/templates", {
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

      // Update all templates by removing the selected tags
      const updatedTemplates = templates.map((template) => {
        const updatedTags = template.tags.filter(
          (tag) =>
            !selectedTags.some((selectedTag) => selectedTag.key === tag.key),
        );
        return { ...template, tags: updatedTags };
      });
      setUpdatingTemplates(true);
      setSelectedTemplates(updatedTemplates);
      await getTags();
      closeDialog();
      onSave();
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
      openDialog({
        title: "Remove Tags",
        message:
          "Are you sure you want to remove the selected tags? This will effect all templates that use these tags.",
        excludeCancel: false,
        buttons: [
          {
            label: "Yes",
            action: () => {
              removeTags()
                .then(() => {
                  setHasUnsavedChanges(true);
                })
                .catch((error) => {
                  console.error("error removing tags", error);
                });
            },
            autoFocus: true,
          },
          { label: "No", action: closeDialog, autoFocus: false },
        ],
      });
    } else {
      openDialog({
        title: "Remove Tags",
        message: `Are you sure you want to remove the selected tag(s) from ${editingTemplate?.title}?`,
        excludeCancel: false,
        buttons: [
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
              closeDialog();

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
            action: closeDialog,
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
    closeDialog();
  };

  const getTagsOnTemplate = () => {
    const tagsOnTemplate =
      editingTemplate?.tags?.filter((t) =>
        availableTags.some((t2) => t2.key === t.key),
      ) || [];
    return tagsOnTemplate;
  };

  const getTagsNotOnTemplate = () => {
    const tagsOnTemplateKeys = new Set(getTagsOnTemplate().map((t) => t.key));
    const tagsNotOnTemplate = availableTags.filter(
      (t) => !tagsOnTemplateKeys.has(t.key),
    );
    return tagsNotOnTemplate;
  };

  const renderTags = () => {
    return (
      <>
        {addingTagFromBuilder && (
          <p className="text-gray-300 text-md  ">
            Tag(s) not on "{editingTemplate?.title}"
          </p>
        )}
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
        {addingTagFromBuilder && (
          <>
            <hr className="my-4 border-gray-600" />
            <p className="text-gray-300 text-md  ">
              Tag(s) on "{editingTemplate?.title}"
            </p>
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
                            prevSelected.some((t) =>
                              tagsNotOnTemplate.includes(t),
                            )
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
          </>
        )}
      </>
    );
  };

  const renderNoTags = () => {
    return (
      <div>
        <p className="text-gray-300 text-md text-start mt-4">
          No tags found.{" "}
          <button
            onClick={() => {
              setTagModalOpen(true);
              onSave();
            }}
            className="text-blue-500 underline hover:text-blue-700 focus:outline-none"
          >
            Create
          </button>{" "}
          some tags to the template to get started.
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {getTagsNotOnTemplate().length > 0 || getTagsOnTemplate().length > 0 ? (
        <div className="mt-4 border-gray-700 bg-gradient-to-br from-slate-900 to-gray-700 rounded-lg p-4 w-full">
          {renderTags()}
        </div>
      ) : (
        renderNoTags()
      )}
      <div className="flex justify-between gap-4">
        {(selectedTags.length > 0 || addingTagFromBuilder) && (
          <div className="flex justify-between w-full">
            <div className="flex gap-4">
              {selectedTags.length > 0 && (
                <div className="flex gap-4">
                  {removeMode && (
                    <button
                      onClick={() => {
                        handleRemoveTags();
                        setHasUnsavedChanges(true);
                      }}
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
                onClick={() => {
                  handleAddTagsToTemplate()
                    .then(() => {
                      setHasUnsavedChanges(true);
                    })
                    .catch((error) => {
                      console.error("error adding tags to template", error);
                    });
                }}
                className="bg-green-500 text-white font-bold rounded-lg py-2 px-4 hover:bg-green-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Add Tags
              </button>
            )}
          </div>
        )}
      </div>

      {/* ModalChoiceDialog */}
      <ChoiceDialog />
      <TemplateTagCreator
        isOpen={tagModalOpen}
        onClose={() => setTagModalOpen(false)}
        setAvailableTags={setAvailableTags}
        onCreateTags={() => {
          console.log("onCreateTags");
          onSave();
          setTagModalOpen(false);
          closeDialog();
          getTags()
            .then(() => {
              console.log("tags fetched");
            })
            .catch((error) => {
              console.error("error fetching tags", error);
            });
        }}
      />
    </div>
  );
};

export default AllTags;
