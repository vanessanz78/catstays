import { Router, type IRouter } from "express";
import healthRouter from "./health";
import emailRouter from "./email";
import catteryRouter from "./cattery";
import billingRouter from "./billing";
import websiteRouter from "./website";
import debugRouter from "./debug";

const router: IRouter = Router();

router.use(healthRouter);
router.use(emailRouter);
router.use(catteryRouter);
router.use(billingRouter);
router.use(websiteRouter);
router.use(debugRouter);

export default router;
