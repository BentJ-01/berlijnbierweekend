// EPC-QR (SEPA-overschrijving): bank-apps vullen begunstigde, IBAN, bedrag en mededeling zelf in.

export const MEDEDELING = 'Bierweekend Berlijn'

export function epcPayload(name: string, iban: string, cents: number, text = MEDEDELING) {
  return [
    'BCD', // service tag
    '002', // versie (BIC mag leeg)
    '1', // UTF-8
    'SCT', // SEPA credit transfer
    '', // BIC
    name.slice(0, 70),
    iban.replace(/\s/g, ''),
    `EUR${(cents / 100).toFixed(2)}`,
    '', // purpose
    '', // gestructureerde mededeling
    text.slice(0, 140),
  ].join('\n')
}

export const formatIban = (iban: string) => iban.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
