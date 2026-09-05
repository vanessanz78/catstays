export const PETCOVER_CAT_INSURANCE_URL = 'https://www.petcovergroup.com/nz/cat-insurance/';

export const PETCOVER_TRIAL_POLICY_URL = '/documents/petcover-four-week-trial-policy.pdf';

export const PETCOVER_TRIAL_POLICY_DOWNLOAD_NAME = 'Petcover-4-Week-Trial-Policy.pdf';

export function isDeloraineCatteryWebsite(...identifiers: unknown[]): boolean {
  return identifiers.some((identifier) => (
    typeof identifier === 'string'
    && /deloraine\s*cattery|delorainecattery/i.test(identifier)
  ));
}
