import express from 'express';
import routes from './routes/index';
import { notFound } from './middlewares/not-found';
import { errorHandler } from './middlewares/error-handler';

const app = express();


app.use(express.json());

// Mount API routes under versioned path
app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
