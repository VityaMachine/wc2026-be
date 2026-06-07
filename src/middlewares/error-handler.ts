import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err?.status ?? err?.statusCode ?? 500;
  const isClientError = status >= 400 && status < 500;
  const message = isClientError && err?.message ? err.message : 'Internal Server Error';

  if (!isClientError) {
    console.error(err);
  }

  res.status(status).json({ message });
}
