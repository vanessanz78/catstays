import { Router, type IRouter } from 'express';
import dns from 'dns/promises';

const router: IRouter = Router();

const ROOT_DOMAIN = 'catstays.app';

router.get('/cattery/verify-domain', async (req, res) => {
  const domain = req.query.domain as string;
  if (!domain) {
    res.status(400).json({ error: 'Missing domain parameter' });
    return;
  }

  try {
    const cleanDomain = domain.replace(/^www\./, '');
    let verified = false;
    let resolvedTo = '';
    let method = '';

    try {
      const cnames = await dns.resolveCname(domain);
      resolvedTo = cnames[0] || '';
      verified = cnames.some(c => c === ROOT_DOMAIN || c === `www.${ROOT_DOMAIN}` || c.endsWith(`.${ROOT_DOMAIN}`));
      method = 'CNAME';
    } catch {
      try {
        const addrs = await dns.resolve4(domain);
        const rootAddrs: string[] = await dns.resolve4(ROOT_DOMAIN).catch(() => []);
        resolvedTo = addrs[0] || '';
        verified = addrs.some(a => rootAddrs.includes(a));
        method = 'A record';
      } catch {
        verified = false;
        resolvedTo = 'not resolved';
        method = 'none';
      }
    }

    res.json({
      domain,
      verified,
      resolvedTo,
      method,
      expected: ROOT_DOMAIN,
      message: verified
        ? `Domain is correctly pointing to ${ROOT_DOMAIN}`
        : `Domain is not yet pointing to ${ROOT_DOMAIN}. Add a CNAME record: ${domain} → ${ROOT_DOMAIN}`,
    });
  } catch (err) {
    console.error('[cattery/verify-domain]', err);
    res.status(500).json({ error: 'DNS lookup failed', verified: false });
  }
});

export default router;
