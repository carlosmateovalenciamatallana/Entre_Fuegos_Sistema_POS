// src/app/mesas/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronRight, LogOut, Search, UserRound } from "lucide-react";
import { useUserStore } from "@/store/userStore";

interface Account {
  table: string;
  waiter: string;
  elapsed: string;
  total: string;
  delayed?: boolean;
  empty?: boolean;
}

const accounts: Account[] = [
  { table: "T-01", waiter: "Sofía Ramírez", elapsed: "42 min", total: "$ 86.50" },
  { table: "T-04", waiter: "Marco Díaz", elapsed: "18 min", total: "$ 124.00" },
  { table: "T-07", waiter: "Lucía Torres", elapsed: "1 h 08 min", total: "$ 218.75", delayed: true },
  { table: "T-09", waiter: "Andrés Vega", elapsed: "35 min", total: "$ 57.00" },
  { table: "T-12", waiter: "Sofía Ramírez", elapsed: "12 min", total: "$ 142.25" },
  { table: "T-15", waiter: "Marco Díaz", elapsed: "—", total: "—", empty: true },
  { table: "T-18", waiter: "Lucía Torres", elapsed: "26 min", total: "$ 96.00" },
  { table: "T-21", waiter: "Andrés Vega", elapsed: "—", total: "—", empty: true },
];

export default function MesasPage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const [query, setQuery] = useState("");

  const filteredAccounts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return accounts;
    return accounts.filter((account) =>
      `${account.table} ${account.waiter}`.toLowerCase().includes(normalized),
    );
  }, [query]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[#10100f] text-[#f5f2ed]">
      <header className="border-b border-white/[0.08] bg-[#151513] px-10 py-7">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8">
          <div className="min-w-[220px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-400">Entre Fuegos</p>
            <h1 className="mt-1 text-2xl font-medium tracking-tight">Cuentas activas</h1>
          </div>

          <label className="group relative block w-full max-w-[680px]">
            <span className="sr-only">Buscar mesa o mesero</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#918d85]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por mesa o mesero..."
              className="h-14 w-full rounded-xl border border-white/[0.12] bg-[#20201d] pl-12 pr-4 text-[15px] text-white outline-none placeholder:text-[#77736c] transition focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#151513]"
            />
          </label>

          <div className="flex min-w-[220px] items-center justify-end gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name || "Turno de salón"}</p>
              <p className="mt-0.5 text-xs text-[#918d85]">Mesero en turno</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              className="rounded-lg border border-white/[0.1] p-3 text-[#aaa69d] transition hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <LogOut aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1440px] px-10 py-9">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-medium">Salón principal</h2>
              <span className="rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-300">{filteredAccounts.filter((account) => !account.empty).length} abiertas</span>
            </div>
            <p className="mt-2 text-sm text-[#918d85]">Selecciona una cuenta para continuar con el servicio.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#918d85]">
            <span className="size-2 rounded-full bg-emerald-400" aria-hidden="true" /> Actualizado hace un momento
          </div>
        </div>

        {filteredAccounts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.14] px-6 py-20 text-center text-[#918d85]">No encontramos mesas o meseros con esa búsqueda.</div>
        ) : (
          <div className="grid grid-cols-4 gap-5">
            {filteredAccounts.map((account) => (
              <button
                key={account.table}
                type="button"
                disabled={account.empty}
                onClick={() => router.push(`/mesas/${account.table.replace("T-", "")}?edit=true`)}
                className={`group relative min-h-[220px] rounded-xl border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${account.empty ? "cursor-default border-dashed border-white/[0.08] bg-white/[0.015] opacity-60" : "border-white/[0.1] bg-[#181816] hover:-translate-y-0.5 hover:border-orange-500/50 hover:bg-[#1d1d1a]"}`}
              >
                <div className="flex items-start justify-between">
                  <span className={`text-2xl font-semibold tracking-tight ${account.empty ? "text-[#77736c]" : "text-orange-300"}`}>{account.table}</span>
                  {!account.empty && <ChevronRight aria-hidden="true" className="text-[#77736c] transition group-hover:translate-x-1 group-hover:text-orange-300" />}
                </div>
                {account.empty ? (
                  <div className="flex h-[140px] flex-col items-center justify-center gap-2 text-center">
                    <UserRound aria-hidden="true" className="text-[#625f59]" />
                    <span className="text-sm text-[#77736c]">Sin cuenta activa</span>
                  </div>
                ) : (
                  <dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5">
                    <div><dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77736c]">Mesero</dt><dd className="mt-1 truncate text-sm text-[#ddd9d1]">{account.waiter}</dd></div>
                    <div><dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77736c]">Espera</dt><dd className={`mt-1 text-sm ${account.delayed ? "font-medium text-red-400" : "text-[#ddd9d1]"}`}>{account.delayed ? <span className="inline-flex items-center gap-1.5"><AlertTriangle aria-hidden="true" className="size-4" />{account.elapsed}</span> : account.elapsed}</dd></div>
                    <div className="col-span-2 border-t border-white/[0.08] pt-4"><dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77736c]">Total</dt><dd className="mt-1 text-xl font-medium text-[#f5f2ed]">{account.total}</dd></div>
                  </dl>
                )}
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
