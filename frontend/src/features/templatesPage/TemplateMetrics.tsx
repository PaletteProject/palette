import React from "react";

const TemplateMetrics = () => {
  return (
    <>
      <div className="flex flex-row ">
        <h3 className="text-white text-2xl font-bold m-10 mr-0">
          Show Metrics
        </h3>
        <label className="block">
          <input type="checkbox" value="dateCreated" className="mr-2" />
          Show Metrics
        </label>
      </div>
      <div
        className={`          "flex flex-col"

           bg-gray-600 border-2 border-black rounded-lg overflow-auto 
          scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800 px-4 py-2
           m-10
        `}
      ></div>
    </>
  );
};

export default TemplateMetrics;
