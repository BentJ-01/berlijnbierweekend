// Gegevens voor een overschrijving vanuit de Betaal-knop.

export const MEDEDELING = 'Bierweekend Berlijn'

export const formatIban = (iban: string) => iban.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
