// Basic server code
import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/user/user.route';
import cors from 'cors';


const app = express();

let corsOptions = {
    origin:["http://localhost:3000", "http://localhost:3001", "http://localhost:3003"],
    optionsSuccessStatus: 200,
    credentials: true, // Allow cookies to be sent
    // list of domains allowed to access the server
    // frontend domain/url
}

app.use(cors(corsOptions));

const port = 3000;

app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
}
);

export default app;
