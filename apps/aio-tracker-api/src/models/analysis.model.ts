import { Document, Schema, model } from "mongoose";

export type SourceResultDoc = {
  url: string;
  title?: string;
  brandCount: number;
  error?: string;
};

export type AnalysisDocument = Document & {
  prompt: string;
  brand: string;
  language: "en" | "ko" | "fr";
  location: "us" | "kr" | "fr" | "es" | "ch" | "gb" | "de" | "it" | "jp" | "sg";
  overviewText?: string;
  overviewBrandCount: number;
  sourceResults: SourceResultDoc[];
  hasAIO: boolean;
  analyzedAt: string;
};

const SourceSchema = new Schema(
  {
    url: { type: String, required: true },
    title: { type: String },
    brandCount: { type: Number, default: 0 },
    error: { type: String },
  },
  { _id: false }
);

const AnalysisSchema = new Schema(
  {
    prompt: { type: String, required: true },
    brand: { type: String, required: true },
    language: { type: String, enum: ["en", "fr", "ko"], default: "en" },
    location: { type: String, default: "kr" },
    overviewText: { type: String },
    overviewBrandCount: { type: Number, default: 0 },
    sourceResults: { type: [SourceSchema], default: [] },
    hasAIO: { type: Boolean, required: true },
    analyzedAt: { type: String, required: true },
  },
  { versionKey: false }
);

AnalysisSchema.index({ brand: 1, language: 1 });

// Model
export const AnalysisModel = model<AnalysisDocument>("Analysis", AnalysisSchema);
