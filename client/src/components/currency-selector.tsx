import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency, type Currency } from "@/components/currency-provider";

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
      <SelectTrigger className="w-[90px]" data-testid="select-currency">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="PHP">PHP (\u20B1)</SelectItem>
        <SelectItem value="SGD">SGD (S$)</SelectItem>
        <SelectItem value="USD">USD ($)</SelectItem>
      </SelectContent>
    </Select>
  );
}
