class CNPJ {
  static validate(value: string): boolean {
    if (/[a-zA-Z]/.test(value)) {
      return false;
    }

    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length !== 14) {
      return false;
    }

    if (/^(\d)\1{13}$/.test(cleaned)) {
      return false;
    }

    let sum = 0;
    let pos = 12 - 7;

    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned.charAt(i)) * pos--;
      if (pos < 2) pos = 9;
    }

    const firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (firstDigit !== parseInt(cleaned.charAt(12))) {
      return false;
    }

    sum = 0;
    pos = 13 - 7;

    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned.charAt(i)) * pos--;
      if (pos < 2) pos = 9;
    }

    const secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (secondDigit !== parseInt(cleaned.charAt(13))) {
      return false;
    }

    return true;
  }
}

export { CNPJ };
