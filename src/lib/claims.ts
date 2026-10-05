/**
 * Regulated marketing claims (ADR-27). "Patented" and "doctor-developed" may only appear once the client
 * has supplied verified evidence (patent number + title; written confirmation of who developed the
 * formulation). Until then every surface shows a clearly labelled slot and says "doctor-recommended".
 * TODO(client): patent number/title and formulation-development confirmation — see docs/12 C, ADR-27.
 */
export interface PatentClaim {
  verified: boolean;
  number: string | null;
  title: string | null;
}

export interface Claims {
  patent: PatentClaim;
  doctorDeveloped: { verified: boolean };
}

export const CLAIMS: Claims = {
  patent: { verified: false, number: null, title: null },
  doctorDeveloped: { verified: false },
};

/** Verified patent details, or null while unverified (render the labelled slot instead). */
export function verifiedPatent(claims: Claims = CLAIMS): { number: string; title: string | null } | null {
  const { verified, number, title } = claims.patent;
  return verified && number ? { number, title } : null;
}

/** "Doctor-developed" only when verified; otherwise the always-true "Doctor-recommended". */
export function doctorClaimLabel(claims: Claims = CLAIMS): string {
  return claims.doctorDeveloped.verified ? 'Doctor-developed' : 'Doctor-recommended';
}

export const PATENT_PENDING_COPY = 'Patent details will be shown here once verified';
