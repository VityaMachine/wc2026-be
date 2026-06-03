import app from './app';
import { env } from './config/env';

const PORT = env.PORT ? Number(env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`API server is running on port ${PORT}`);
});
