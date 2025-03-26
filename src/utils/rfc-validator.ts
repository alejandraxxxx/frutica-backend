// utils/rfc-validator.ts
export function isValidRFC(rfc: string | undefined): boolean {
    if (!rfc) return false;
    const regexRFC = /^([A-ZÑ&]{3,4})\d{6}(?:[A-Z\d]{3})?$/;
    return regexRFC.test(rfc.toUpperCase());
}
