import React, { useState } from "react";

import { useTemplatesContext } from "./TemplateContext";
import { BarChart, PieChart } from "@mui/x-charts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Template } from "palette-types";

const TemplateCharts = () => {
  const { templates, showMetrics } = useTemplatesContext();

  const metricViews = ["bar", "pie"];
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    templates[0],
  );

  const [selectedMetricView, setSelectedMetricView] = useState<string>(
    metricViews[0],
  );

  const [currentViewIndex, setCurrentViewIndex] = useState<number>(0);

  const renderBarCharts = () => {
    return templates.map((template) => {
      return (
        <div key={template.key} className="flex flex-wrap gap-4">
          <h3 className="text-center w-full font-bold ">{template.title}</h3>
          <BarChart
            colors={["gray", "blue", "green", "red"]}
            slotProps={{
              legend: {
                hidden: false,
              },
              loadingOverlay: {
                message: "Loading...",
              },
            }}
            xAxis={[
              {
                scaleType: "band",
                data: template.criteria.map(
                  (c) => `${c.description} (${c.pointsPossible} pts)`,
                ),
              },
            ]}
            series={[
              {
                data: template.criteria.map((c) => {
                  const percentage =
                    c.scores.length > 0
                      ? (c.scores.reduce((a, b) => a + b, 0) /
                          c.scores.length /
                          c.pointsPossible) *
                        100
                      : 0;
                  return percentage;
                }),
              },
            ]}
            width={500}
            height={300}
          />
        </div>
      );
    });
  };

  const TemplateSelector = () => {
    return (
      <>
        <select
          className="bg-gray-700 text-white px-3 py-2 rounded-lg"
          value={selectedTemplate?.title}
          onChange={(e) => {
            const template = templates.find((t) => t.title === e.target.value);
            if (template) {
              setSelectedTemplate(template);
            }
            console.log("template", e.target.value);
          }}
        >
          {templates.map((template) => (
            <option value={template.title}>{template.title}</option>
          ))}
        </select>
      </>
    );
  };

  const handleMetricViewChange = (view: string) => {
    console.log("view", view);
    setSelectedMetricView(view);
  };

  const countOccurrences = (data: number[] | undefined) => {
    if (!data) return {};
    return data.reduce((acc: Record<number, number>, curr: number) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {});
  };

  const renderPieCharts = () => {
    if (!selectedTemplate) return null;

    const criteriaData = selectedTemplate.criteria.map((criterion) => {
      const occurrences = countOccurrences(criterion.scores);
      const scores = criterion.scores;

      return {
        criterionTitle: criterion.description,
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
      };
    });

    return criteriaData.map(
      ({
        criterionTitle,
        data,
      }: {
        criterionTitle: string;
        data: { id: string; value: number; label: string }[];
      }) => (
        <div className="flex flex-wrap gap-4">
          <div key={criterionTitle}>
            <h2 className={`text-gray-300 text-lg font-bold mb-4 ml-24`}>
              {criterionTitle}
            </h2>
            <PieChart
              series={[
                {
                  data,
                  highlightScope: { fade: "global", highlight: "item" },
                  faded: {
                    innerRadius: 30,
                    additionalRadius: -30,
                    color: "gray",
                  },
                },
              ]}
              width={500}
              height={300}
            />
          </div>
        </div>
      ),
    );
  };

  const renderMetrics = () => {
    if (!showMetrics) return null;

    const totalSubmissions = selectedTemplate
      ? selectedTemplate.criteria[0].scores.length
      : 0;

    return (
      <div className="flex flex-col gap-4 mt-10 bg-gray-600 p-4 rounded-lg">
        <div className="flex justify-between items-center w-full">
          <div className="flex-1">
            {selectedMetricView === "bar" && (
              <div className="flex flex-row gap-2">
                <p className="text-left text-gray-400">
                  Total Submissions({totalSubmissions}) -{" "}
                </p>
                <p className="text-left text-gray-400">
                  Legend: (Y Axis = % of Total Submissions) (X Axis = Criteria)
                </p>
              </div>
            )}
            {selectedMetricView === "pie" && (
              <div className="flex flex-row gap-2">
                <p className="text-left text-gray-400">
                  Total Submissions({totalSubmissions}) -{" "}
                </p>
                <p className="text-left text-gray-400">
                  Criteria({selectedTemplate?.criteria.length})
                </p>
              </div>
            )}
            {selectedMetricView === "scatter" && (
              <p className="text-left text-gray-400">
                Total Submissions({totalSubmissions})
              </p>
            )}
          </div>
          {selectedMetricView === "pie" && (
            <div className="flex justify-end items-center">
              <p className="text-left mr-2 text-gray-400">Template: </p>
              <TemplateSelector />
            </div>
          )}
          <button
            onClick={() => {
              setCurrentViewIndex((currentViewIndex + 1) % metricViews.length);
              handleMetricViewChange(metricViews[currentViewIndex]);
            }}
            className="bg-gray-700 px-4 py-2 rounded-lg ml-2"
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 bg-gray-700 p-4 rounded-lg">
          {selectedMetricView === "bar" && renderBarCharts()}
          {selectedMetricView === "pie" && renderPieCharts()}
        </div>
      </div>
    );
  };
  return <div>{renderMetrics()}</div>;
};

export default TemplateCharts;
