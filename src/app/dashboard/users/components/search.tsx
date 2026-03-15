"use client";

import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const Search = ({ placeholder }: { placeholder?: string }) => {
  const t = useTranslations("users");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-80 max-w-md relative">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        className="pl-9 bg-white"
        placeholder={placeholder || t("searchPlaceholder")}
        onChange={e => handleSearch(e.target.value)}
        defaultValue={searchParams.get("search")?.toString()}
      />
    </div>
  );
};

export default Search;
