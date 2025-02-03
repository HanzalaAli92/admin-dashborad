export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-03'

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
)

export const token = assertValue(
  "skK5gld2VU3K7ekfprAautBETjpvpEKJIAtA3aAIkGRhEYjeEoJO4WN4wDer0Arh19wOStAJPA5FuRiPMPWCfp3CaacVeksHr7LmUg31g9qzHaLs3L1F6zFtJlcNYbReSkBNg9kKOHfwLHBOeIf33Cv8c3WTZlelv2u1FxXtu1dnA8QxMpcp",
  'Missing environment variable: NEXT_API_TOKEN'
)

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
