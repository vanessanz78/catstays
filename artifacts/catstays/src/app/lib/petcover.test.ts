import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultPetcoverCatIntake, petcoverIntakeComplete } from './petcover';

function completeIntake() {
  const intake = defaultPetcoverCatIntake();
  return {
    ...intake,
    requested: true,
    dateOfBirth: '2026-01-01',
    sex: 'female' as const,
    acquisitionType: 'rescued' as const,
    declarations: Object.fromEntries(
      Object.keys(intake.declarations).map((key) => [key, true]),
    ) as typeof intake.declarations,
  };
}

test('Petcover can be skipped without blocking a booking', () => {
  assert.equal(petcoverIntakeComplete(defaultPetcoverCatIntake()), true);
});

test('Petcover requires explicit sex and acquisition details', () => {
  const complete = completeIntake();
  assert.equal(petcoverIntakeComplete(complete), true);
  assert.equal(petcoverIntakeComplete({ ...complete, sex: 'unknown' }), false);
  assert.equal(petcoverIntakeComplete({ ...complete, acquisitionType: 'unknown' }), false);
});

test('Petcover accepts a missing microchip number when the required details are complete', () => {
  assert.equal(petcoverIntakeComplete(completeIntake()), true);
});
