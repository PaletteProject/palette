import { useFetch } from "@hooks";
import { useTemplatesContext } from "./TemplateContext";
import TemplateTagCreator from "src/features/templatesPage/TemplateTagCreator";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { Tag } from "palette-types";
import { Dialog } from "../../components/modals/Dialog.tsx";
import AllTags from "./AllTags";
import { createTemplate } from "../../utils/templateFactory.ts";

const AddTemplateTag = () => {
  const {
    templates,
    selectedTagFilters,
    setSelectedTagFilters,
    availableTags,
    setTagModalOpen,

    tagModalOpen,
    setAvailableTags,
    setAddingTagFromBuilder,
    editingTemplate,
    setEditingTemplate,
  } = useTemplatesContext();

  const [showDialog, setShowDialog] = useState(false);

  const { fetchData: getAvailableTags } = useFetch("/tags", {
    method: "GET",
  });

  const getTags = async () => {
    const response = await getAvailableTags();
    const backendTags = response.data as Tag[];

    const templatesWithTags = templates.filter(
      (template) => template.tags.length > 0,
    );
    const templateTags = templatesWithTags.flatMap((template) => template.tags);

    // Combine backend tags and template tags, removing duplicates
    const combinedTags = Array.from(
      new Map(
        [...backendTags, ...templateTags].map((tag) => [tag.key, tag]),
      ).values(),
    );

    setAvailableTags(combinedTags);
  };

  useEffect(() => {
    getTags()
      .then(() => {
        // console.log("tags fetched in add template tag");
      })
      .catch((error) => {
        console.error("error fetching tags", error);
      });
  }, []);

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <span className="text-white">Filter by tags:</span>
        {availableTags
          .filter((tag) =>
            templates.some((template) =>
              template.tags.some((tTag) => tTag.key === tag.key),
            ),
          )
          .map((tag) => (
            <button
              key={tag.key}
              onClick={() =>
                setSelectedTagFilters(
                  selectedTagFilters.includes(tag.key)
                    ? selectedTagFilters.filter((t) => t !== tag.key)
                    : [...selectedTagFilters, tag.key],
                )
              }
              className={`px-3 py-1 rounded-full text-sm flex items-center gap-1
                ${
                  selectedTagFilters.includes(tag.key)
                    ? "ring-2 ring-white"
                    : "opacity-70 hover:opacity-100"
                }`}
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
              <span className="text-xs">
                (
                {
                  templates.filter((t) =>
                    t.tags.some((tTag) => tTag.key === tag.key),
                  ).length
                }
                )
              </span>
            </button>
          ))}
        {selectedTagFilters.length > 0 && (
          <button
            onClick={() => setSelectedTagFilters([])}
            className="px-3 py-1 rounded-full text-sm bg-gray-700 text-white border border-blue-600 hover:bg-gray-600"
          >
            Clear Filters
          </button>
        )}
        <button
          onClick={() => {
            setTagModalOpen(true);
            setAddingTagFromBuilder(false);
          }}
          className="px-3 py-1 rounded-full text-sm bg-gray-700 text-white hover:bg-gray-600"
        >
          + New Tag
        </button>

        <button
          onClick={() => {
            setShowDialog(true);
            setAddingTagFromBuilder(false);
            if (editingTemplate) {
              setEditingTemplate(createTemplate());
            }
          }}
          className="px-3 py-1.5 rounded-full text-lg bg-gray-700 text-white hover:bg-gray-600 flex items-center"
        >
          <FontAwesomeIcon icon={faCog} />
        </button>
      </div>

      <TemplateTagCreator
        isOpen={tagModalOpen}
        onClose={() => setTagModalOpen(false)}
        setAvailableTags={setAvailableTags}
        onCreateTags={() => {
          setTagModalOpen(false);
          getTags()
            .then(() => {
              console.log("tags fetched");
            })
            .catch((error) => {
              console.error("error fetching tags", error);
            });
        }}
      />
      <Dialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title="All Tags "
        children={<AllTags onSave={() => setShowDialog(false)} />}
      />
    </>
  );
};

export default AddTemplateTag;
