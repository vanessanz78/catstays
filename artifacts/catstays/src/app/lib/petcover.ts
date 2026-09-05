export type PetcoverSex = 'female' | 'male' | 'unknown';
export type PetcoverAcquisition = 'purchased' | 'rescued' | 'unknown';

export type PetcoverDeclarations = {
  vaccinationsCurrent: boolean;
  noPreExistingConditions: boolean;
  noCurrentIllnessOrInjury: boolean;
  noMedication: boolean;
  noExistingCover: boolean;
  informationAccurate: boolean;
  ownerNotified: boolean;
  dutyOfDisclosure: boolean;
};

export type PetcoverCatIntake = {
  requested: boolean;
  dateOfBirth: string;
  sex: PetcoverSex;
  acquisitionType: PetcoverAcquisition;
  purchasePrice: string;
  microchipNumber: string;
  declarations: PetcoverDeclarations;
};

export const PETCOVER_DECLARATION_LABELS: Array<{ key: keyof PetcoverDeclarations; label: string }> = [
  { key: 'vaccinationsCurrent', label: 'Vaccinations are current.' },
  { key: 'noPreExistingConditions', label: 'There are no known pre-existing conditions.' },
  { key: 'noCurrentIllnessOrInjury', label: 'The cat is not currently ill or injured.' },
  { key: 'noMedication', label: 'The cat is not currently taking medication.' },
  { key: 'noExistingCover', label: 'The cat does not already have pet insurance.' },
  { key: 'informationAccurate', label: 'The information supplied is accurate and complete.' },
  { key: 'ownerNotified', label: 'The owner has been told this is an introductory Petcover offer.' },
  { key: 'dutyOfDisclosure', label: 'The owner understands their duty to disclose relevant information.' },
];

export function emptyPetcoverDeclarations(): PetcoverDeclarations {
  return {
    vaccinationsCurrent: false,
    noPreExistingConditions: false,
    noCurrentIllnessOrInjury: false,
    noMedication: false,
    noExistingCover: false,
    informationAccurate: false,
    ownerNotified: false,
    dutyOfDisclosure: false,
  };
}

export function defaultPetcoverCatIntake(cat?: Partial<{ date_of_birth: string | null; sex: PetcoverSex | null; acquisition_type: PetcoverAcquisition | null; purchase_price: number | string | null; microchip_number: string | null }>): PetcoverCatIntake {
  return {
    requested: false,
    dateOfBirth: cat?.date_of_birth || '',
    sex: cat?.sex || 'unknown',
    acquisitionType: cat?.acquisition_type || 'unknown',
    purchasePrice: cat?.purchase_price == null ? '' : String(cat.purchase_price),
    microchipNumber: cat?.microchip_number || '',
    declarations: emptyPetcoverDeclarations(),
  };
}

export function petcoverEligibility(dateOfBirth: string, referenceDate: string | Date = new Date()) {
  if (!dateOfBirth) return { eligible: false, reason: 'Date of birth is required.' };
  const dob = new Date(`${dateOfBirth}T12:00:00`);
  const reference = typeof referenceDate === 'string' ? new Date(`${referenceDate}T12:00:00`) : referenceDate;
  if (Number.isNaN(dob.getTime()) || Number.isNaN(reference.getTime())) {
    return { eligible: false, reason: 'Enter a valid date of birth.' };
  }
  let ageInMonths = (reference.getFullYear() - dob.getFullYear()) * 12 + reference.getMonth() - dob.getMonth();
  if (reference.getDate() < dob.getDate()) ageInMonths -= 1;
  if (ageInMonths < 0) return { eligible: false, reason: 'Date of birth cannot be in the future.' };
  if (ageInMonths >= 12) return { eligible: false, reason: 'The introductory offer is for cats under 12 months.' };
  return { eligible: true, reason: 'Under 12 months.' };
}

export function petcoverDeclarationsComplete(declarations: PetcoverDeclarations) {
  return PETCOVER_DECLARATION_LABELS.every(({ key }) => declarations[key]);
}

export function petcoverIntakeComplete(intake: PetcoverCatIntake) {
  if (!intake.requested) return true;
  return Boolean(
    intake.dateOfBirth
    && intake.sex !== 'unknown'
    && intake.acquisitionType !== 'unknown'
    && (intake.acquisitionType !== 'purchased' || intake.purchasePrice.trim())
    && petcoverDeclarationsComplete(intake.declarations),
  );
}
