import app  from "./app";
import { connectdb } from "./database/mongodb";
import logger from "./config/logger";
import { PORT} from "./config";

// Starting the MongoDB connection and then the server
async function startServer() {
    await connectdb();
    app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
    });
}

startServer();