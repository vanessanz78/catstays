import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  const build = {
    ref: process.env["CATSTAYS_BUILD_REF"] || process.env["REPLIT_GIT_BRANCH"] || process.env["VERCEL_GIT_COMMIT_REF"] || "",
    commit:
      process.env["CATSTAYS_BUILD_COMMIT"] ||
      process.env["REPLIT_GIT_COMMIT"] ||
      process.env["VERCEL_GIT_COMMIT_SHA"] ||
      "",
  };

  if (process.env["NODE_ENV"] === "development") {
    console.info("CATSTAYS BUILD", {
      "branch/ref": build.ref || "unknown",
      commit: build.commit || "unknown",
    });
  }

  res.json({ ...data, build });
});

export default router;
