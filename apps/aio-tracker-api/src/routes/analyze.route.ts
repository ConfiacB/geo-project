import { Router } from "express";
import multer from "multer";
import {
  analyzeAIO,
  analyzePromptCSV,
  getAllAnalyses,
  getAnalysisTrends,
  searchAnalyses,
  getBrandMention,
  getGooglePrompt,
  getTopMention,
  getAnalysisSummary,
  getAllBrands,
} from "../controllers";

const api = Router();
const upload = multer({ dest: "uploads/" });

api.route("/").post(analyzeAIO).get(getAllAnalyses);
api.route("/search").get(searchAnalyses);
api.route("/trends").get(getAnalysisTrends);
api.route("/upload").post(upload.single("file"), analyzePromptCSV);
api.route("/countMention").get(getBrandMention);
api.route("/generatePrompt").post(getGooglePrompt);
api.route("/topMention").get(getTopMention);
api.route("/summary").get(getAnalysisSummary);
api.route("/brands").get(getAllBrands);

export { api };
