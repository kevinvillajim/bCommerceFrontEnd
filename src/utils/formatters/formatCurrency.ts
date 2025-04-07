export function formatCurrency(amount: number | null | undefined): string {
    if (typeof amount !== "number" || isNaN(amount)) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }
  