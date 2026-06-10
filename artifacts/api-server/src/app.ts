import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import router from "./routes";

const app: Express = express();

app.use(cors());

// Preserve raw body for Stripe webhook signature verification
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/api/billing/webhook') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true }));
app.use("/api", router);

export default app;
