export const validators = {
  nickname: (value: string): boolean => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(value);
  },

  price: (value: number): boolean => {
    return value > 0 && value <= 10_000_000;
  },

  income: (value: number): boolean => {
    return value > 0 && value <= 1_000_000_000;
  },

  coolingRange: (from: number, to: number, days: number): boolean => {
    return from >= 0 && from < to && days > 0 && days <= 365;
  },
};
export const getErrorMessage = (field: string, value: string | number): string | null => {
  switch (field) {
    case 'nick': {
      const strValue = String(value);
      if (!strValue) return 'Введите никнейм';
      if (strValue.length < 3) return 'Минимум 3 символа';
      if (strValue.length > 20) return 'Максимум 20 символов';
      if (!validators.nickname(strValue)) return 'Только цифр (лат), цифр и _';
      return null;
    }

    case 'price':
      if (!value) return 'Введите цену';
      if (!validators.price(Number(value))) return 'Цена должна быть от 1 до 10М';
      return null;

    case 'income':
      if (!value) return 'Введите доход';
      if (!validators.income(Number(value))) return 'Некорректная сумма';
      return null;

    default:
      return null;
  }
};