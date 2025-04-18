import {
  MouseEvent as ReactMouseEvent,
  ReactElement,
  useEffect,
  useState,
} from "react";

import { useSortable } from "@dnd-kit/sortable"; // Import useSortable
import { CSS } from "@dnd-kit/utilities"; // Import CSS utilities
import { Criteria, Tag, Template } from "palette-types";
import { ChoiceDialog, Dialog } from "@/components";
import TemplateTagCreator from "@/features/templatesPage/TemplateTagCreator.tsx";
import { useTemplatesContext } from "./TemplateContext.tsx";
import { PieChart } from "@mui/x-charts/PieChart";
import { TemplateBuilder } from "@/features/templatesPage/TemplateBuilder.tsx";
import { useChoiceDialog } from "@/context/DialogContext.tsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

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
    showMetrics,
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

  useEffect(() => {
    setIsFocused(focusedTemplateKey === template?.key);
  }, [focusedTemplateKey, template?.key]);

  const handleSetAvailableTags = (tags: Tag[]) => {
    const updatedTemplate = { ...editingTemplate, tags };
    setEditingTemplate(updatedTemplate as Template);
    handleUpdateTemplate(index, updatedTemplate as Template);
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
        // console.log("focusedTemplate", focusedTemplate);
        // console.log("editingTemplate", editingTemplate);
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
          ${isFocused ? "ring-4 ring-blue-500 ring-offset-2 ring-offset-white" : ""}
          ${layoutStyle === "grid" && isFocused ? "shadow-2xl shadow-gray-900/50" : ""}
        }`}
        title="Click to toggle expansion"
        onClick={(event) => handleCondensedViewClick(event, template?.key)}
      >
        <div className="text-gray-300">
          <strong>{template?.title}</strong> - Points: {template?.points}
        </div>
        {showMetrics && (
          <div className="flex items-center w-1/2 mt-2">
            <p className="text-gray-300 mr-2">
              {calculatePerformance(template).toFixed(2)}%
            </p>
            <div className="flex-grow bg-gray-600 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full"
                style={{
                  width: `${calculatePerformance(template)}%`,
                  backgroundColor: interpolateColor(
                    calculatePerformance(template),
                  ),
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const [criteriaDropdownOpen, setCriteriaDropdownOpen] = useState(false);
  const [selectedCriterion, setSelectedCriterion] = useState<Criteria | null>(
    null,
  );

  const toggleCriteriaDropdown = () => {
    setCriteriaDropdownOpen((prev) => !prev);
  };

  const handleCriterionSelect = (criterion: Criteria) => {
    setSelectedCriterion(criterion);
    setCriteriaDropdownOpen(false);
  };

  const renderCriteriaDropdown = () => {
    if (!template?.criteria || template.criteria.length === 0) return null;

    return (
      <div className="relative">
        <button
          onClick={toggleCriteriaDropdown}
          className="transition-all ease-in-out duration-300 text-blue-400 hover:text-blue-500 focus:outline-none"
        >
          {criteriaDropdownOpen
            ? "Hide Criteria"
            : "Select Criterion for Metrics"}
        </button>
        {criteriaDropdownOpen && (
          <ul className="absolute bg-gray-700 border border-gray-600 rounded-lg mt-2 p-2 w-48">
            {template.criteria.map((criterion) => (
              <li
                key={criterion.key}
                className="text-gray-300 cursor-pointer hover:bg-gray-600"
                onClick={() => handleCriterionSelect(criterion)}
              >
                {criterion.description === ""
                  ? "Description not set"
                  : criterion.description}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const renderSelectedCriterion = () => {
    if (!selectedCriterion) return null;

    return (
      <div className="mt-4 p-2 w-2/3 bg-gray-700 text-gray-300 rounded-lg flex justify-between">
        <strong className="text-orange-400">Selected Criterion:</strong>{" "}
        {selectedCriterion.description}
        <button
          className="text-gray-300 mr-4"
          onClick={() => cycleToNextCriterion()}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    );
  };

  const handleHideMetrics = () => {
    setSelectedCriterion(null);
  };

  const renderTemplateMetadata = () => {
    return (
      <div
        className={`bg-gradient-to-br from-gray-700 to-gray-600 p-4 border-4 border-gray-700 mt-4 rounded-lg w-full
          ring-4 ring-blue-500 ring-offset-2 ring-offset-white`}
      >
        <div className="flex gap-4">
          <div className={`${layoutStyle === "grid" ? "w-1/2" : "w-1/3"}`}>
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

            {renderCriteriaDropdown()}
            {renderSelectedCriterion()}

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
              {selectedCriterion && (
                <button
                  onPointerDown={() => handleHideMetrics()}
                  type="button"
                  className="transition-all ease-in-out duration-300 text-orange-400 hover:text-orange-500 focus:outline-none"
                >
                  Hide Metrics
                </button>
              )}
            </div>
          </div>
          <div className={`${layoutStyle === "grid" ? "w-1/2" : "w-2/3"}`}>
            {selectedCriterion && (
              <>
                <div className="flex flex-col gap-4">
                  {renderCharts(selectedCriterion)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const countOccurrences = (data: number[] | undefined) => {
    if (!data) return {};
    return data.reduce((acc: Record<number, number>, curr: number) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {});
  };
  const renderCharts = (criterion: Criteria) => {
    const occurrences = countOccurrences(criterion?.scores);

    if (!criterion) return null;

    const scores = criterion.scores;

    return (
      <div>
        <h2
          className={`text-gray-300 text-lg font-bold ${
            layoutStyle === "grid" ? "ml-24" : "ml-72"
          } mb-4`}
        >
          {scores.length} Submissions
        </h2>
        <PieChart
          series={[
            {
              data: Object.entries(occurrences)
                .sort(([scoreA], [scoreB]) => Number(scoreB) - Number(scoreA))
                .map(([score, count]) => {
                  const rating = criterion.ratings.find(
                    (rating) => rating.points === Number(score),
                  );
                  return {
                    id: score,
                    value: count / scores.length,
                    label: rating
                      ? `${rating.description} (${rating.points} ${rating.points === 1 ? "pt" : "pts"})`
                      : score.toString(),
                  };
                }),
              highlightScope: { fade: "global", highlight: "item" },
              faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
            },
          ]}
          width={layoutStyle === "grid" ? 300 : 800}
          height={layoutStyle === "grid" ? 300 : 200}
        />
      </div>
    );
  };

  function calculatePerformance(template: Template): number {
    if (!template.criteria || template.criteria.length === 0) return 0;

    const totalPoints = template.criteria.reduce((sum, criterion) => {
      if (criterion.scores.length > 0) {
        return (
          sum +
          criterion.scores.reduce((a, b) => a + b, 0) / criterion.scores.length
        );
      }
      return sum;
    }, 0);

    const maxPoints = template.criteria.reduce((sum, criterion) => {
      return sum + criterion.pointsPossible;
    }, 0);
    return (totalPoints / maxPoints) * 100;
  }

  function interpolateColor(percentage: number): string {
    const red = Math.min(255, Math.floor((1 - percentage / 100) * 255));
    const green = Math.min(255, Math.floor((percentage / 100) * 255));
    return `rgb(${red}, ${green}, 0)`;
  }

  const cycleToNextCriterion = () => {
    if (!template.criteria || template.criteria.length === 0) return;

    const currentIndex = template.criteria.findIndex(
      (criterion) => criterion.key === selectedCriterion?.key,
    );

    const nextIndex = (currentIndex + 1) % template.criteria.length;
    setSelectedCriterion(template.criteria[nextIndex]);
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
            <TemplateBuilder
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
