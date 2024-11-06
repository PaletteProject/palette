import { ChangeEvent, useEffect, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import createTemplate, { Template } from "../../models/Template";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import templatesJson from "./templates.json";
import createRubricCriterion, {
  RubricCriterion,
} from "../../models/RubricCriterion.ts";

interface TemplateSetterProps {
  closeTemplateCard: () => void; // callback to close the import card
  onTemplatesOpen: () => void;
  handleSetTemplateTitle: (event: ChangeEvent<HTMLInputElement>) => void;
  onTemplateSelected: (t: Template) => void;
  criterion: RubricCriterion;
}

const TemplateSetter: React.FC<TemplateSetterProps> = ({
  closeTemplateCard,
  handleSetTemplateTitle,
  onTemplateSelected,
  criterion,
}: TemplateSetterProps) => {
  const [template, setTemplate] = useState<Template>(createTemplate() || null);
  const [anchorElTemlate, setAnchorElTemplate] = useState<null | HTMLElement>(
    null
  );
  const [userTemplates, setUserTemplates] = useState(templatesJson);
  const [templateSelected, setTemplateSelected] = useState(false);
  const [selectedTemplateTitle, setSelectedTemplateTitle] = useState("");

  useEffect(() => {
    console.log("refresh");
  });

  const handleTemplateTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newTemplate = { ...template };
    newTemplate.title = event.target.value;
    setTemplate(newTemplate);
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
  const handleSave = () => {
    criterion.template = selectedTemplateTitle;
    const newCriteria = [...template.templateCriteria, criterion];
    setTemplate({ ...template, templateCriteria: newCriteria });
    onTemplateSelected(template);

    closeTemplateCard();
  };

  const handleSelectedExistingTemplate = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    event.preventDefault();

    const selectedTemplateTitle = event.currentTarget.textContent;
    const selectedTemplateJson = templatesJson.find(
      (tmplt) => tmplt.title === selectedTemplateTitle
    );

    //set the header info to the current template using the bd template.
    template.id = selectedTemplateJson?.id;
    template.key = selectedTemplateJson?.key;
    template.title = selectedTemplateJson?.title;
    template.description = selectedTemplateJson?.description;

    if (selectedTemplateTitle != null) {
      // if this template exist in the db
      // check if there is criteria in the db for this template. create criterion objects out of all of them and add them to the current template.
      if (selectedTemplateJson?.templateCriteria != undefined) {
        selectedTemplateJson?.templateCriteria.forEach((existingCriterion) => {
          const copyCriterion = createRubricCriterion();

          copyCriterion.description = existingCriterion.description;
          copyCriterion.id = existingCriterion.id;
          copyCriterion.key = existingCriterion.key;
          copyCriterion.longDescription = existingCriterion.longDescription;
          copyCriterion.points = existingCriterion.points;
          copyCriterion.ratings = existingCriterion.ratings;
          copyCriterion.template = existingCriterion.template;
          template.templateCriteria.push(copyCriterion);
        });
      }

      const newCriteria = [...template.templateCriteria, criterion];
      setTemplate({ ...template, templateCriteria: newCriteria });

      setTemplateSelected(true);
      console.log("selectedTemplate");
      console.log(template);
      // onTemplateSelected(template);
      setSelectedTemplateTitle(selectedTemplateTitle);
    }
    handleCloseTemplates();
  };

  return (
    <div className="border border-gray-700 p-6 rounded-lg shadow-xl bg-gray-700">
      <div className={"flex justify-between items-center"}>
        <input
          placeholder={
            templateSelected ? `${selectedTemplateTitle}` : "New Template Name"
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
          anchorEl={anchorElTemlate}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorElTemlate)}
          onClose={handleCloseTemplates}
        >
          {userTemplates.map((t, tKey) => (
            <MenuItem key={tKey} onClick={handleSelectedExistingTemplate}>
              {t.title}
            </MenuItem>
          ))}
        </Menu>

        <button
          onClick={handleSave}
          className="h-10 mt-4 bg-green-600 text-white font-bold rounded-lg py-2 px-4 transition duration-300 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Save
        </button>
      </div>
    </div>
  );
};
export default TemplateSetter;
