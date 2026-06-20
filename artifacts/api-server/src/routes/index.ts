import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import parentsRouter from "./parents";
import leadsRouter from "./leads";
import tutorsRouter from "./tutors";
import requirementsRouter from "./requirements";
import applicationsRouter from "./applications";
import demosRouter from "./demos";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(parentsRouter);
router.use(leadsRouter);
router.use(tutorsRouter);
router.use(requirementsRouter);
router.use(applicationsRouter);
router.use(demosRouter);
router.use(paymentsRouter);

export default router;
