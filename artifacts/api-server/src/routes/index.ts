import { Router, type IRouter } from "express";
import healthRouter from "./health";
import emailRouter from "./email";
import catteryRouter from "./cattery";
import billingRouter from "./billing";
import websiteRouter from "./website";
import pushRouter from "./push";
import catteryPaymentsRouter from "./catteryPayments";
import platformRouter from "./platform";
import revelationSyncRouter from "./revelationSync";
import bookingsRouter from "./bookings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(emailRouter);
router.use(catteryRouter);
router.use(billingRouter);
router.use(websiteRouter);
router.use(pushRouter);
router.use(catteryPaymentsRouter);
router.use(platformRouter);
router.use(revelationSyncRouter);
router.use(bookingsRouter);

export default router;
