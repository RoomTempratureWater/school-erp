"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LogLevel = "info" | "warning" | "error";

interface Log {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  userId: string;
  status: string;
  tags: string[];
  changedData: string;
}

type Filters = {
  level: string[];
  service: string[];
  status: string[];
};

const levelStyles: Record<string, string> = {
  info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  error: "bg-red-500/10 text-red-600 dark:text-red-400",
};

function LogRow({
  log,
  expanded,
  onToggle,
}: {
  log: Log;
  expanded: boolean;
  onToggle: () => void;
}) {
  const formattedTime = new Date(log.timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <>
      <motion.button
        onClick={onToggle}
        className="w-full p-4 text-left transition-colors hover:bg-muted/50 active:bg-muted/70"
        whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>

          <Badge
            variant="secondary"
            className={`flex-shrink-0 capitalize ${levelStyles[log.level] || levelStyles.info}`}
          >
            {log.level}
          </Badge>

          <time className="w-20 flex-shrink-0 font-mono text-xs text-muted-foreground hidden sm:block">
            {formattedTime}
          </time>

          <span className="flex-shrink-0 min-w-max text-sm font-medium text-foreground">
            {log.service}
          </span>

          <p className="flex-1 truncate text-sm text-muted-foreground">
            {log.message}
          </p>
        </div>
      </motion.button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border bg-muted/50"
          >
            <div className="space-y-4 p-4 text-xs">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    User ID
                  </p>
                  <p className="font-mono text-foreground font-bold">{log.userId}</p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Timestamp
                  </p>
                  <p className="font-mono text-xs text-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Record Details (JSON)
                </p>
                <div className="max-h-48 overflow-y-auto rounded border border-slate-200 bg-background p-3">
                  <pre className="font-mono text-[11px] text-foreground whitespace-pre-wrap break-all">
                    {log.changedData}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FilterPanel({
  filters,
  onChange,
  logs,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
  logs: Log[];
}) {
  const levels = Array.from(new Set(logs.map((log) => log.level)));
  const services = Array.from(new Set(logs.map((log) => log.service)));

  const toggleFilter = (category: keyof Filters, value: string) => {
    const current = filters[category];
    const updated = current.includes(value)
      ? current.filter((entry) => entry !== value)
      : [...current, value];

    onChange({
      ...filters,
      [category]: updated,
    });
  };

  const clearAll = () => {
    onChange({
      level: [],
      service: [],
      status: [],
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (group) => group.length > 0
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.05 }}
      className="flex h-full flex-col space-y-6 overflow-y-auto bg-card p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-6 text-xs"
          >
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Level
        </p>
        <div className="space-y-2">
          {levels.map((level) => {
            const selected = filters.level.includes(level);

            return (
              <motion.button
                key={level}
                type="button"
                whileHover={{ x: 2 }}
                onClick={() => toggleFilter("level", level)}
                aria-pressed={selected}
                className={`flex w-full items-center justify-between gap-2 border rounded-md px-3 py-2 text-sm transition-colors ${
                  selected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/40"
                }`}
              >
                <span className="capitalize">{level}</span>
                {selected && <Check className="h-3.5 w-3.5" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Service (Table)
        </p>
        <div className="space-y-2">
          {services.map((service) => {
            const selected = filters.service.includes(service);

            return (
              <motion.button
                key={service}
                type="button"
                whileHover={{ x: 2 }}
                onClick={() => toggleFilter("service", service)}
                aria-pressed={selected}
                className={`flex w-full items-center justify-between gap-2 border rounded-md px-3 py-2 text-sm transition-colors ${
                  selected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/40"
                }`}
              >
                <span>{service}</span>
                {selected && <Check className="h-3.5 w-3.5" />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export function InteractiveLogsTable({ initialLogs }: { initialLogs: Log[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Default to only show "error" level logs (which represent DELETE actions in our mapping)
  const [filters, setFilters] = useState<Filters>({
    level: ["error"], // 'error' is mapped to DELETE
    service: [],
    status: [],
  });

  const filteredLogs = useMemo(() => {
    return initialLogs.filter((log) => {
      const lowerQuery = searchQuery.toLowerCase();

      const matchSearch =
        log.message.toLowerCase().includes(lowerQuery) ||
        log.service.toLowerCase().includes(lowerQuery) ||
        log.userId.toLowerCase().includes(lowerQuery);

      const matchLevel =
        filters.level.length === 0 || filters.level.includes(log.level);
      const matchService =
        filters.service.length === 0 || filters.service.includes(log.service);

      return matchSearch && matchLevel && matchService;
    });
  }, [initialLogs, filters, searchQuery]);

  const activeFilters =
    filters.level.length + filters.service.length + filters.status.length;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-card p-4">
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logs by action, table, or user ID..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-9 pl-9 text-sm"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters((current) => !current)}
              className="relative h-9 px-3"
            >
              <Filter className="h-4 w-4" />
              {activeFilters > 0 && (
                <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center p-0 text-xs bg-destructive">
                  {activeFilters}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[320px] overflow-hidden relative">
        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              key="filters"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-r border-border h-full bg-white absolute z-10 shadow-xl"
            >
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                logs={initialLogs}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-border">
            <AnimatePresence mode="popLayout">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.02,
                    }}
                  >
                    <LogRow
                      log={log}
                      expanded={expandedId === log.id}
                      onToggle={() =>
                        setExpandedId((current) =>
                          current === log.id ? null : log.id
                        )
                      }
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 text-center"
                >
                  <p className="text-muted-foreground text-sm">
                    No logs match your filters.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
