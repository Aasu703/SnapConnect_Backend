import mongoose from "mongoose";
import { MONGO_URI } from "../config";

export async function connectdb() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1);
    }
}

export async function connectdbTest() {
    try {
        await mongoose.connect(MONGO_URI + "_test");
        console.log("Connected to MongoDB Test Database");
    } catch (err) {
        console.error("Failed to connect to MongoDB Test Database", err);
        process.exit(1);
    }
}