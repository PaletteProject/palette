import fs from "fs";
import { Template } from "palette-types";
import {
  defaultTemplates,
  TemplateService,
} from "../TemplatesAPI/templateRequests";
import { Request, Response } from "express";

type MockResponse = Response & {
  status: jest.Mock;
  json: jest.Mock;
};

jest.mock("fs");

const template: Template = {
  title: "Template 1",
  criteria: [
    {
      ratings: [
        {
          points: 5,
          description: "Well done",
          longDescription: "",
          key: "f331d62f-9e2b-43e6-9d45-941f34af64fc",
          id: "rat1",
        },
        {
          points: 0,
          description: "Not included",
          longDescription: "",
          key: "3d4c6cc1-2ab9-4508-94e9-a9ec3f955dc9",
          id: "rat2",
        },
      ],
      id: "crit1",
      description: "",
      longDescription: "",
      pointsPossible: 5,
      template: "ce77d8d4-461c-4c70-8da0-c788bf8e6d54",
      templateTitle: "Template 1",
      key: "deefaa1b-1635-4a47-925b-949d1b3f5462",
      updatePoints: () => {},
    },
  ],
  key: "ce77d8d4-461c-4c70-8da0-c788bf8e6d54",
};

describe("Add Template", () => {
  it("should update the points of a rating", async () => {
    const mockRequest = {} as Request;
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as MockResponse;

    await TemplateService.addTemplate(mockRequest, mockResponse, () => {
      console.log("test");
    });
  });
});

describe("Get Templates", () => {
  it("should return all templates", async () => {
    const mockRequest = {
      body: template,
    } as unknown as Request;
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as MockResponse;

    (fs.existsSync as jest.Mock).mockReturnValue(false);

    await TemplateService.getAllTemplates(mockRequest, mockResponse, () => {
      console.log("test");
    });

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      "./templates.json",
      JSON.stringify(defaultTemplates, null, 2),
    );
  });
});
