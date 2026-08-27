import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import router from "./routes";

const app: Express = express();

app.use(cors());

// Preserve raw body for Stripe webhook signature verification
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/api/billing/webhook' || req.path === '/api/cattery-payments/webhook') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json({ limit: '1mb' })(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true }));
app.use("/api", router);

app.use((err: Error & { status?: number; type?: string }, _req: Request, res: Response, next: NextFunction) => {
  if (err.type === 'entity.too.large') {
    res.status(413).json({ error: 'The imported website preview is too large to submit. Please refresh and try again.' });
    return;
  }

  if (err instanceof SyntaxError && err.status === 400) {
    res.status(400).json({ error: 'The request could not be read. Please refresh and try again.' });
    return;
  }

  next(err);
});

export default app;
