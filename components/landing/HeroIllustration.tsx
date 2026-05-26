type HeroIllustrationProps = {
  className?: string;
};

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function CheckMark() {
  return (
    <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--accent)] text-[11px] leading-none text-white">
      ✓
    </span>
  );
}

function StepBadge({ active, children }: { active?: boolean; children: string }) {
  return (
    <div
      className={joinClasses(
        'grid h-8 w-8 place-items-center rounded-full border text-sm font-semibold',
        active ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--border)] bg-[var(--surface)] text-muted'
      )}
    >
      {children}
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[23rem]">
      <div className="absolute -left-3 top-8 h-[92%] w-[92%] rounded-[3rem] bg-[#0b1110]/10 blur-xl" />
      <div className="absolute inset-y-0 left-0 right-0 mx-auto w-[96%] rounded-[3rem] border border-[#1f2937] bg-[#0b0f12] shadow-[0_30px_70px_rgba(15,23,42,0.22)]" />
      <div className="relative overflow-hidden rounded-[3rem] border-[14px] border-[#0b0f12] bg-[#f8fafc] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
        <div className="absolute left-1/2 top-2 h-7 w-28 -translate-x-1/2 rounded-full bg-[#0b0f12]" />
        <div className="px-5 pb-5 pt-8">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#0f172a]">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0f172a]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#0f172a]/70" />
              <span className="h-2.5 w-6 rounded-full bg-[#0f172a]/70" />
            </div>
          </div>

          <div className="mt-8 space-y-1">
            <p className="text-2xl font-semibold tracking-tight text-[#111827]">Event Feedback Form</p>
            <p className="text-[14px] text-[#6b7280]">Help us improve future events</p>
          </div>

          <div className="mt-6 flex items-center gap-2 text-[11px] font-medium text-[#334155]">
            <div className="flex items-center gap-2">
              <CheckMark />
              <span>Details</span>
            </div>
            <div className="h-px flex-1 bg-[#e2e8f0]" />
            <div className="flex items-center gap-2 text-[var(--accent)]">
              <StepBadge active>2</StepBadge>
              <span className="font-semibold">Feedback</span>
            </div>
            <div className="h-px flex-1 bg-[#e2e8f0]" />
            <div className="flex items-center gap-2">
              <StepBadge>3</StepBadge>
              <span>Submit</span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-[18px] border border-[#e2e8f0] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
              <p className="text-sm font-medium text-[#111827]">How would you rate the event?</p>
              <div className="mt-4 flex gap-2">
                {['★', '★', '★', '★', '☆'].map((star, index) => (
                  <div
                    key={index}
                    className={joinClasses(
                      'grid h-10 w-10 place-items-center rounded-[10px] border text-[18px]',
                      index < 4 ? 'border-[#eaf4ef] bg-[#eaf4ef] text-[var(--accent)]' : 'border-[#e2e8f0] bg-white text-[#94a3b8]'
                    )}
                  >
                    {star}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[18px] border border-[#e2e8f0] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
              <p className="text-sm font-medium text-[#111827]">What did you like most?</p>
              <div className="mt-4 space-y-3 text-sm text-[#334155]">
                {[
                  ['Content', true],
                  ['Speakers', false],
                  ['Organization', true],
                  ['Venue', false],
                ].map(([label, checked]) => (
                  <div key={String(label)} className="flex items-center gap-3">
                    <span
                      className={joinClasses(
                        'grid h-5 w-5 place-items-center rounded-[5px] border',
                        checked ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[#cbd5e1] bg-white'
                      )}
                    >
                      {checked ? '✓' : ''}
                    </span>
                    <span>{String(label)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[18px] border border-[#e2e8f0] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
              <p className="text-sm font-medium text-[#111827]">Any suggestions?</p>
              <div className="mt-4 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm text-[#94a3b8]">
                Share your thoughts...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function HeroIllustration({ className = '' }: HeroIllustrationProps) {
  return (
    <figure className={joinClasses('pointer-events-none select-none', className)} aria-hidden="true">
      <div
        className="relative mx-auto h-[34rem] w-full max-w-[28rem] overflow-hidden sm:h-[36rem] sm:max-w-[32rem] lg:h-[38rem] lg:max-w-[35rem] xl:h-[40rem] xl:max-w-[38rem]"
        style={{
          maskImage: 'linear-gradient(to bottom, black 0%, black 74%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 74%, transparent 100%)',
        }}
      >
        <div className="absolute right-[-3rem] top-4 h-[92%] w-[92%] rounded-[3rem] border border-[var(--border)] bg-[var(--surface-muted)]/70 shadow-[0_16px_34px_rgba(15,23,42,0.05)]" />
        <div className="absolute right-[-1.5rem] top-10 h-[94%] w-[94%] rounded-[3rem] border border-[var(--border)] bg-[var(--surface-subtle)] shadow-[0_20px_42px_rgba(15,23,42,0.07)]" />
        <div className="absolute -bottom-10 right-[-0.5rem] scale-[1.08] sm:-bottom-8 sm:right-0 lg:scale-[1.14]">
          <PhoneMockup />
        </div>
      </div>
    </figure>
  );
}
