import { Tag, PaletteAPIResponse } from "palette-types";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { createTag } from "../../../frontend/src/utils/tagFactory.js";
import fs from "fs";

const tagsPath = "./tags.json";
let tags: Tag[] | null = null;
export const defaultTags: Tag[] = [];

export const TagService = {
  // POST REQUESTS (Templates Setter/Page Functions)

  initializeTags: () => {
    if (!fs.existsSync(tagsPath)) {
      fs.writeFileSync(
        tagsPath,

        JSON.stringify(defaultTags, null, 2),
      );
      tags = defaultTags;
    } else {
      tags = JSON.parse(fs.readFileSync(tagsPath, "utf-8")) as Tag[];
    }
  },

  addTag: asyncHandler(async (req: Request, res: Response) => {
    if (tags === null) {
      TagService.initializeTags();
    }

    console.log("tag data", req.body);
    const tagsData = fs.readFileSync(tagsPath, "utf8");
    const localTags = JSON.parse(tagsData) as Tag[];
    const tag = createTag();
    const tagData = (await req.body) as Tag | null;

    if (tagData) {
      const tagIndex = localTags.findIndex(
        (tmplt: Tag) => tmplt.name === tagData.name,
      );
      tag.name = tagData.name;
      tag.color = tagData.color;
      tag.key = tagData.key;
      tag.description = tagData.description;
      tag.createdAt = tagData.createdAt;
      tag.lastUsed = tagData.lastUsed;
      tag.usageCount = tagData.usageCount;

      if (tagIndex === -1) {
        // only push if the tag doesn't already exist
        localTags.push(tag);
        console.log("tags.json tags", localTags);
      } else {
        // update the existing tag
        console.log("Tag already exists!");
      }

      fs.writeFileSync(tagsPath, JSON.stringify(localTags, null, 2));
    }

    const apiResponse: PaletteAPIResponse<unknown> = {
      success: true,
      message: "Tag created successfully!",
    };

    res.json(apiResponse);
  }),

  addTags: asyncHandler(async (req: Request, res: Response) => {
    if (tags === null) {
      TagService.initializeTags();
    }

    const tagsData = fs.readFileSync(tagsPath, "utf8");
    const localTags = JSON.parse(tagsData) as Tag[];
    const tagsToAdd = (await req.body) as Tag[] | null;

    if (tagsToAdd) {
      for (const tagToAdd of tagsToAdd) {
        const tagIndex = localTags.findIndex(
          (t: Tag) => t.name === tagToAdd.name,
        );
        const tag = createTag();
        tag.name = tagToAdd.name;
        tag.color = tagToAdd.color;
        tag.key = tagToAdd.key;
        tag.description = tagToAdd.description;
        tag.createdAt = tagToAdd.createdAt;

        tag.lastUsed = tagToAdd.lastUsed;
        tag.usageCount = tagToAdd.usageCount;

        if (tagIndex === -1) {
          localTags.push(tag);
        } else {
          console.log("Tag already exists!");
        }
      }

      fs.writeFileSync(tagsPath, JSON.stringify(localTags, null, 2));
    }

    const apiResponse: PaletteAPIResponse<unknown> = {
      success: true,
      message: "Tags created successfully!",
    };

    res.json(apiResponse);
  }),

  updateTag: asyncHandler(async (req: Request, res: Response) => {
    if (tags === null) {
      TagService.initializeTags();
    }
    console.log("updating tag request", req.body);
    const tagsData = fs.readFileSync(tagsPath, "utf8");
    const localTags = JSON.parse(tagsData) as Tag[];
    const tagData = (await req.body) as Tag | null;

    if (tagData) {
      const tagIndex = localTags.findIndex(
        (tag: Tag) => tag.key === tagData.key,
      );
      console.log("tagIndex", tagIndex);
      console.log("tagData", tagData);

      if (tagIndex !== -1) {
        localTags[tagIndex] = tagData;

        console.log("updated tags", localTags);
        console.log("tags", tags);
        fs.writeFileSync(tagsPath, JSON.stringify(localTags, null, 2));
      }
    }

    const apiResponse: PaletteAPIResponse<unknown> = {
      success: true,
      message: "Tag updated successfully!",
    };

    res.json(apiResponse);
  }),

  // DELETE REQUESTS (Templates Page Functions)
  deleteTagByKey: (req: Request, res: Response) => {
    console.log("deleteTagByKey request", req.params);
    const tagsData = fs.readFileSync(tagsPath, "utf8");
    const localTags = JSON.parse(tagsData) as Tag[];
    const tagKey = req.params.key;
    console.log("tagKey", tagKey);

    if (tagKey) {
      const tagIndex = localTags.findIndex((tag: Tag) => tag.key === tagKey);
      console.log("tagIndex", tagIndex);

      if (tagIndex !== -1) {
        localTags.splice(tagIndex, 1);
        fs.writeFileSync(tagsPath, JSON.stringify(localTags, null, 2));
      }
    }

    const apiResponse: PaletteAPIResponse<unknown> = {
      success: true,
      message: "Tag deleted successfully!",
    };

    res.json(apiResponse);
  },

  deleteTags: asyncHandler(async (req: Request, res: Response) => {
    if (tags === null) {
      TagService.initializeTags();
    }

    const tagsData = fs.readFileSync(tagsPath, "utf8");
    const localTags = JSON.parse(tagsData) as Tag[];
    const tagsToDelete = (await req.body) as Tag[] | null;

    if (tagsToDelete) {
      for (const tagToDelete of tagsToDelete) {
        const tagIndex = localTags.findIndex(
          (t: Tag) => t.name === tagToDelete.name,
        );
        const tag = createTag();
        tag.name = tagToDelete.name;
        tag.color = tagToDelete.color;
        tag.key = tagToDelete.key;
        tag.description = tagToDelete.description;
        tag.createdAt = tagToDelete.createdAt;
        tag.lastUsed = tagToDelete.lastUsed;
        tag.usageCount = tagToDelete.usageCount;

        if (tagIndex !== -1) {
          localTags.splice(tagIndex, 1);
        } else {
          console.log("Tag not found!");
        }
      }

      fs.writeFileSync(tagsPath, JSON.stringify(localTags, null, 2));
    }

    const apiResponse: PaletteAPIResponse<unknown> = {
      success: true,
      message: "Tags deleted successfully!",
    };

    res.json(apiResponse);
  }),

  // GET REQUESTS (Templates API Functions)

  getAllTags: asyncHandler(async (req: Request, res: Response) => {
    if (tags === null) {
      TagService.initializeTags();
    }
    const tagsData = fs.readFileSync(tagsPath, "utf8");
    const localTags = JSON.parse(tagsData) as Tag[];
    const request = (await req.body) as JSON;
    if (request !== null) {
      const apiResponse: PaletteAPIResponse<Tag[]> = {
        success: true,
        message: "Tags fetched successfully!",
        data: localTags,
      };

      res.json(apiResponse);
    }
  }),

  getTagByKey: asyncHandler(async (req: Request, res: Response) => {
    if (tags === null) {
      TagService.initializeTags();
    }
    const tagsData = fs.readFileSync(tagsPath, "utf8");
    const localTags = JSON.parse(tagsData) as Tag[];
    const tagData = (await req.body) as Tag | null;
    const tagKey = tagData?.key;

    if (tagKey) {
      const tagIndex = localTags.findIndex((tag: Tag) => tag.key === tagKey);

      if (tagIndex !== -1) {
        res.json(localTags[tagIndex]);
      }
    }
  }),
};
