import { Router, type IRouter } from 'express';
import { scrapeCatteryWebsite } from '../lib/catteryWebsiteScraper';

const router: IRouter = Router();

router.post('/website/scrape', async (req, res) => {
  const { url } = req.body as { url?: string };

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'url is required' });
    return;
  }

  try {
    const result = await scrapeCatteryWebsite(url);
    res.json(result);
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === 'URL_REQUIRED' || msg === 'INVALID_URL') {
      res.status(400).json({ error: 'Invalid URL' });
    } else if (msg === 'BAD_SCHEME') {
      res.status(400).json({ error: 'Only http and https URLs are supported' });
    } else if (msg === 'DIRECT_IP' || msg === 'PRIVATE_IP') {
      res.status(400).json({ error: 'That URL is not accessible' });
    } else if (msg === 'DNS_FAILED') {
      res.status(422).json({
        error: "We couldn't reach that site — the domain could not be resolved.",
      });
    } else if (msg === 'TIMEOUT') {
      res.status(422).json({
        error: "We couldn't reach that site — it took too long to respond.",
      });
    } else if (msg.startsWith('HTTP_')) {
      res.status(422).json({
        error: `We couldn't reach that site — it returned an error (${msg.replace('HTTP_', 'HTTP ')}).`,
      });
    } else if (msg === 'NOT_HTML') {
      res.status(422).json({
        error: 'That URL does not point to a web page we can read.',
      });
    } else if (msg === 'NO_USEFUL_CONTENT') {
      res.status(422).json({
        error:
          "We couldn't extract useful content from that site — you can start from scratch instead.",
      });
    } else {
      res.status(422).json({
        error: "We couldn't reach that site — you can start from scratch instead.",
      });
    }
    return;
  }
});

export default router;
