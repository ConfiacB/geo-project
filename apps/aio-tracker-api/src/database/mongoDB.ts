import dns from "node:dns/promises";
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import mongoose from "mongoose";
import { MONGODB_URI } from "../config";

export function connect(): void {
  mongoose.set("strictQuery", false);
  mongoose.connect(MONGODB_URI).catch((e) => {
    console.error("MongoDB connection error. Please make sure MongoDB is running.", e);
    process.exit(1);
  });
}

export function disconnect(): void {
  mongoose.disconnect();
}
