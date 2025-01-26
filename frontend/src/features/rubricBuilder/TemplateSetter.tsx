import { ChangeEvent, useEffect, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Template } from "../../../../palette-types/src/types/Template";
import { createTemplate } from "../../utils/templateFactory";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { Criteria } from "palette-types";
import { useFetch } from "@hooks";
import { PopUp } from "@components";

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
  const [criterionAdded, setCriterionAdded] = useState(false);
  const [updatingExistingTemplate, setUpdatingExistingTemplate] =
    useState(false);
  const [selectedTemplateTitle, setSelectedTemplateTitle] = useState("");
  const [templatesOpen, setTemplatesOpen] = useState(false);
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
    console.log("useEffect");
    (async () => {
      const response = await getAllTemplates();
      if (response.success) {
        setTemplates(response.data as Template[]);
      }
    })().catch((error) => {
      console.error("Failed to fetch templates:", error);
    });
  }, [template, criterionAdded]);

  const handleTemplateTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (criterionAdded) {
      const updatedTemplate = {
        ...template,
        criteria: template.criteria.filter((c) => c.key !== criterion.key),
      };

      // Add the latest version of the criterion
      updatedTemplate.title = event.target.value;
      criterion.templateTitle = updatedTemplate.title;
      criterion.template = updatedTemplate.key;

      updatedTemplate.criteria.push(criterion);
      setTemplate(updatedTemplate);

      console.log("updatedTemplate criterion added", updatedTemplate.title);
      setSelectedTemplateTitle(updatedTemplate.title);
      setTemplate(updatedTemplate);
    } else {
      const newTemplate = { ...template };
      newTemplate.title = event.target.value;
      console.log("newTemplateTitle", newTemplate.title);
      criterion.template = newTemplate.key;
      criterion.templateTitle = newTemplate.title;
      setSelectedTemplateTitle(newTemplate.title);
      newTemplate.criteria.push(criterion);
      setTemplate(newTemplate);
      setCriterionAdded(true);
    }

    // write to the json file here. needs criteria info.
    handleSetTemplateTitle(event);
  };

  // set the template name field of the current criterion and add it to the template.
  // send the template up to the criterion input so that it can detect changes and update the
  // criterion within the template.
  const handleSave = async () => {
    if (updatingExistingTemplate) {
      console.log("updating existing template");
      const response = await putTemplate();
      if (response.success) {
        console.log("template updated");
      }
    } else {
      handleFinalizeTemplate();

      criterion.templateTitle = selectedTemplateTitle;
      setTemplate(template);
      console.log("creating new template", template);
      const response = await postTemplate();
      if (response.success) {
        console.log("template created");
      }
    }
    closeTemplateCard();
  };

  const handleFinalizeTemplate = () => {
    console.log("finalizing template");
    const newCriterion = { ...criterion };
    newCriterion.template = template.key;
    newCriterion.templateTitle = criterion.templateTitle;
    const newTemplate = {
      ...template,
      criteria: [...template.criteria, newCriterion],
    };
    console.log("newTemplate", newTemplate);
    setTemplate(newTemplate);
    setCriterionAdded(true); //should trigger a re-render
  };

  const handleSelectedExistingTemplate = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    event.preventDefault();

    let textAreaTemplateTitle = event.currentTarget.textContent || "";

    // Remove specific substring if present (e.g., " - (Already contains criterion)")
    textAreaTemplateTitle = textAreaTemplateTitle.replace(
      " - (Already contains this criterion)",
      ""
    );

    console.log("textAreaTemplateTitle", textAreaTemplateTitle);

    const existingTemplate = templates.find(
      (t) => t.title.trim() === textAreaTemplateTitle.trim()
    );

    console.log("existingTemplate", existingTemplate);
    if (existingTemplate) {
      // Check if criterion already exists in template
      const criterionExists = existingTemplate.criteria.some(
        (c) => c.key === criterion.key
      );
      if (criterionExists) {
        console.log("criterion already exists in template");
        criterion.templateTitle = "";
        criterion.template = "";
        setSelectedTemplateTitle("");
      } else {
        console.log("criterion does not exist in template");
        criterion.templateTitle = existingTemplate.title;
        criterion.template = existingTemplate.key;
        setSelectedTemplateTitle(existingTemplate.title);
        console.log("existingTemplate", existingTemplate);

        setTemplate({
          ...existingTemplate,
          criteria: [...existingTemplate.criteria, criterion],
        });
        setUpdatingExistingTemplate(true);
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
        {criterion.templateTitle && criterion.templateTitle !== "" ? (
          <>
            <p className="text-xl font-semibold mt-2 text-gray-200 bg-gray-500 px-3 py-1 rounded-full">
              {criterion.templateTitle}
            </p>
            <button
              onClick={() => void handleSave()}
              className="h-10 mt-4 bg-green-600 text-white font-bold rounded-lg py-2 px-4 transition duration-300 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Save
            </button>
          </>
        ) : (
          <div className="flex-grow flex justify-center">
            <p className="text-xl font-semibold mt-2 text-gray-200 bg-gray-500 px-3 py-1 rounded-full">
              No template selected
            </p>
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
            <div>No templates available</div>
          ) : (
            templates.map((t, tKey) => {
              const criterionExists = t.criteria.some(
                (c) => c.key === criterion.key
              );
              return (
                <div
                  key={tKey}
                  onClick={handleSelectedExistingTemplate}
                  className={`${criterionExists ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-600"}`}
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
