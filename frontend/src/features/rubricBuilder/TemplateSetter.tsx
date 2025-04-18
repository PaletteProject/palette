import { ChangeEvent, useEffect, useState } from "react";

import { Template } from "palette-types/dist/types/Template.ts";
import { createTemplate } from "@/utils/templateFactory.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { Criteria } from "palette-types";
import { useFetch } from "@/hooks";

interface TemplateSetterProps {
  closeTemplateCard: () => void; // callback to close the template setter card
  handleSetTemplateTitle: (event: ChangeEvent<HTMLInputElement>) => void;
  criterion: Criteria;
}

const TemplateSetter: React.FC<TemplateSetterProps> = ({
  closeTemplateCard,
  handleSetTemplateTitle,
  criterion,
}: TemplateSetterProps) => {
  const [template, setTemplate] = useState<Template>(createTemplate() || null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [updatingExistingTemplate, setUpdatingExistingTemplate] =
    useState(false);
  const [creatingNewTemplate, setCreatingNewTemplate] = useState(false);
  const [selectedTemplateTitle, setSelectedTemplateTitle] = useState("");
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [isValidTitle, setIsValidTitle] = useState(false);

  const { fetchData: postTemplate } = useFetch("/templates", {
    method: "POST",
    body: JSON.stringify(template), // use latest rubric data
  });

  const { fetchData: putTemplate } = useFetch("/templates", {
    method: "PUT",
    body: JSON.stringify(template),
  });

  const { fetchData: getAllTemplates } = useFetch("/templates", {
    method: "GET",
  });

  useEffect(() => {
    (async () => {
      const response = await getAllTemplates();
      if (response.success) {
        setTemplates(response.data as Template[]);
      }
    })().catch((error) => {
      console.error("Failed to fetch templates:", error);
    });
  }, []);

  useEffect(() => {
    if (creatingNewTemplate) {
      (async () => {
        const postResponse = await postTemplate();
        if (postResponse.success) {
          console.log("template created");
          closeTemplateCard();
        }
      })().catch((error) => {
        console.error("Failed to fetch templates:", error);
      });
    }
  }, [template]);

  const handleTemplateTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const textAreaTitle = event.target.value;
    // Validate that the title contains at least one letter and isn't just whitespace
    const isValid = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s]{1,}$/.test(
      textAreaTitle.trim(),
    );
    setIsValidTitle(isValid);
    setSelectedTemplateTitle(isValid ? textAreaTitle.trim() : "");
    if (isValid) {
      handleSetTemplateTitle(event);
    }
  };

  // set the template name field of the current criterion and add it to the template.
  // send the template up to the criterion input so that it can detect changes and update the
  // criterion within the template.
  const handleSave = async () => {
    if (updatingExistingTemplate) {
      const response = await putTemplate();
      if (response.success) {
        closeTemplateCard();
      }
    } else {
      // Create the finalized template directly instead of relying on state
      const newCriterion = { ...criterion };
      newCriterion.template = template.key;
      newCriterion.templateTitle = criterion.templateTitle;
      const finalizedTemplate = {
        ...template,
        criteria: [...template.criteria, newCriterion],
        title: selectedTemplateTitle,
      };
      setCreatingNewTemplate(true);
      setTemplate(finalizedTemplate);
    }
  };

  const handleSelectedExistingTemplate = (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    event.preventDefault();
    setUpdatingExistingTemplate(true);
    let textAreaTemplateTitle = event.currentTarget.textContent || "";

    // Remove specific substring if present (e.g., " - (Already contains criterion)")
    textAreaTemplateTitle = textAreaTemplateTitle.replace(
      " - (Already contains this criterion)",
      "",
    );

    console.log("textAreaTemplateTitle", textAreaTemplateTitle);

    const existingTemplate = templates.find(
      (t) => t.title.trim() === textAreaTemplateTitle.trim(),
    );

    if (existingTemplate) {
      // Check if criterion already exists in template
      const criterionExists = existingTemplate.criteria.some(
        (c) => c.key === criterion.key,
      );
      if (criterionExists) {
        criterion.templateTitle = "";
        criterion.template = "";
        setSelectedTemplateTitle("");
        setIsValidTitle(false);
      } else {
        criterion.templateTitle = existingTemplate.title;
        criterion.template = existingTemplate.key;
        setSelectedTemplateTitle(existingTemplate.title);
        const isValid = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s!.,?-]{1,}$/.test(
          existingTemplate.title.trim(),
        );
        setIsValidTitle(isValid);
        setSelectedTemplateTitle(isValid ? existingTemplate.title.trim() : "");
        setIsValidTitle(true);
        setTemplate({
          ...existingTemplate,
          criteria: [...existingTemplate.criteria, criterion],
        });
      }
    }
  };

  const handleOpenTemplates = () => {
    setTemplatesOpen(!templatesOpen);
  };

  return (
    <div className="border border-gray-700 p-6 rounded-lg shadow-xl bg-gray-700">
      <div className={"flex justify-between items-center"}>
        <button
          className="px-1 py-4 text-2xl font-bond text-gray-950 hover:opacity-80 transition duration-300 transform hover:scale-105"
          onClick={handleOpenTemplates}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        {selectedTemplateTitle &&
        selectedTemplateTitle !== "" &&
        isValidTitle ? (
          <div className="flex-grow flex items-center justify-between gap-4 mt-4">
            <div className="flex-grow flex flex-col items-center justify-center">
              <p className="text-xl font-semibold text-gray-200 bg-gray-500 px-3 py-1 rounded-full">
                {selectedTemplateTitle.length > 30
                  ? `${selectedTemplateTitle.slice(0, 30)}...`
                  : selectedTemplateTitle}
              </p>
              <p className="text-sm font-semibold mt-2 text-green-500">
                Template Name Valid
              </p>
            </div>
            <button
              onClick={() => void handleSave()}
              className="h-10 bg-green-600 text-white font-bold rounded-lg py-2 px-4 transition duration-300 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center mt-4">
            <div>
              <p className="text-xl font-semibold mt-2 text-gray-200 bg-gray-500 px-3 py-1 rounded-full text-center">
                No Template Selected
              </p>
              <p className="text-sm font-semibold mt-2 text-red-500">
                Please enter a valid template name with at least one letter.
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        placeholder="Enter Template Name"
        onChange={handleTemplateTitleChange}
        className="w-full mt-4 border border-gray-600 rounded-lg p-3 text-gray-300 hover:bg-gray-800 transition duration-300 cursor-pointer focus:outline-none"
      />

      {templatesOpen && (
        <div className="mt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 h-48">
          {templates.length === 0 ? (
            <div className="text-center text-gray-300">
              No Existing Templates Available
            </div>
          ) : (
            templates.map((t, tKey) => {
              const criterionExists = t.criteria.some(
                (c) => c.key === criterion.key,
              );
              return (
                <div
                  key={tKey}
                  onClick={(event) =>
                    void handleSelectedExistingTemplate(event)
                  }
                  className={`${criterionExists ? "opacity-50 cursor-not-allowed text-center border border-gray-600 rounded-lg p-2" : "hover:bg-gray-600 text-center border border-gray-600 rounded-lg p-2"}`}
                >
                  {t.title}{" "}
                  {criterionExists && " - (Already contains this criterion)"}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
export default TemplateSetter;
