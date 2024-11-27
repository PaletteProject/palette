import { ChangeEvent, useEffect, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Template } from "../../../../palette-types/src/types/Template";
import { createTemplate } from "../../utils/templateFactory";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import settingsJson from "../../../../backend/settings.json";
import { Criteria } from "palette-types";
import { createCriterion } from "@utils";
import { useFetch } from "@hooks";

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
  const [anchorElTemplate, setAnchorElTemplate] = useState<null | HTMLElement>(
    null,
  );
  const [criterionAdded, setCriterionAdded] = useState(false);
  const [updatingExistingTemplate, setUpdatingExistingTemplate] =
    useState(false);
  const [selectedTemplateTitle, setSelectedTemplateTitle] = useState("");

  const { fetchData: postTemplate } = useFetch("/templates", {
    method: "POST",
    body: JSON.stringify(template), // use latest rubric data
  });

  const { fetchData: putTemplate } = useFetch("/templates", {
    method: "PUT",
    body: JSON.stringify(template),
  });

  useEffect(() => {
    console.log("refresh");
  }, [template, criterionAdded, selectedTemplateTitle]);

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
    setUpdatingExistingTemplate(false);

    // write to the json file here. needs criteria info.
    handleSetTemplateTitle(event);
  };

  const handleOpenTemplates = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setAnchorElTemplate(event.currentTarget);
    console.log("before copy: open all");
    console.log(template);
  };

  const handleCloseTemplates = () => {
    setAnchorElTemplate(null);
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
    event: React.MouseEvent<HTMLElement>,
  ) => {
    event.preventDefault();
    template.criteria = [];

    const textAreaTemplateTitle = event.currentTarget.textContent;
    console.log("textAreaTemplateTitle", textAreaTemplateTitle);
    criterion.templateTitle = textAreaTemplateTitle || "";
    setSelectedTemplateTitle(textAreaTemplateTitle || "");

    const selectedTemplateJson = settingsJson.templates.find(
      (tmplt) => tmplt.title === textAreaTemplateTitle,
    );

    if (textAreaTemplateTitle != null) {
      // if this template exist in the db
      // check if there is criteria in the db for this template. create criterion objects out of all of them and add them to the current template.
      if (selectedTemplateJson?.criteria != undefined) {
        selectedTemplateJson?.criteria.forEach((existingCriterion) => {
          const copyCriterion = createCriterion();

          copyCriterion.ratings = existingCriterion.ratings;
          copyCriterion.description = existingCriterion.description;
          copyCriterion.longDescription = existingCriterion.longDescription;
          copyCriterion.points = existingCriterion.points;
          copyCriterion.template = existingCriterion.template;
          copyCriterion.templateTitle = existingCriterion.templateTitle;
          copyCriterion.key = existingCriterion.key;

          template.criteria.push(copyCriterion);
        });
      }

      template.title = textAreaTemplateTitle;

      console.log("template", template);
      setUpdatingExistingTemplate(true);
      handleFinalizeTemplate();
    }
    handleCloseTemplates();
  };

  return (
    <div className="border border-gray-700 p-6 rounded-lg shadow-xl bg-gray-700">
      <div className={"flex justify-between items-center"}>
        <input
          placeholder={
            criterion.templateTitle === ""
              ? "Enter Template Name"
              : `${criterion.templateTitle}`
          }
          onChange={handleTemplateTitleChange}
          className="mt-4 mb-4 border border-gray-600 rounded-lg p-3 text-gray-300 hover:bg-gray-800 transition duration-300 cursor-pointer focus:outline-none"
        />

        <button
          className="px-1 py-4 text-2xl font-bond text-gray-950 hover:opacity-80 transition duration-300 transform hover:scale-105"
          onClick={handleOpenTemplates}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>

        <Menu
          sx={{ mt: "45px" }}
          id="user-menu"
          anchorEl={anchorElTemplate}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorElTemplate)}
          onClose={handleCloseTemplates}
        >
          {settingsJson.templates.map((t, tKey) => (
            <MenuItem key={tKey} onClick={handleSelectedExistingTemplate}>
              {t.title}
            </MenuItem>
          ))}
        </Menu>

        <button
          onClick={() => void handleSave()}
          className="h-10 mt-4 bg-green-600 text-white font-bold rounded-lg py-2 px-4 transition duration-300 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Save
        </button>
      </div>
    </div>
  );
};
export default TemplateSetter;
