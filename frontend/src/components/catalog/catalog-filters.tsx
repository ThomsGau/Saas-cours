"use client";

import {
  FileTextIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  VideoIcon,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type CatalogCourseType,
  type CatalogSortOption,
} from "@/lib/catalog/catalog-data";
import { cn } from "@/lib/utils";

type CatalogFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: "all" | CatalogCourseType;
  onTypeFilterChange: (value: "all" | CatalogCourseType) => void;
  sort: CatalogSortOption;
  onSortChange: (value: CatalogSortOption) => void;
  resultsCount: number;
};

const TYPE_FILTERS: Array<{
  value: "all" | CatalogCourseType;
  label: string;
  icon?: typeof VideoIcon;
}> = [
  { value: "all", label: "Tous" },
  { value: "Video", label: "Vidéo", icon: VideoIcon },
  { value: "PDF", label: "PDF", icon: FileTextIcon },
];

const SORT_OPTIONS: Array<{ value: CatalogSortOption; label: string }> = [
  { value: "title", label: "Titre (A → Z)" },
  { value: "level", label: "Niveau" },
  { value: "duration", label: "Durée" },
];

function FilterChip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-brand-brown-dark text-white"
          : "bg-card text-foreground hover:bg-muted",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function CatalogFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  sort,
  onSortChange,
  resultsCount,
}: CatalogFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un cours, un formateur..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-11 rounded-full pl-10"
          />
        </div>

        <Select
          value={sort}
          onValueChange={(value) => onSortChange(value as CatalogSortOption)}
        >
          <SelectTrigger className="h-11 w-full rounded-full lg:w-auto">
            <SlidersHorizontalIcon className="size-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map((filter) => {
          const Icon = filter.icon;

          return (
            <FilterChip
              key={filter.value}
              active={typeFilter === filter.value}
              onClick={() => onTypeFilterChange(filter.value)}
            >
              {Icon ? <Icon className="size-3.5" /> : null}
              {filter.label}
            </FilterChip>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground">
        {resultsCount} cours trouvé{resultsCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
