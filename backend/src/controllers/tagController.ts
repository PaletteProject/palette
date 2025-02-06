import { TagService } from "../services/tagRequests.js";
import { Request, Response } from "express";

export const addTag = async (req: Request, res: Response) => {
  const response = await TagService.addTag(req, res, () => {});
  return response;
};

export const addTags = async (req: Request, res: Response) => {
  const response = await TagService.addTags(req, res, () => {});
  return response;
};

export const updateTag = async (req: Request, res: Response) => {
  const response = await TagService.updateTag(req, res, () => {});
  return response;
};

export const deleteTagByKey = (req: Request, res: Response) => {
  const tagData = TagService.deleteTagByKey(req, res);
  return tagData;
};

export const deleteTags = (req: Request, res: Response) => {
  const tagData = TagService.deleteTags(req, res, () => {});
  return tagData;
};

export const getAllTags = async (req: Request, res: Response) => {
  const response = await TagService.getAllTags(req, res, () => {});
  return response;
};

export const getTagByKey = async (req: Request, res: Response) => {
  const response = await TagService.getTagByKey(req, res, () => {});
  return response;
};
