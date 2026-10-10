/**
 * Doctor credentials are only shown once the clinic has supplied them. Seed values that are still
 * placeholders ("… · placeholder", "REG-PENDING") return null so visitors never see guessed facts.
 * TODO(client): Dr. Anil Tyagi's qualifications, registration number and council — see docs/16 C1.
 */
export function publicCredential(value: string | null | undefined): string | null {
  const v = value?.trim();
  if (!v || /placeholder|pending/i.test(v)) return null;
  return v;
}
