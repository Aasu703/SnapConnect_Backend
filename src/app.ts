import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import authRoutes from './routes/user/user.route';
import photoRoutes from './routes/photo/photo.route';
import albumRoutes from './routes/album/album.route';
import partyRoutes from './routes/party/party.route';
import cors from 'cors';

import { requestLogger } from './middleware/logger.middleware';

const app = express();

let corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3003", "http://10.0.2.2:3000", "http://192.168.1.7:5050"], // Added flutter IPs just in case
    optionsSuccessStatus: 200,
    credentials: true, 
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(requestLogger);

// Serve uploads directory statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/parties', partyRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// ONLY export the app here. Do not call app.listen()!
export default app;