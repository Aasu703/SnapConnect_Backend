import app from "./app";
import { connectdb } from "./database/mongodb";
import logger from "./config/logger";
import { PORT } from "./config";

// Starting the MongoDB connection and then the server
async function startServer() {
    try {
        await connectdb();
        
        // This is the ONLY place app.listen should be called
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        logger.error("Failed to start the server:", error);
        process.exit(1);
    }
}

startServer();