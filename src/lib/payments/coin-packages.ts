export interface CoinPackage {
  id: string;
  coins: number;
  priceLabel: string;
  amountCents: number;
  popular?: boolean;
}

export const COIN_PACKAGES: CoinPackage[] = [
  {
    id: "coins-10",
    coins: 10,
    priceLabel: "€9,99",
    amountCents: 999,
  },
  {
    id: "coins-25",
    coins: 25,
    priceLabel: "€19,99",
    amountCents: 1999,
    popular: true,
  },
  {
    id: "coins-60",
    coins: 60,
    priceLabel: "€39,99",
    amountCents: 3999,
  },
  {
    id: "coins-150",
    coins: 150,
    priceLabel: "€89,99",
    amountCents: 8999,
  },
];

export function getCoinPackage(id: string): CoinPackage | undefined {
  return COIN_PACKAGES.find((pkg) => pkg.id === id);
}
