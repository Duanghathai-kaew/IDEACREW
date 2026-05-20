import type { ReactNode } from "react";

function PulseShell({ children }: { children: ReactNode }) {
  return <div className="animate-pulse">{children}</div>;
}

export function RootAppLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eef4ff_52%,#fff7f5_100%)]">
      <PulseShell>
        <header className="border-b border-white/70 bg-white/80 shadow-sm backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="h-10 w-36 rounded-full bg-slate-200" />
            <div className="hidden items-center gap-6 md:flex">
              <div className="h-4 w-16 rounded-full bg-slate-200" />
              <div className="h-4 w-20 rounded-full bg-slate-200" />
              <div className="h-4 w-24 rounded-full bg-slate-200" />
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden h-10 w-10 rounded-full bg-slate-200 md:block" />
              <div className="h-10 w-28 rounded-full bg-slate-200" />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
          <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_12px_40px_rgb(253_94_75/0.08)] backdrop-blur md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="h-4 w-28 rounded-full bg-slate-200" />
                <div className="h-10 w-[min(28rem,100%)] rounded-full bg-slate-200" />
                <div className="h-4 w-[min(34rem,92%)] rounded-full bg-slate-200" />
                <div className="flex flex-wrap gap-3 pt-2">
                  <div className="h-10 w-32 rounded-full bg-slate-200" />
                  <div className="h-10 w-28 rounded-full bg-slate-200" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:w-88 lg:shrink-0">
                <div className="h-24 rounded-2xl bg-slate-200" />
                <div className="h-24 rounded-2xl bg-slate-200" />
              </div>
            </div>
          </section>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr] lg:gap-6">
            <aside className="hidden lg:block">
              <section className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_10px_30px_rgb(253_94_75/0.08)]">
                <div className="mb-4 h-5 w-36 rounded-full bg-slate-200" />
                <div className="space-y-3">
                  <div className="h-10 rounded-xl bg-slate-200" />
                  <div className="h-10 rounded-xl bg-slate-200" />
                  <div className="h-10 rounded-xl bg-slate-200" />
                  <div className="h-10 rounded-xl bg-slate-200" />
                </div>
              </section>
            </aside>

            <section className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <article
                    key={index}
                    className="rounded-3xl border border-white/70 bg-white p-5 shadow-[0_10px_30px_rgb(253_94_75/0.08)]"
                  >
                    <div className="mb-4 h-5 w-3/5 rounded-full bg-slate-200" />
                    <div className="space-y-3">
                      <div className="h-4 w-full rounded-full bg-slate-200" />
                      <div className="h-4 w-[88%] rounded-full bg-slate-200" />
                      <div className="h-4 w-[74%] rounded-full bg-slate-200" />
                    </div>
                    <div className="mt-5 flex items-center gap-2">
                      <div className="h-8 w-20 rounded-full bg-slate-200" />
                      <div className="h-8 w-16 rounded-full bg-slate-200" />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </main>
      </PulseShell>
    </div>
  );
}

export function HomeLoadingSkeleton() {
  return (
    <main className="min-h-screen bg-linear-to-br from-pink-50 via-white to-slate-50 px-6 py-16">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center rounded-3xl border border-white/70 bg-white/80 px-8 py-14 text-center shadow-xl shadow-pink-100/60 backdrop-blur">
        <PulseShell>
          <div className="mx-auto h-12 w-12 rounded-full bg-slate-200" />
          <div className="mt-5 h-4 w-24 rounded-full bg-slate-200" />
          <div className="mx-auto mt-4 h-8 w-52 rounded-full bg-slate-200" />
          <div className="mx-auto mt-4 h-4 w-[min(24rem,100%)] rounded-full bg-slate-200" />
          <div className="mt-8 h-10 w-32 rounded-full bg-slate-200" />
        </PulseShell>
      </div>
    </main>
  );
}

export function LoginLoadingSkeleton() {
  return (
    <main className="min-h-screen bg-linear-to-br from-pink-50 via-pink-50 to-slate-50 px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <PulseShell>
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-slate-200" />
            <div className="mx-auto h-8 w-40 rounded-full bg-slate-200" />
            <div className="mx-auto mt-3 h-4 w-64 max-w-full rounded-full bg-slate-200" />
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-md">
            <div className="space-y-5">
              <div className="h-11 rounded-xl bg-slate-200" />
              <div className="h-11 rounded-xl bg-slate-200" />
              <div className="h-11 rounded-xl bg-slate-200" />
              <div className="h-12 rounded-xl bg-slate-200" />
            </div>
          </div>

          <div className="mx-auto mt-8 h-4 w-40 rounded-full bg-slate-200" />
        </PulseShell>
      </div>
    </main>
  );
}

export function AddProjectLoadingSkeleton() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,rgba(15,23,42,0.5),rgba(15,23,42,0.28))] px-4 py-6 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center justify-center">
        <div className="w-full max-w-3xl rounded-[28px] border border-white/60 bg-white p-6 shadow-[0_24px_70px_rgb(15_23_42/0.18)] sm:p-8">
          <PulseShell>
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-3">
                <div className="h-4 w-24 rounded-full bg-slate-200" />
                <div className="h-8 w-64 rounded-full bg-slate-200" />
                <div className="h-4 w-[min(30rem,100%)] rounded-full bg-slate-200" />
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-200" />
            </div>

            <div className="mt-8 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="h-4 w-28 rounded-full bg-slate-200" />
                  <div className="h-12 rounded-xl bg-slate-200" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-28 rounded-full bg-slate-200" />
                  <div className="h-12 rounded-xl bg-slate-200" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-4 w-36 rounded-full bg-slate-200" />
                <div className="h-32 rounded-2xl bg-slate-200" />
              </div>

              <div className="space-y-2">
                <div className="h-4 w-40 rounded-full bg-slate-200" />
                <div className="h-24 rounded-2xl bg-slate-200" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <div className="h-11 w-24 rounded-xl bg-slate-200" />
                <div className="h-11 w-32 rounded-xl bg-slate-200" />
              </div>
            </div>
          </PulseShell>
        </div>
      </div>
    </main>
  );
}

export function ProfileLoadingSkeleton() {
  return (
    <>
      <PulseShell>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="h-9 w-40 rounded-full bg-slate-200" />
            <div className="hidden flex-1 items-center justify-center md:flex">
              <div className="flex items-center gap-6">
                <div className="h-4 w-16 rounded-full bg-slate-200" />
                <div className="h-4 w-24 rounded-full bg-slate-200" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden h-10 w-10 rounded-full bg-slate-200 md:block" />
              <div className="h-9 w-28 rounded-xl bg-slate-200" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-10">
          <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-slate-200" />
                <div className="space-y-3">
                  <div className="h-7 w-56 rounded-full bg-slate-200" />
                  <div className="h-4 w-80 max-w-full rounded-full bg-slate-200" />
                </div>
              </div>
              <div className="h-10 w-32 rounded-xl bg-slate-200" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <div className="h-4 w-28 rounded-full bg-slate-200" />
                <div className="h-12 rounded-xl bg-slate-200" />
                <div className="h-12 rounded-xl bg-slate-200" />
                <div className="h-12 rounded-xl bg-slate-200" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-32 rounded-full bg-slate-200" />
                <div className="h-12 rounded-xl bg-slate-200" />
                <div className="h-12 rounded-xl bg-slate-200" />
                <div className="h-12 rounded-xl bg-slate-200" />
              </div>
            </div>
          </section>
        </main>
      </PulseShell>
    </>
  );
}

export function MyProjectLoadingSkeleton() {
  return (
    <>
      <PulseShell>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="h-9 w-40 rounded-full bg-slate-200" />
            <div className="hidden flex-1 items-center justify-center md:flex">
              <div className="flex items-center gap-6">
                <div className="h-4 w-16 rounded-full bg-slate-200" />
                <div className="h-4 w-24 rounded-full bg-slate-200" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden h-10 w-10 rounded-full bg-slate-200 md:block" />
              <div className="h-9 w-28 rounded-xl bg-slate-200" />
            </div>
          </div>
        </header>

        <main className="bg-surface-warm">
          <section className="mx-auto max-w-4xl px-6 pb-16 pt-10">
            <div className="mb-10 space-y-3 text-center">
              <div className="mx-auto h-8 w-56 rounded-full bg-slate-200" />
              <div className="mx-auto h-4 w-80 max-w-full rounded-full bg-slate-200" />
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <div className="h-10 w-24 rounded-full bg-slate-200" />
                <div className="h-10 w-28 rounded-full bg-slate-200" />
                <div className="h-10 w-24 rounded-full bg-slate-200" />
                <div className="h-10 w-32 rounded-full bg-slate-200" />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <section
                    key={index}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="mb-4 h-6 w-40 rounded-full bg-slate-200" />
                    <div className="space-y-4">
                      <div className="h-28 rounded-2xl bg-slate-200" />
                      <div className="h-20 rounded-2xl bg-slate-200" />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-10 rounded-xl bg-slate-200" />
                        <div className="h-10 rounded-xl bg-slate-200" />
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </section>
        </main>
      </PulseShell>
    </>
  );
}

export function PublicProfileLoadingSkeleton() {
  return (
    <>
      <PulseShell>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="h-9 w-40 rounded-full bg-slate-200" />
            <div className="hidden flex-1 items-center justify-center md:flex">
              <div className="flex items-center gap-6">
                <div className="h-4 w-16 rounded-full bg-slate-200" />
                <div className="h-4 w-24 rounded-full bg-slate-200" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden h-10 w-10 rounded-full bg-slate-200 md:block" />
              <div className="h-9 w-28 rounded-xl bg-slate-200" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-10">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-full bg-slate-200" />
                <div className="space-y-3 pt-1">
                  <div className="h-7 w-56 rounded-full bg-slate-200" />
                  <div className="h-4 w-80 max-w-full rounded-full bg-slate-200" />
                  <div className="h-4 w-44 rounded-full bg-slate-200" />
                </div>
              </div>
              <div className="h-10 w-32 rounded-xl bg-slate-200" />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <section className="rounded-2xl border border-slate-200 p-5">
                  <div className="mb-4 h-5 w-32 rounded-full bg-slate-200" />
                  <div className="space-y-3">
                    <div className="h-4 w-full rounded-full bg-slate-200" />
                    <div className="h-4 w-[92%] rounded-full bg-slate-200" />
                    <div className="h-4 w-[84%] rounded-full bg-slate-200" />
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 p-5">
                  <div className="mb-4 h-5 w-40 rounded-full bg-slate-200" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="h-24 rounded-2xl bg-slate-200" />
                    <div className="h-24 rounded-2xl bg-slate-200" />
                  </div>
                </section>
              </div>

              <aside className="space-y-6">
                <section className="rounded-2xl border border-slate-200 p-5">
                  <div className="mb-4 h-5 w-36 rounded-full bg-slate-200" />
                  <div className="space-y-3">
                    <div className="h-12 rounded-xl bg-slate-200" />
                    <div className="h-12 rounded-xl bg-slate-200" />
                  </div>
                </section>
              </aside>
            </div>
          </section>
        </main>
      </PulseShell>
    </>
  );
}

export function MyProjectEditLoadingSkeleton() {
  return (
    <>
      <PulseShell>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="h-9 w-40 rounded-full bg-slate-200" />
            <div className="hidden flex-1 items-center justify-center md:flex">
              <div className="flex items-center gap-6">
                <div className="h-4 w-16 rounded-full bg-slate-200" />
                <div className="h-4 w-24 rounded-full bg-slate-200" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden h-10 w-10 rounded-full bg-slate-200 md:block" />
              <div className="h-9 w-28 rounded-xl bg-slate-200" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-6 py-10">
          <div className="mb-6 space-y-3">
            <div className="h-4 w-52 rounded-full bg-slate-200" />
            <div className="h-8 w-56 rounded-full bg-slate-200" />
          </div>

          <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="h-4 w-28 rounded-full bg-slate-200" />
                <div className="h-12 rounded-xl bg-slate-200" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 rounded-full bg-slate-200" />
                <div className="h-12 rounded-xl bg-slate-200" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-4 w-32 rounded-full bg-slate-200" />
              <div className="h-32 rounded-2xl bg-slate-200" />
            </div>

            <div className="space-y-2">
              <div className="h-4 w-36 rounded-full bg-slate-200" />
              <div className="h-24 rounded-2xl bg-slate-200" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <div className="h-10 w-24 rounded-xl bg-slate-200" />
              <div className="h-10 w-32 rounded-xl bg-slate-200" />
            </div>
          </section>
        </main>
      </PulseShell>
    </>
  );
}

export function AdminDashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <PulseShell>
        <div className="space-y-3">
          <div className="h-4 w-28 rounded-full bg-slate-200" />
          <div className="h-8 w-56 rounded-full bg-slate-200" />
          <div className="h-4 w-[min(32rem,100%)] rounded-full bg-slate-200" />
        </div>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <article
              key={index}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="h-4 w-24 rounded-full bg-slate-200" />
              <div className="mt-3 h-9 w-16 rounded-full bg-slate-200" />
            </article>
          ))}
        </section>

        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="h-5 w-40 rounded-full bg-slate-200" />
            <div className="mt-2 h-4 w-56 rounded-full bg-slate-200" />
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-10 rounded-lg bg-slate-200" />
              ))}
            </div>
          </div>
        </section>
      </PulseShell>
    </div>
  );
}

export function AdminProjectsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <PulseShell>
        <div className="space-y-3">
          <div className="h-4 w-28 rounded-full bg-slate-200" />
          <div className="h-8 w-64 rounded-full bg-slate-200" />
          <div className="h-4 w-[min(34rem,100%)] rounded-full bg-slate-200" />
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="h-5 w-48 rounded-full bg-slate-200" />
            <div className="mt-2 h-4 w-56 rounded-full bg-slate-200" />
          </div>
          <div className="overflow-x-auto p-5">
            <div className="min-w-190 space-y-3">
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-4 rounded-full bg-slate-200" />
                ))}
              </div>
              {Array.from({ length: 6 }).map((_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-5 gap-3">
                  {Array.from({ length: 5 }).map((_, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className="h-12 rounded-lg bg-slate-200"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      </PulseShell>
    </div>
  );
}

export function AdminTagsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <PulseShell>
        <div className="space-y-3">
          <div className="h-4 w-28 rounded-full bg-slate-200" />
          <div className="h-8 w-56 rounded-full bg-slate-200" />
          <div className="h-4 w-[min(34rem,100%)] rounded-full bg-slate-200" />
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto p-5">
            <div className="min-w-170 space-y-3">
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-4 rounded-full bg-slate-200" />
                ))}
              </div>
              {Array.from({ length: 6 }).map((_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className="h-12 rounded-lg bg-slate-200"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      </PulseShell>
    </div>
  );
}

export function ProjectDetailLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#e8f4ff_100%)]">
      <PulseShell>
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="h-9 w-40 rounded-full bg-slate-200" />

            <div className="hidden flex-1 items-center justify-center md:flex">
              <div className="flex items-center gap-6">
                <div className="h-4 w-16 rounded-full bg-slate-200" />
                <div className="h-4 w-24 rounded-full bg-slate-200" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden h-10 w-10 rounded-full bg-slate-200 md:block" />
              <div className="h-9 w-28 rounded-xl bg-slate-200" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-6">
          <div className="rounded-[20px] border border-white/60 bg-white/70 p-6 shadow-[0_10px_30px_rgb(253_94_75/0.08)] backdrop-blur-sm md:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-slate-200" />
                <div className="space-y-3 pt-1">
                  <div className="h-7 w-64 rounded-full bg-slate-200" />
                  <div className="h-4 w-96 max-w-full rounded-full bg-slate-200" />
                  <div className="h-4 w-40 rounded-full bg-slate-200" />
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="h-7 w-20 rounded-full bg-slate-200" />
                    <span className="h-7 w-24 rounded-full bg-slate-200" />
                    <span className="h-7 w-16 rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>

              <div className="h-8 w-32 rounded-full bg-slate-200 lg:mt-2" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-10">
            <div className="space-y-6 lg:col-span-7">
              <section className="rounded-[20px] border border-[rgb(253_94_75/0.16)] bg-white p-6 shadow-[0_10px_30px_rgb(253_94_75/0.1)] md:p-8">
                <div className="mb-5 h-5 w-48 rounded-full bg-slate-200" />
                <div className="space-y-3">
                  <div className="h-4 w-full rounded-full bg-slate-200" />
                  <div className="h-4 w-[92%] rounded-full bg-slate-200" />
                  <div className="h-4 w-[78%] rounded-full bg-slate-200" />
                  <div className="h-4 w-[86%] rounded-full bg-slate-200" />
                </div>
              </section>

              <section className="rounded-[20px] border border-[rgb(253_94_75/0.16)] bg-white p-6 shadow-[0_10px_30px_rgb(253_94_75/0.1)] md:p-8">
                <div className="mb-5 h-5 w-56 rounded-full bg-slate-200" />
                <div className="space-y-6">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="mb-4 h-6 w-40 rounded-full bg-slate-200" />
                    <div className="space-y-3">
                      <div className="h-4 w-full rounded-full bg-slate-200" />
                      <div className="h-4 w-[88%] rounded-full bg-slate-200" />
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="h-7 w-20 rounded-full bg-slate-200" />
                      <span className="h-7 w-24 rounded-full bg-slate-200" />
                      <span className="h-7 w-18 rounded-full bg-slate-200" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="mb-4 h-6 w-44 rounded-full bg-slate-200" />
                    <div className="space-y-3">
                      <div className="h-4 w-full rounded-full bg-slate-200" />
                      <div className="h-4 w-[90%] rounded-full bg-slate-200" />
                      <div className="h-4 w-[72%] rounded-full bg-slate-200" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="mb-4 h-6 w-48 rounded-full bg-slate-200" />
                    <div className="space-y-3">
                      <div className="h-4 w-full rounded-full bg-slate-200" />
                      <div className="h-4 w-[85%] rounded-full bg-slate-200" />
                      <div className="h-4 w-[90%] rounded-full bg-slate-200" />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-6 lg:col-span-3">
              <section className="rounded-[20px] border border-[rgb(253_94_75/0.16)] bg-white p-6 shadow-[0_10px_30px_rgb(253_94_75/0.1)]">
                <div className="mb-4 h-5 w-36 rounded-full bg-slate-200" />
                <div className="space-y-4">
                  <div className="h-24 rounded-2xl bg-slate-200" />
                  <div className="h-11 rounded-xl bg-slate-200" />
                  <div className="h-11 rounded-xl bg-slate-200" />
                </div>
              </section>

              <section className="rounded-[20px] border border-[rgb(253_94_75/0.16)] bg-white p-6 shadow-[0_10px_30px_rgb(253_94_75/0.1)]">
                <div className="mb-4 h-5 w-44 rounded-full bg-slate-200" />
                <div className="space-y-4">
                  <div className="h-3 w-full rounded-full bg-slate-200" />
                  <div className="h-3 w-[90%] rounded-full bg-slate-200" />
                  <div className="h-3 w-[76%] rounded-full bg-slate-200" />
                  <div className="h-3 w-[60%] rounded-full bg-slate-200" />
                </div>
              </section>
            </aside>
          </div>
        </main>
      </PulseShell>
    </div>
  );
}
