import { useCallback } from "react";
import { useTemplatesContext } from "./TemplateContext.tsx";

const TemplateSearch = ({
  searchQuery,
  setSearchQuery,
  showSuggestions,
  setShowSuggestions,
  onSearch,
}: {
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  showSuggestions: boolean;
  setShowSuggestions: (showSuggestions: boolean) => void;
  onSearch: (query: string) => void;
}) => {
  const { templates } = useTemplatesContext();
  // Add function to get unique suggestions from templates
  const getSuggestions = useCallback(() => {
    const suggestions = new Set<string>();

    templates.forEach((template) => {
      // Add template titles
      suggestions.add(template.title);

      // Add tag names
      template.tags.forEach((tag) => suggestions.add(tag.name));

      // Add criterion titles
      template.criteria.forEach((criterion) => {
        if (criterion.templateTitle) {
          suggestions.add(criterion.templateTitle);
        }
      });
    });

    return Array.from(suggestions)
      .filter(
        (suggestion) =>
          suggestion.toLowerCase().includes(searchQuery.toLowerCase()) &&
          suggestion !== searchQuery,
      )
      .slice(0, 5); // Limit to 5 suggestions
  }, [templates, searchQuery]);

  const suggestions = getSuggestions();

  return (
    <div className="mb-4 relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {showSuggestions && searchQuery && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                setSearchQuery(suggestion);
                setShowSuggestions(false);
                onSearch(suggestion);
              }}
              className="w-full px-4 py-2 text-left text-white hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateSearch;
