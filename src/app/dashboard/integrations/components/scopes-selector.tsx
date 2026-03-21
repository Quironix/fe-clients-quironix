"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";

export const API_KEY_RESOURCES = [
  { id: "client.settings_account.debtors", labelKey: "debtors" },
  { id: "client.transactions.dte", labelKey: "dte" },
  { id: "client.transactions.payments", labelKey: "payments" },
  { id: "client.transactions.movements", labelKey: "movements" },
  { id: "client.onboarding.companies", labelKey: "companies" },
] as const;

export const API_KEY_ACTIONS = ["read", "edit", "delete"] as const;

interface ScopesSelectorProps {
  value: string[];
  onChange: (scopes: string[]) => void;
}

const ScopesSelector = ({ value, onChange }: ScopesSelectorProps) => {
  const t = useTranslations("integrations");

  const handleChange = (resourceId: string, action: string, checked: boolean) => {
    const scope = `${resourceId}:${action}`;

    if (checked) {
      const newScopes = [...value, scope];
      if (action === "edit" || action === "delete") {
        const readScope = `${resourceId}:read`;
        if (!newScopes.includes(readScope)) {
          newScopes.push(readScope);
        }
      }
      onChange(newScopes);
    } else {
      onChange(value.filter((s) => s !== scope));
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left font-medium py-2 pr-4 w-1/2"></th>
            {API_KEY_ACTIONS.map((action) => (
              <th key={action} className="text-center font-medium py-2 px-2">
                {t(`apiKeys.scopes.actions.${action}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {API_KEY_RESOURCES.map((resource) => (
            <tr key={resource.id} className="border-t">
              <td className="py-2 pr-4 text-sm font-normal">
                {t(`apiKeys.scopes.resourceLabels.${resource.labelKey}`)}
              </td>
              {API_KEY_ACTIONS.map((action) => {
                const scope = `${resource.id}:${action}`;
                const isChecked = value.includes(scope);
                return (
                  <td key={action} className="text-center py-2 px-2">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handleChange(resource.id, action, checked as boolean)
                      }
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScopesSelector;
