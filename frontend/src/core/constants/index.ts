export const ROLES = {
  OWNER: "owner",
  MANAGER: "manager",
  CASHIER: "cashier",
  STORE_KEEPER: "store_keeper",
  SALESPERSON: "salesperson",
  ACCOUNTANT: "accountant",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  manager: "Manager",
  cashier: "Cashier",
  store_keeper: "Store Keeper",
  salesperson: "Salesperson",
  accountant: "Accountant",
};

export const PAYMENT_METHODS = {
  CASH: "cash",
  MOBILE_MONEY: "mobile_money",
  BANK_TRANSFER: "bank_transfer",
  CHEQUE: "cheque",
  CARD: "card",
} as const;
