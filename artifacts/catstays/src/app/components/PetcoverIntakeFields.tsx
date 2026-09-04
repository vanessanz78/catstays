import { ShieldCheck } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  PETCOVER_DECLARATION_LABELS,
  petcoverEligibility,
  type PetcoverCatIntake,
} from '../lib/petcover';

export function PetcoverIntakeFields({
  value,
  onChange,
  referenceDate,
  idPrefix,
  compact = false,
}: {
  value: PetcoverCatIntake;
  onChange: (updates: Partial<PetcoverCatIntake>) => void;
  referenceDate: string;
  idPrefix: string;
  compact?: boolean;
}) {
  const eligibility = petcoverEligibility(value.dateOfBirth, referenceDate || undefined);
  const updateDeclaration = (key: keyof PetcoverCatIntake['declarations'], checked: boolean) =>
    onChange({ declarations: { ...value.declarations, [key]: checked } });

  return (
    <div className={`space-y-4 rounded-2xl border ${value.requested ? 'border-[#F0C9B2] bg-[#FFF8F2]' : 'border-[#E8DED4] bg-white'} p-4`}>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={value.requested}
          onChange={(event) => onChange({ requested: event.target.checked })}
          className="mt-1 h-4 w-4 accent-[#C46A3A]"
        />
        <span>
          <span className="flex items-center gap-2 font-semibold text-[#0A1128]"><ShieldCheck className="h-4 w-4 text-[#C46A3A]" />Offer the 4-week Petcover introductory cover</span>
          <span className="mt-1 block text-xs leading-5 text-[#4E5871]">For a first-time Petcover offer for cats under 12 months. CatStays collects the details for staff to enter manually; this does not activate a policy.</span>
        </span>
      </label>

      {value.requested && (
        <div className="space-y-4 border-t border-[#F0C9B2] pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-[#0A1128]">Date of birth *
              <Input id={`${idPrefix}-dob`} type="date" value={value.dateOfBirth} onChange={(event) => onChange({ dateOfBirth: event.target.value })} className="mt-1.5 bg-white font-normal" />
            </label>
            <label className="text-sm font-semibold text-[#0A1128]">Sex *
              <select id={`${idPrefix}-sex`} value={value.sex} onChange={(event) => onChange({ sex: event.target.value as PetcoverCatIntake['sex'] })} className="mt-1.5 h-10 w-full rounded-md border border-[#E8DED4] bg-white px-3 text-sm font-normal">
                <option value="unknown">Not recorded</option><option value="female">Female</option><option value="male">Male</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-[#0A1128]">Bought or rescued? *
              <select value={value.acquisitionType} onChange={(event) => onChange({ acquisitionType: event.target.value as PetcoverCatIntake['acquisitionType'] })} className="mt-1.5 h-10 w-full rounded-md border border-[#E8DED4] bg-white px-3 text-sm font-normal">
                <option value="unknown">Choose one</option><option value="purchased">Bought</option><option value="rescued">Rescued / adopted</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-[#0A1128]">Purchase price {value.acquisitionType === 'purchased' ? '*' : '(if applicable)'}
              <Input type="number" min="0" step="0.01" inputMode="decimal" value={value.purchasePrice} onChange={(event) => onChange({ purchasePrice: event.target.value })} placeholder="NZD" className="mt-1.5 bg-white font-normal" />
            </label>
            <label className={`${compact ? '' : 'sm:col-span-2'} text-sm font-semibold text-[#0A1128]`}>Microchip number *
              <Input id={`${idPrefix}-microchip`} value={value.microchipNumber} onChange={(event) => onChange({ microchipNumber: event.target.value })} placeholder="Enter the microchip number" className="mt-1.5 bg-white font-normal" />
            </label>
          </div>

          <p className={`rounded-xl border p-3 text-sm ${eligibility.eligible ? 'border-green-200 bg-green-50 text-green-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
            <strong>{eligibility.eligible ? 'Eligibility check: under 12 months' : 'Eligibility needs review'}</strong>
            <span className="ml-1">{eligibility.reason} Checked against the booking check-in date.</span>
          </p>

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-[#0A1128]">Declarations</legend>
            <p className="text-xs leading-5 text-[#4E5871]">These confirmations are saved with the record for staff follow-up and manual portal entry.</p>
            {PETCOVER_DECLARATION_LABELS.map(({ key, label }) => (
              <label key={key} className="flex items-start gap-2 text-sm text-[#0A1128]">
                <input type="checkbox" checked={value.declarations[key]} onChange={(event) => updateDeclaration(key, event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#C46A3A]" />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>
        </div>
      )}
    </div>
  );
}