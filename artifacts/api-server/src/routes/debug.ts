import { Router, type IRouter } from 'express';
import { scrapeCatteryWebsite } from '../lib/catteryWebsiteScraper';
import {
  ImageImportFlightRecorder,
  collectImportImageUrls,
  recordBuilderDiagnostics,
  recordPreviewDiagnostics,
} from '../lib/imageImportDiagnostics';

const router: IRouter = Router();
const DEFAULT_DEBUG_IMPORT_URL = 'https://www.delorainecattery.com';

router.get('/debug/image-import', async (req, res) => {
  if (process.env.NODE_ENV === 'production' && process.env.CATSTAYS_ENABLE_DEBUG_ENDPOINT !== 'true') {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const url = typeof req.query.url === 'string' && req.query.url.trim()
    ? req.query.url.trim()
    : DEFAULT_DEBUG_IMPORT_URL;
  const recorder = new ImageImportFlightRecorder();

  try {
    const scrape = await scrapeCatteryWebsite(url, { diagnostics: recorder });
    const importedImageUrls = collectImportImageUrls(scrape);
    recorder.recordUploadNotAttempted(importedImageUrls);
    recordBuilderDiagnostics(recorder, scrape);
    recordPreviewDiagnostics(recorder, scrape);

    res.json({
      sourceUrl: scrape.sourceUrl,
      sourceHost: scrape.sourceHost,
      ...recorder.toResponse(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown image import diagnostic error';
    recorder.error('scrape', message, undefined, url);
    res.status(422).json({
      sourceUrl: url,
      ...recorder.toResponse(),
    });
  }
});

export default router;
