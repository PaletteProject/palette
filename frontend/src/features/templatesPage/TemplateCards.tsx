import {
  MouseEvent as ReactMouseEvent,
  ReactElement,
  useEffect,
  useState,
} from "react";

import { useSortable } from "@dnd-kit/sortable"; // Import useSortable
import { CSS } from "@dnd-kit/utilities"; // Import CSS utilities
import { Tag, Template } from "palette-types";
import { ChoiceDialog, Dialog } from "@components";
import TemplateTagCreator from "src/features/templatesPage/TemplateTagCreator.tsx";
import { useTemplatesContext } from "./TemplateContext.tsx";

import { GenericBuilder } from "src/components/layout/GenericBuilder.tsx";
import { useChoiceDialog } from "../../context/DialogContext.tsx";

interface TemplateCardProps {
  template: Template;
}

export default function TemplateCard({
  template,
}: TemplateCardProps): ReactElement {
  const {
    layoutStyle,
    handleUpdateTemplate,
    handleRemoveTemplate,
    templates,
    isNewTemplate,
    index,
    handleDuplicateTemplate,
    setViewOrEdit,
    editingTemplate,
    setEditingTemplate,
    focusedTemplateKey,
    setFocusedTemplateKey,
    setIsNewTemplate,
    setShowBulkActions,
    handleSubmitEditedTemplate,
    setViewingTemplate,
    hasUnsavedChanges,
    setHasUnsavedChanges,
  } = useTemplatesContext();
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const [viewOrEditClicked, setViewOrEditClicked] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  // Use the useSortable hook to handle criteria ordering
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: template?.key || "",
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCondensedViewClick = (event: ReactMouseEvent, key: string) => {
    event.preventDefault();
    const templateToFocus = templates.find((t) => t.key === key) as Template;
    setViewingTemplate(templateToFocus);
    setEditingTemplate(templateToFocus);
    // If clicking the currently focused template, unfocus it

    if (focusedTemplateKey === key) {
      setFocusedTemplateKey(null);
      setIsFocused(false);
    } else {
      // Focus this template and unfocus others
      setFocusedTemplateKey(key);
      setIsFocused(true);
    }
  };

  // Add effect to sync local focus state with global focused key
  useEffect(() => {
    setIsFocused(focusedTemplateKey === template?.key);
  }, [focusedTemplateKey, template?.key]);

  const handleSetAvailableTags = (tags: Tag[]) => {
    const updatedTemplate = { ...editingTemplate, tags };
    setEditingTemplate(updatedTemplate as Template);
    handleUpdateTemplate(index, updatedTemplate as Template);
    // setHasUnsavedChanges(true);
  };

  const submitTemplate = () => {
    handleSubmitEditedTemplate();
    setTemplateDialogOpen(false);
    setIsNewTemplate(false);
    setShowBulkActions(false);
    setHasUnsavedChanges(false);
  };

  const { openDialog, closeDialog } = useChoiceDialog();

  const handleCloseModal = () => {
    if (hasUnsavedChanges) {
      openDialog({
        title: "Lose unsaved changes?",
        message:
          "Are you sure you want to leave without saving your changes? Your changes will be lost.",
        buttons: [
          {
            autoFocus: true,
            label: "Yes",
            action: () => {
              closeDialog();
              setTemplateDialogOpen(false);
              setHasUnsavedChanges(false);
            },
          },
        ],
      });
    } else {
      setTemplateDialogOpen(false);
    }
  };

  const handleViewModeToggle = () => {
    if (focusedTemplateKey) {
      const focusedTemplate = templates.find(
        (t) => t.key === focusedTemplateKey,
      );
      if (focusedTemplate) {
        setEditingTemplate(focusedTemplate);
        console.log("focusedTemplate", focusedTemplate);
        console.log("editingTemplate", editingTemplate);
      }
    }
    setViewOrEdit("edit");
    setViewOrEditClicked(true);
    setTemplateDialogOpen(true);
  };

  const copyTemplate = (key: string) => {
    handleDuplicateTemplate(key);
  };

  const removeTemplate = (key: string) => {
    console.log("removing template", key);
    handleRemoveTemplate(key);
  };

  const renderCondensedView = () => {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`hover:bg-gray-500 hover:cursor-pointer max-h-12 flex justify-between items-center border border-gray-700 shadow-xl p-6 rounded-lg w-full bg-gray-700
          ${isFocused ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800" : ""}
          ${layoutStyle === "grid" && isFocused ? "shadow-2xl shadow-gray-900/50" : ""}
        }`}
        title="Click to toggle expansion"
        onClick={(event) => handleCondensedViewClick(event, template?.key)}
      >
        <div className="text-gray-300">
          <strong>{template?.title}</strong> - Points: {template?.points}
        </div>
      </div>
    );
  };

  const renderTemplateMetadata = () => {
    return (
      <div
        className={`bg-gradient-to-br from-gray-700 to-gray-600 p-4 border-4 border-gray-700 mt-4 rounded-lg w-full
          ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800`}
      >
        <div className="flex-1">
          <p className="text-gray-300 mt-2 line-clamp-2">
            This is where the description goes. Will update this later in the
            rubric builder later.
          </p>

          {/* Template Statistics */}
          <div className="text-sm text-gray-400 mt-4">
            <p>
              Created:{" "}
              {template?.createdAt
                ? new Date(template?.createdAt).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Never"}
            </p>
            <p>
              Last Used:{" "}
              {template?.lastUsed
                ? new Date(template?.lastUsed).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Never"}
            </p>
            <p>Times Used: {template?.usageCount || 0}</p>
            <p>
              Tags:{" "}
              {template?.tags?.length && template?.tags?.length > 0
                ? template?.tags.map((tag) => tag.name).join(", ")
                : "None"}
            </p>
            <p>Template Key: {template?.key}</p>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleViewModeToggle}
              className="transition-all ease-in-out duration-300 text-blue-400 hover:text-blue-500 focus:outline-none"
            >
              View
            </button>
            <button
              onClick={() => copyTemplate(template?.key)}
              className="transition-all ease-in-out duration-300 text-green-400 hover:text-green-500 focus:outline-none"
            >
              Copy
            </button>
            <button
              onPointerDown={() => removeTemplate(template?.key)}
              type="button"
              className="transition-all ease-in-out duration-300 text-red-600 hover:text-red-700 focus:outline-none"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`w-full `}>
        {renderCondensedView()}
        {isFocused && renderTemplateMetadata()}
      </div>
      {(isNewTemplate || viewOrEditClicked) && (
        <Dialog
          isOpen={templateDialogOpen}
          onClose={handleCloseModal}
          title={""}
          children={
            <GenericBuilder
              builderType="template"
              document={editingTemplate as Template}
              setDocument={(template) =>
                setEditingTemplate(template as Template)
              }
              onSubmit={submitTemplate}
            />
          }
        />
      )}

      {tagModalOpen && (
        <TemplateTagCreator
          isOpen={tagModalOpen}
          onClose={() => setTagModalOpen(false)}
          setAvailableTags={handleSetAvailableTags}
          onCreateTags={() => {
            setTagModalOpen(false);
          }}
        />
      )}

      {/* ModalChoiceDialog */}
      <ChoiceDialog />
    </>
  );
}
