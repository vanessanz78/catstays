# Onboarding Flow

Last reviewed: 2026-07-01

## Purpose

The onboarding flow should let a cattery owner create a CatStays site and dashboard quickly, either by importing an existing website or starting from a guided setup.

## Current Flow

The current onboarding flow is implemented as a 9-step wizard:

1. Account
2. Cattery setup
3. Website builder
4. Booking setup
5. Website preview
6. Choose plan
7. Publish
8. Success
9. Data import

Older project notes mention a 7-step onboarding flow. That should be treated as a review item because the current implemented flow is 9 steps.

## Current Strengths

- Website URL import entry point exists.
- Guided setup exists for catteries with no current website.
- Website builder preview exists.
- Room setup and booking rules exist.
- Plan selection exists.
- Publish-time tenant provisioning exists.
- Duplicate signup/provisioning email errors now stay on the Publish step so owners do not lose context by looping back to step 1.
- Data import prototype exists.

## Current Gaps

- Template cards need a premium rebuild with realistic cattery website previews.
- Website builder preview can become cramped.
- Account confirmation timing should avoid interrupting setup flow.
- Trial messaging must make clear that all premium features are available during the 14-day trial.
- Address/contact details should carry forward between setup and website builder.
- Data import needs validated sample files and mapping review.

## Target Experience

The owner should feel:

- Setup is simple.
- Their current site can be turned into a modern booking site.
- The dashboard is ready for mobile use.
- They can launch without needing a call, demo, or manual sales process.
- They can start with a CatStays subdomain and upgrade to a custom domain later.
