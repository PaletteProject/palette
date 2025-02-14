import React, { useState } from "react";
import { MainPageTemplate } from "../../components/layout/MainPageTemplate.tsx";
import { quickStartTemplates } from "../../features/templatesPage/QuickStartTemplates.ts";
import { Template, Criteria } from "palette-types";
import TemplateSearch from "../../features/templatesPage/TemplateSearch.tsx";
import { useTemplatesContext } from "../../features/templatesPage/TemplateContext.tsx";
import { CSS } from "@dnd-kit/utilities"; // Import CSS utilities
import { useSortable } from "@dnd-kit/sortable";
import * as d3 from "d3";
import { PieChart } from "@mui/x-charts/PieChart";
const MetricsMain = () => {
  const [templatesExpanded, setTemplatesExpanded] = useState(false);
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(
    new Set()
  );
  const [selectedItem, setSelectedItem] = useState<{
    type: "template" | "criterion";
    key: string;
  } | null>(null);
  const { searchQuery, setSearchQuery, showSuggestions, setShowSuggestions } =
    useTemplatesContext();

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: selectedItem?.key || "",
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const pie = d3.pie().value((d: any) => d.value);
  const svg = d3
    .select("body")
    .append("pie-chart")
    .attr("width", 400)
    .attr("height", 400);
  svg.append("rect").attr("width", 400).attr("height", 400).attr("fill", "red");

  const renderTemplatesView = () => {
    return (
      <div className="flex flex-row">
        <div className="w-1/3 mx-8 py-4">
          <TemplateSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            onSearch={setSearchQuery}
          />
          <div
            className="h-2/3 max-h-2/3 py-4 from-gray-500 to-gray-600 bg-gradient-to-b border-2 border-black rounded-lg overflow-auto 
        scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800 "
          >
            {quickStartTemplates.map((template) => (
              <div
                className={`flex flex-col bg-gray-600 border-2 border-black rounded-lg px-4 mb-4 mx-4 py-2 ${
                  selectedItem?.type === "template" &&
                  selectedItem.key === template.key
                    ? "border-blue-400 border-4"
                    : selectedItem?.type === "criterion" &&
                        template.criteria.some(
                          (criterion) => criterion.key === selectedItem.key
                        )
                      ? "border-blue-400 border-4"
                      : ""
                }`}
                key={template.key}
              >
                <div
                  onClick={() => {
                    handleExpandTemplate(template.key);
                    handleSelectItem("template", template.key);
                  }}
                  className="flex flex-col"
                >
                  <h3 className="text-white text-md font-bold mb-2">
                    {template.title}
                  </h3>
                  {expandedTemplates.has(template.key) && (
                    <>
                      {template.criteria.map((criterion) => (
                        <div className="flex flex-row" key={criterion.key}>
                          <div
                            className={`hover:bg-gray-500 hover:cursor-pointer max-h-28 flex gap-1 justify-between items-center border mb-2 border-gray-700 shadow-lg rounded-lg w-full ${
                              selectedItem?.type === "criterion" &&
                              selectedItem.key === criterion.key
                                ? "border-blue-400 border-4"
                                : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectItem("criterion", criterion.key);
                            }}
                          >
                            <p className="text-white text-sm font-bold m-4 mr-0">
                              {criterion.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className="h-2/3 max-h-2/3 w-2/3 mx-8 py-4 bg-gray-600 border-2 border-black rounded-lg overflow-auto 
          scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800 mb-4 mt-16"
        >
          <div className="flex flex-col">
            <h3 className="text-white text-xl font-bold m-4 mr-0">Metrics</h3>
            {selectedItem && (
              <div className="text-white m-4">
                {selectedItem.type === "template" ? (
                  <>
                    <h2 className="text-white text-md font-bold">
                      Selected Template:{" "}
                      {
                        quickStartTemplates.find(
                          (template) => template.key === selectedItem.key
                        )?.title
                      }
                    </h2>
                    <p className="text-white text-sm font-bold">Criteria:</p>
                    <ul>
                      {quickStartTemplates
                        .find((template) => template.key === selectedItem.key)
                        ?.criteria.map((criterion) => (
                          <li key={criterion.key}>
                            {criterion.description} - Points:{" "}
                            {criterion.pointsPossible}
                          </li>
                        ))}
                    </ul>
                  </>
                ) : (
                  <div>
                    <h2 className="text-white text-md font-bold">
                      Selected Criterion:{" "}
                      {
                        quickStartTemplates
                          .flatMap((template) => template.criteria)
                          .find(
                            (criterion) => criterion.key === selectedItem.key
                          )?.description
                      }
                    </h2>
                    <p className="text-white text-sm font-bold"> Ratings: </p>
                    <ul>
                      {quickStartTemplates
                        .flatMap((template) => template.criteria)
                        .find((criterion) => criterion.key === selectedItem.key)
                        ?.ratings.map((rating, index) => (
                          <li key={index}>
                            {rating.description} - Points: {rating.points}
                          </li>
                        ))}
                    </ul>
                    <p>
                      {JSON.stringify(
                        countOccurrences(
                          quickStartTemplates
                            .flatMap((template) => template.criteria)
                            .find(
                              (criterion) => criterion.key === selectedItem.key
                            )?.scores
                        )
                      )}
                    </p>
                    {renderCharts(selectedItem.key)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCriteriaView = () => {
    return (
      <div className="flex flex-col">
        {quickStartTemplates.flatMap((template: Template) =>
          template.criteria.map((criterion: Criteria) => (
            <div
              key={criterion.key}
              className={`flex flex-col bg-gray-600 border-2 border-black rounded-lg overflow-auto 
                scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800 px-4 py-2 m-10`}
            >
              <div className="flex flex-row">
                <div
                  className={`hover:bg-gray-500 hover:cursor-pointer h-24 max-h-36 flex gap-2 justify-between items-center border border-gray-700 shadow-xl p-6 rounded-lg w-full bg-gray-700`}
                >
                  <p className="text-white text-sm font-bold m-10 mr-0">
                    {criterion.description}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const handleExpandAll = () => {
    setTemplatesExpanded(!templatesExpanded);
  };

  const handleExpandTemplate = (templateKey: string) => {
    setExpandedTemplates((prevExpandedTemplates) => {
      const newExpandedTemplates = new Set<string>();
      if (!prevExpandedTemplates.has(templateKey)) {
        newExpandedTemplates.add(templateKey);
      }
      return newExpandedTemplates;
    });
  };

  const handleSelectItem = (type: "template" | "criterion", key: string) => {
    setSelectedItem({ type, key });
  };

  const renderContent = () => {
    return (
      <div>
        <div className="flex flex-row justify-between items-center">
          <h3 className="text-white text-2xl font-bold m-10 mr-0">
            How your classes are performing?
          </h3>
        </div>
        {renderTemplatesView()}
      </div>
    );
  };

  const renderCharts = (criterionKey: string) => {
    const criterion = quickStartTemplates
      .flatMap((template) => template.criteria)
      .find((criterion) => criterion.key === criterionKey);

    const occurrences = countOccurrences(criterion?.scores);
    console.log("occurrences", occurrences);

    if (!criterion) return null;

    // Use the scores from the current criterion
    const scores = criterion.scores;

    return (
      <div>
        {/* Other chart rendering logic */}
        <PieChart
          colors={["red", "orange", "yellow", "green", "blue", "purple"]}
          series={[
            {
              data: Object.entries(occurrences).map(([score, count]) => {
                const rating = criterion.ratings.find(
                  (rating) => rating.points === Number(score)
                );
                return {
                  id: score,
                  value: count / scores.length,
                  label: rating?.description || score.toString(),
                };
              }),
              highlightScope: { fade: "global", highlight: "item" },
              faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
            },
          ]}
          width={800}
          height={200}
        />
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

  return <MainPageTemplate children={renderContent()} />;
};

export default MetricsMain;
