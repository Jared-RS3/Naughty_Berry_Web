import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Baby,
  Briefcase,
  Cake,
  CalendarDays,
  Check,
  Crown,
  GraduationCap,
  Heart,
  Info,
  Loader2,
  Martini,
  Minus,
  PartyPopper,
  Pencil,
  Plus,
  Send,
  Star,
  Users,
  X,
} from 'lucide-react'
import { burstConfetti } from '../lib/confetti'
import { useTilt } from '../hooks/useTilt'
import { useIsMobile } from '../hooks/useIsMobile'
import {
  CUP_TARGET,
  SIGNATURE_CUP_TARGET,
  INDULGENT_MIN_GUESTS,
  INDULGENT_MAX_GUESTS,
  clampGuests,
  FLAVOURS,
  TOPPINGS,
  cupSrc,
  ICED_TEA_CAP,
  ICED_TEA_PRICE,
  TOPPING_PRICE,
  CONSENT_STATEMENT,
  CONSENT_NOTE,
  LIMITS,
  estimateTotal,
  packageName,
  rands,
  toEnquiryPayload,
  totalCups as sumCups,
  totalToppings as sumToppings,
  validateDetails,
  type FieldErrors,
  type PackageId,
  type Quote,
} from '../lib/quote'

/**
 * How many cups the chosen package holds. Little Moments and Signature are
 * fixed; Indulgent is sized by the guest slider, one cup per guest, so its cap
 * moves as the slider moves. `null` only ever means "no package chosen yet".
 */
function cupCapFor(pkg: PackageId | null, guests: number): number | null {
  if (pkg === 'little') return CUP_TARGET
  if (pkg === 'signature') return SIGNATURE_CUP_TARGET
  if (pkg === 'indulgent') return clampGuests(guests)
  return null
}

/**
 * The ceiling every count-changing path must respect. Never null: before a
 * package is chosen there is nothing to count, and falling back to the largest
 * cap keeps the clamp arithmetic total. This exists because `cupCapFor`
 * returning null used to be read as "no limit" rather than "no box".
 */
function countCapFor(pkg: PackageId | null, guests: number): number {
  return cupCapFor(pkg, guests) ?? INDULGENT_MAX_GUESTS
}

/**
 * /quote — the event quote builder, on its own route so it gets a whole screen
 * to play in rather than being squeezed under the Events section.
 *
 * The 3D is done with CSS transforms (`perspective` + `preserve-3d`) against
 * the real cup cut-outs, not a WebGL runtime. That is a deliberate trade: the
 * product photography already looks better than anything procedural geometry
 * would give us, and it keeps a marketing page off a ~600 kB 3D dependency.
 * The depth is real — cards tilt toward the pointer on their own axes, the
 * flavour picker is a true coverflow ring with items pushed back in Z, and the
 * stage sits on a rotateX'd floor.
 *
 * Submission goes to /api/enquiry (a Netlify function) rather than straight to
 * Airtable, because writing needs a token the browser must never hold.
 */

const BERRY = '#E8176D'
const EASE_OUT = [0.22, 1, 0.36, 1] as const

const OCCASIONS = [
  { label: 'Wedding', icon: Heart },
  { label: 'Birthday', icon: Cake },
  { label: 'Corporate Event', icon: Briefcase },
  { label: 'Graduation', icon: GraduationCap },
  { label: 'Baby Shower', icon: Baby },
  { label: 'Year End', icon: CalendarDays },
  { label: 'Girls Night', icon: Martini },
  { label: 'Something Else', icon: PartyPopper },
]

/** The one thing Indulgent has that Little Moments cannot: the branded stand
 *  itself, staffed, at your venue. It is the whole reason to trade up, so it is
 *  photographed on the card rather than described in a bullet. */
const STAND_PHOTO = '/Stand.webp'

const PKG_OPTIONS = [
  {
    id: 'little' as const,
    icon: Users,
    name: 'Little Moments',
    blurb: 'A box of 25 cups, mixed exactly how you like, delivered to your door.',
    priceLine: 'From R1 675',
    art: '/menu-cups/classic.webp',
    perks: ['25 cups, mixed', 'Delivered to you'],
  },
  {
    id: 'signature' as const,
    icon: Star,
    name: 'Signature',
    blurb: 'The Naughty Berry stand at your venue, a curated 50-cup spread, and our team serving all night.',
    priceLine: 'From R7 750',
    art: '/menu-cups/dubai.webp',
    perks: ['50 cups, mixed', 'The stand, on-site', 'Chocolate tap'],
  },
  {
    id: 'indulgent' as const,
    icon: Crown,
    name: 'Indulgent',
    blurb: 'The full Naughty Berry stand rolls up to your venue — chocolate tap flowing, our team serving all night.',
    priceLine: 'Custom quote',
    art: '/menu-cups/dubai.webp',
    perks: ['The stand, on-site', 'Chocolate tap', 'Our team, all night'],
  },
]

type StepKey = 'occasion' | 'package' | 'build' | 'details' | 'quote'

const ALL_STEPS: { key: StepKey; label: string }[] = [
  { key: 'occasion', label: 'Occasion' },
  { key: 'package', label: 'Package' },
  { key: 'build', label: 'The Build' },
  { key: 'details', label: 'Details' },
  { key: 'quote', label: 'Your Quote' },
]

/** `?pkg=` on the URL — how "Enquire Now" hands a package over from the Events
 *  cards. Read synchronously so the very first render already knows the package
 *  step is being skipped, rather than flashing it and then dropping it. */
function lockedPackageFromUrl(): PackageId | null {
  if (typeof window === 'undefined') return null
  const p = new URLSearchParams(window.location.search).get('pkg')
  return p === 'little' || p === 'signature' || p === 'indulgent' ? p : null
}

/**
 * Everything this page prints is an estimate, and it has to say so wherever a
 * number appears — an unqualified "R1 675" next to a Send button reads as a
 * price the customer has been quoted. The long form carries the actual terms;
 * the short form is for tighter spots where the long one would crowd out the
 * thing it's annotating.
 */
const ESTIMATE_NOTE =
  'This is an estimate, not a final price. It excludes travel, setup and other event fees, and pricing moves with supply and ingredient costs. Our team will email you a formal quote with the final price.'
const ESTIMATE_NOTE_SHORT =
  'Estimate only — excludes travel, setup and other fees. Final price is emailed to you.'

/** Boxed version, for the moments where the number is the focus. */
function EstimateNote({ className = '' }: { className?: string }) {
  return (
    <p
      className={`rounded-2xl bg-[#E8176D]/[0.07] px-4 py-3 text-[11.5px] leading-relaxed text-[#7A3B5E] ${className}`}
    >
      <Info size={12} className="mr-1.5 -mt-0.5 inline shrink-0 text-[#E8176D]" aria-hidden="true" />
      {ESTIMATE_NOTE}
    </p>
  )
}

const inputCls =
  'w-full rounded-2xl border border-[#E8176D]/20 bg-white/85 px-5 py-3.5 text-[15px] text-[#3B2116] placeholder:text-[#7A3B5E]/40 outline-none transition focus:border-[#E8176D] focus:ring-2 focus:ring-[#E8176D]/25'
const labelCls = 'mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#7A3B5E]'

const SLIDE = {
  enter: (d: number) => ({ x: d * 70, opacity: 0, rotateY: d * 8 }),
  center: { x: 0, opacity: 1, rotateY: 0 },
  exit: (d: number) => ({ x: d * -70, opacity: 0, rotateY: d * -8 }),
}

type SubmitState = 'idle' | 'sending' | 'done' | 'error'

/* ══════════════════════════ Page ══════════════════════════ */

export default function QuotePage() {
  const prefersReducedMotion = useReducedMotion()
  const isMobile = useIsMobile()

  // Arriving from "Enquire Now" locks the package in, so that step is dropped
  // from the journey entirely — being asked to pick again what you just picked
  // reads as the click not having worked.
  const [lockedPkg] = useState(lockedPackageFromUrl)
  const steps = useMemo(
    () => ALL_STEPS.filter((s) => !(s.key === 'package' && lockedPkg)),
    [lockedPkg]
  )

  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [occasion, setOccasion] = useState<string | null>(null)
  const [pkg, setPkg] = useState<PackageId | null>(lockedPkg)
  const [mix, setMix] = useState<Record<string, number>>({})
  /** What the visitor actually tapped. `toppings` below is this, capped. */
  const [pickedToppings, setPickedToppings] = useState<Record<string, number>>({})
  const [icedTeas, setIcedTeas] = useState(0)
  const [guests, setGuests] = useState(80)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    venue: '',
    notes: '',
    // Starts false and is never pre-ticked: POPIA consent has to be an act the
    // visitor performs, not a default they failed to undo.
    consent: false,
  })
  const [confirming, setConfirming] = useState(false)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Anti-bot signals the server checks. `honeypot` is bound to a field no human
  // can see; `startedAt` stamps when the page mounted, so a submission that
  // arrives implausibly fast can be dropped.
  const [honeypot, setHoneypot] = useState('')
  const startedAt = useRef(Date.now())

  const fieldErrors: FieldErrors = useMemo(() => validateDetails(form), [form])
  /** Errors only surface once the visitor has tried to move on. */
  const [showErrors, setShowErrors] = useState(false)

  // This route never mounts LoadingScreen, so nothing else would clear the boot
  // screen from index.html. Before paint, so it doesn't flash.
  useLayoutEffect(() => {
    document.getElementById('boot')?.remove()
  }, [])

  useEffect(() => {
    document.title = 'Build Your Quote – Naughty Berry | Cape Town'
    window.scrollTo(0, 0)
  }, [])

  const cups = useMemo(() => sumCups(mix), [mix])
  // "Is this a fixed box?" — a question about which UI to show, not about
  // limits. Indulgent is capped too now; its cap is just one the customer sets.
  const capped = pkg === 'little' || pkg === 'signature'
  const target = cupCapFor(pkg, guests)
  const remaining = (target ?? 0) - cups

  // A topping dresses a cup that already exists, so the ceiling is however many
  // cups are actually IN the order — not how many the box holds. Thirteen cups
  // into a 50-cup box there are thirteen cups to top; offering fifty is how you
  // get "50 topped cups" billed onto an order containing thirteen. The cap grows
  // as the box fills, so a finished 50-cup box can top all fifty.
  //
  // Every package now, Indulgent included. It used to be `max(cups, guests)`
  // there, on the theory that the spread might be left blank — which meant 60
  // cups could carry 70 toppings, billing a topping onto a cup that was never
  // ordered.
  //
  // The toppings SHARE that budget rather than each getting one: a 25-cup box
  // cannot carry 25 Dubai and 25 Cream, because that would be 50 cups.
  //
  // Applied on read rather than written back into state, so trimming the box and
  // refilling it restores the original pick instead of losing it. Earlier
  // toppings get first call on the budget, keeping the trim deterministic.
  const toppingCap = cups

  const toppings = useMemo(() => {
    const out: Record<string, number> = {}
    let left = toppingCap
    for (const t of TOPPINGS) {
      const n = Math.min(pickedToppings[t.id] ?? 0, Math.max(0, left))
      if (n > 0) {
        out[t.id] = n
        left -= n
      }
    }
    return out
  }, [pickedToppings, toppingCap])

  const estimate = estimateTotal(pkg ?? 'little', icedTeas, toppings)

  const setTopping = useCallback(
    (id: string, value: number) => {
      setPickedToppings((t) => {
        // Whatever the other topping already claimed is not available to this
        // one, so the room left is the shared budget minus its total.
        const others = TOPPINGS.reduce(
          (sum, x) => (x.id === id ? sum : sum + Math.max(0, t[x.id] ?? 0)),
          0
        )
        const room = Math.max(0, toppingCap - Math.min(others, toppingCap))
        const next = Math.min(
          room,
          Math.max(0, Math.trunc(Number.isFinite(value) ? value : 0))
        )
        if (next === 0) {
          const rest = { ...t }
          delete rest[id]
          return rest
        }
        return { ...t, [id]: next }
      })
    },
    [toppingCap]
  )

  // Every package is capped; Indulgent's cap is the guest count, which is why
  // `guests` is in the dependency list — leave it out and the callback closes
  // over the guest count as it was when the package was picked, so dragging the
  // slider would stop moving the cup limit.
  const bump = useCallback(
    (id: string, delta: number) => {
      setMix((m) => {
        // Recount inside the updater — the render-scope total goes stale when
        // two taps land in the same React batch, which is when the cap bites.
        const total = Object.values(m).reduce((a, b) => a + b, 0)
        const cap = countCapFor(pkg, guests)
        if (delta > 0 && total >= cap) return m
        const next = Math.max(0, (m[id] ?? 0) + delta)
        if (next === 0) {
          const rest = { ...m }
          delete rest[id]
          return rest
        }
        return { ...m, [id]: next }
      })
    },
    [pkg, guests]
  )

  // Typing a number directly is the fast path for anyone who doesn't want to
  // tap "+" dozens of times to fill a 25- or 50-cup box.
  const setCount = useCallback(
    (id: string, value: number) => {
      setMix((m) => {
        // Always a number now. This used to skip the clamp entirely when the
        // package had no box, which is how a typed 333290333 reached state.
        const cap = countCapFor(pkg, guests)
        const current = m[id] ?? 0
        const others = Object.values(m).reduce((a, b) => a + b, 0) - current
        let next = Math.max(0, Math.trunc(Number.isFinite(value) ? value : 0))
        next = Math.min(next, Math.max(0, cap - others))
        if (next === 0) {
          const rest = { ...m }
          delete rest[id]
          return rest
        }
        return { ...m, [id]: next }
      })
    },
    [pkg, guests]
  )

  const stepKey = steps[step].key
  const isLast = step === steps.length - 1

  const canProceed =
    stepKey === 'occasion' ? occasion !== null
    : stepKey === 'package' ? pkg !== null
    // One rule for all three packages now: the box has to be exactly full. The
    // only difference is where the number comes from — fixed for the boxes, the
    // guest slider for Indulgent. This was a bare `true` for Indulgent, which
    // let a 1-cup spread for 50 guests through to the server.
    : stepKey === 'build' ? cups === target
    : stepKey === 'details' ? Object.keys(fieldErrors).length === 0
    : true

  const go = (d: number) => {
    // Moving forward off the details step reveals whatever is still wrong
    // rather than silently doing nothing.
    if (d > 0 && stepKey === 'details' && !canProceed) {
      setShowErrors(true)
      return
    }
    setDir(d)
    setStep((s) => Math.min(steps.length - 1, Math.max(0, s + d)))
  }

  const goToStep = (key: StepKey) => {
    const i = steps.findIndex((s) => s.key === key)
    if (i === -1) return
    setDir(i < step ? -1 : 1)
    setStep(i)
  }

  // Every step is a fresh screen, so it starts at the top. This has to run
  // after the commit — scrolling inside the click handler races the step swap
  // and lands part-way down the new content.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [step])

  // The celebration lands when the finished quote does — once per arrival, and
  // never again if they step back to tweak something and return.
  const celebrated = useRef(false)
  useEffect(() => {
    if (stepKey !== 'quote' || celebrated.current) return
    celebrated.current = true
    const stop = burstConfetti({ originY: 0.32 })
    return stop
  }, [stepKey])

  const quote: Quote = {
    occasion: occasion ?? '',
    pkg: pkg ?? 'little',
    mix,
    toppings,
    icedTeas,
    guests,
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    date: form.date,
    time: form.time,
    venue: form.venue.trim(),
    notes: form.notes.trim(),
    consent: form.consent,
  }

  const submit = async () => {
    // Re-entrancy guard. The confirm button is disabled while sending, which
    // covers the ordinary double-click, but a disabled attribute is a UI state
    // and not a lock: a keyboard repeat, an assistive tool, or a re-render
    // between the click and the state flip can all call this twice, and each
    // call is a separate lead in Airtable that staff then has to de-duplicate.
    // `submitState` is checked rather than a ref because React batches the
    // update before the await, so the second call always sees 'sending'.
    if (submitState === 'sending' || submitState === 'done') return

    // Never trust the button alone — re-check before firing, in case state was
    // reached by a route the UI didn't anticipate.
    if (Object.keys(fieldErrors).length > 0) {
      setConfirming(false)
      setShowErrors(true)
      goToStep('details')
      return
    }

    setSubmitState('sending')
    setSubmitError(null)
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(toEnquiryPayload(quote, startedAt.current, honeypot)),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? `Request failed (${res.status})`)
      }
      setConfirming(false)
      setSubmitState('done')
      burstConfetti({ originY: 0.3, count: 190 })
    } catch (e) {
      setSubmitState('error')
      setSubmitError(e instanceof Error ? e.message : 'Something went wrong.')
    }
  }

  /* ── Sent ── */
  if (submitState === 'done') {
    return (
      <Shell>
        <SentScreen name={form.name} />
      </Shell>
    )
  }

  return (
    <Shell>
      {/* Progress rail */}
      <div className="mx-auto mb-10 flex max-w-3xl items-center gap-3 px-1">
        <span className="font-display text-lg leading-none text-[#E8176D]">
          0{step + 1}
        </span>
        <span className="relative block h-[3px] flex-1 overflow-hidden rounded-full bg-[#E8176D]/15">
          <motion.span
            className="absolute inset-y-0 left-0 rounded-full bg-[#E8176D]"
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
          />
        </span>
        <span className="text-xs font-bold leading-none text-[#B0698C]">0{steps.length}</span>
        <span className="hidden text-[11px] font-bold uppercase tracking-[0.18em] text-[#7A3B5E] sm:block">
          {steps[step].label}
        </span>
      </div>

      <div style={{ perspective: 1400 }}>
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={stepKey}
            custom={dir}
            variants={prefersReducedMotion ? undefined : SLIDE}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: EASE_OUT }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {stepKey === 'occasion' && <StepOccasion value={occasion} onPick={setOccasion} />}
            {stepKey === 'package' && <StepPackage value={pkg} onPick={setPkg} />}
            {stepKey === 'build' && capped && pkg && (
              <StepBox
                target={target ?? 0}
                mix={mix}
                cups={cups}
                remaining={remaining}
                estimate={estimate}
                icedTeas={icedTeas}
                toppings={toppings}
                toppingCap={toppingCap}
                onBump={bump}
                onSet={setCount}
                onIcedTeas={setIcedTeas}
                onTopping={setTopping}
                onTopUp={() =>
                  setMix((m) => {
                    const total = Object.values(m).reduce((a, b) => a + b, 0)
                    const gap = Math.max(0, (target ?? 0) - total)
                    return gap ? { ...m, classic: (m.classic ?? 0) + gap } : m
                  })
                }
                isMobile={isMobile}
              />
            )}
            {stepKey === 'build' && pkg === 'indulgent' && (
              <StepStation
                guests={guests}
                mix={mix}
                isMobile={isMobile}
                onGuests={setGuests}
                onBump={bump}
                onSet={setCount}
                icedTeas={icedTeas}
                onIcedTeas={setIcedTeas}
                toppings={toppings}
                toppingCap={toppingCap}
                onTopping={setTopping}
              />
            )}
            {stepKey === 'details' && (
              <StepDetails
                form={form}
                onChange={setForm}
                errors={fieldErrors}
                showAll={showErrors}
                honeypot={honeypot}
                onHoneypot={setHoneypot}
              />
            )}
            {stepKey === 'quote' && (
              <StepReview
                quote={quote}
                estimate={estimate}
                onEdit={() => goToStep('build')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Nav ── */}
      <div className="mx-auto mt-12 flex max-w-3xl items-center justify-between gap-4">
        <button
          onClick={() => go(-1)}
          disabled={step === 0}
          className="nb-pill inline-flex items-center gap-2 px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-[#7A3B5E] transition hover:text-[#E8176D] disabled:pointer-events-none disabled:opacity-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8176D]"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {capped && (stepKey === 'build' || stepKey === 'details') && (
          <span className="hidden text-center sm:block">
            <span className="block text-sm font-bold text-[#E8176D]" aria-live="polite">
              Estimated {rands(estimate)}
            </span>
            <span className="block text-[10.5px] text-[#7A3B5E]/70">includes travel fee</span>
          </span>
        )}

        {!isLast ? (
          <motion.button
            whileHover={canProceed ? { scale: 1.04 } : undefined}
            whileTap={canProceed ? { scale: 0.96 } : undefined}
            onClick={() => go(1)}
            // The details step keeps its button live even when invalid, so the
            // click can point at what's wrong. A dead button with no explanation
            // is the worst of both.
            disabled={!canProceed && stepKey !== 'details'}
            className="inline-flex items-center gap-2 rounded-full bg-[#E8176D] px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_14px_32px_rgba(232,23,109,0.32)] transition hover:bg-[#C01057] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8176D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFDCEA]"
          >
            Next
            <ArrowRight size={14} />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setConfirming(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#E8176D] px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_14px_32px_rgba(232,23,109,0.32)] transition hover:bg-[#C01057] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8176D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFDCEA]"
          >
            <Send size={14} />
            Send my quote
          </motion.button>
        )}
      </div>

      {!canProceed && (
        <p className="mx-auto mt-3 max-w-3xl text-right text-[12px] text-[#7A3B5E]/70">
          {stepKey === 'occasion' && 'Pick an occasion to continue'}
          {stepKey === 'package' && 'Choose a package to continue'}
          {stepKey === 'build' && remaining > 0 && `${remaining} more cup${remaining === 1 ? '' : 's'} to fill your box`}
          {/* When the tick is the only thing missing, say so — "we need your
              name" next to a filled-in name field reads as a broken form. */}
          {stepKey === 'details' &&
            (Object.keys(fieldErrors).length === 1 && fieldErrors.consent
              ? 'Please tick the box above to continue'
              : 'Please fill in everything except the start time and notes')}
        </p>
      )}

      <ConfirmDialog
        open={confirming}
        sending={submitState === 'sending'}
        error={submitError}
        quote={quote}
        estimate={estimate}
        onCancel={() => {
          setConfirming(false)
          setSubmitState('idle')
        }}
        onConfirm={submit}
      />
    </Shell>
  )
}

/* ══════════════════════════ Chrome ══════════════════════════ */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FFDCEA] text-[#2D1225]">
      <header className="sticky top-0 z-50 border-b border-[#E8176D]/10 bg-[#FFDCEA]/95 sm:bg-[#FFDCEA]/80 sm:backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#E8176D] transition-colors hover:text-[#C01057]"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Back to Naughty Berry</span>
            <span className="sm:hidden">Back</span>
          </a>
          <a href="/" aria-label="Naughty Berry home">
            <img src="/naughty-berry-logo.png" alt="Naughty Berry" className="h-8 w-auto object-contain sm:h-9" />
          </a>
          <span className="w-[46px] sm:w-[150px]" aria-hidden="true" />
        </div>
      </header>

      {/* Soft depth wash so the 3D stage has something to sit in. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-1/3 h-[60vh] opacity-70"
        style={{ background: 'radial-gradient(60% 50% at 50% 40%, #FFB8D2 0%, transparent 70%)' }}
      />

      <main className="relative mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-6 md:pt-14">{children}</main>
    </div>
  )
}

function StepHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-9 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="uppercase leading-[1.02] text-[clamp(1.6rem,4.4vw,2.9rem)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {/* `|` splits the headline onto its own lines, alternating berry/cocoa
            the way every other heading on the site does. */}
        {title.split('|').map((part, i) => (
          <span key={part} className={`block ${i % 2 ? 'text-[#3B2116]' : 'text-[#E8176D]'}`}>
            {part}
          </span>
        ))}
      </motion.h1>
      <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-[#7A3B5E]">{sub}</p>
    </div>
  )
}

/** Card that tilts toward the pointer on its own 3D axes. */
function TiltCard({
  children,
  className = '',
  onClick,
  active,
  ariaPressed,
  max = 9,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  active?: boolean
  ariaPressed?: boolean
  max?: number
}) {
  const tilt = useTilt(max)
  return (
    <motion.div
      ref={tilt.ref}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={ariaPressed}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      whileHover={{ y: -6 }}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`relative ${onClick ? 'cursor-pointer' : ''} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8176D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFDCEA] ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        transform:
          'perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateZ(0)',
      }}
    >
      {children}
      {active && (
        <span
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow"
          style={{ transform: 'translateZ(40px)' }}
        >
          <Check size={14} strokeWidth={3} className="text-[#E8176D]" aria-hidden="true" />
        </span>
      )}
    </motion.div>
  )
}

/* ══════════════════════════ Steps ══════════════════════════ */

function StepOccasion({ value, onPick }: { value: string | null; onPick: (v: string) => void }) {
  return (
    <div>
      <StepHeading title="What are we|celebrating?" sub="Pick the occasion and we'll shape everything else around it." />
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3.5 sm:grid-cols-4">
        {OCCASIONS.map(({ label, icon: Icon }, i) => {
          const on = value === label
          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 24, rotateX: -18 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: i * 0.045, duration: 0.45, ease: EASE_OUT }}
            >
              <TiltCard onClick={() => onPick(label)} ariaPressed={on} max={12}>
                <div
                  className={`flex flex-col items-center gap-3 rounded-3xl px-3 py-7 text-[13px] font-semibold transition-colors ${
                    on
                      ? 'bg-[#E8176D] text-white shadow-[0_20px_40px_rgba(232,23,109,0.35)]'
                      : 'bg-[#FFF9ED] text-[#7A3B5E] shadow-[0_12px_28px_rgba(180,40,95,0.12)]'
                  }`}
                >
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${on ? 'bg-white/15' : 'bg-[#FFF0F6]'}`}
                    style={{ transform: 'translateZ(34px)' }}
                  >
                    <Icon size={22} strokeWidth={2} style={{ color: on ? '#fff' : BERRY }} aria-hidden="true" />
                  </span>
                  <span style={{ transform: 'translateZ(18px)' }}>{label}</span>
                </div>
              </TiltCard>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function StepPackage({ value, onPick }: { value: PackageId | null; onPick: (p: PackageId) => void }) {
  return (
    <div>
      <StepHeading title="Choose your|package." sub="All of them come with a lot of chocolate. Obviously." />
      <div className="mx-auto grid max-w-5xl items-start gap-5 sm:grid-cols-3">
        {PKG_OPTIONS.map(({ id, icon: Icon, name, blurb, priceLine, art, perks }, i) => {
          const on = value === id
          const hero = id === 'indulgent' || id === 'signature'
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 30, rotateY: i ? 14 : -14 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ delay: i * 0.1, duration: 0.55, ease: EASE_OUT }}
            >
              <TiltCard onClick={() => onPick(id)} ariaPressed={on} active={on} max={10}>
                <div
                  className={`relative overflow-hidden rounded-[26px] text-left ${
                    on
                      ? 'shadow-[0_30px_60px_rgba(192,16,87,0.42)]'
                      : 'shadow-[0_18px_40px_rgba(180,40,95,0.16)]'
                  } ${hero ? 'bg-[#3B0A22]' : on ? 'bg-[#E8176D]' : 'bg-[#FFF9ED]'}`}
                >
                  {/* Indulgent leads with the stand itself, darkened just enough
                      to carry white type. Little Moments stays a clean cream
                      card — the contrast is the pitch. */}
                  {hero && (
                    <>
                      <img
                        src={STAND_PHOTO}
                        alt="The Naughty Berry stand, staffed and serving at an event"
                        className="absolute inset-0 h-full w-full object-cover object-[50%_32%]"
                        loading="lazy"
                        draggable={false}
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0"
                        style={{
                          background: on
                            ? 'linear-gradient(180deg, rgba(232,23,109,0.55) 0%, rgba(120,10,58,0.86) 58%, rgba(59,10,34,0.97) 100%)'
                            : 'linear-gradient(180deg, rgba(59,10,34,0.34) 0%, rgba(59,10,34,0.80) 58%, rgba(59,10,34,0.96) 100%)',
                        }}
                      />
                      <span
                        className="absolute left-5 top-5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8176D]"
                        style={{ transform: 'translateZ(60px)' }}
                      >
                        The stand comes to you
                      </span>
                    </>
                  )}

                  <div className={`relative p-7 pb-8 ${hero ? 'pt-24' : ''}`}>
                    {!hero && <Icon size={22} style={{ color: on ? '#fff' : BERRY }} aria-hidden="true" />}

                    {/* The cup floats above the card face — the clearest read of
                        depth on the whole page. */}
                    <img
                      src={art}
                      alt=""
                      aria-hidden="true"
                      className="mx-auto h-32 w-auto select-none object-contain sm:h-36"
                      style={{
                        transform: `translateZ(${hero ? 96 : 70}px)`,
                        filter: 'drop-shadow(0 24px 28px rgba(40,8,24,0.5))',
                      }}
                      draggable={false}
                    />

                    <p
                      className={`mt-4 uppercase text-xl leading-none ${on || hero ? 'text-white' : 'text-[#3B2116]'}`}
                      style={{ fontFamily: 'var(--font-display)', transform: 'translateZ(34px)' }}
                    >
                      {name}
                    </p>
                    <p className={`mt-2.5 text-[13.5px] leading-snug ${on || hero ? 'text-white/85' : 'text-[#7A3B5E]'}`}>
                      {blurb}
                    </p>

                    <ul className="mt-4 space-y-1.5" style={{ transform: 'translateZ(20px)' }}>
                      {perks.map((perk) => (
                        <li
                          key={perk}
                          className={`flex items-center gap-2 text-[12.5px] font-semibold ${
                            on || hero ? 'text-white/90' : 'text-[#7A3B5E]'
                          }`}
                        >
                          <Check
                            size={12}
                            strokeWidth={3.5}
                            style={{ color: on || hero ? '#fff' : BERRY }}
                            aria-hidden="true"
                          />
                          {perk}
                        </li>
                      ))}
                    </ul>

                    <p className={`mt-5 text-lg font-bold ${on || hero ? 'text-white' : 'text-[#E8176D]'}`}>
                      {priceLine}
                    </p>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          )
        })}
      </div>

      <EstimateNote className="mx-auto mt-6 max-w-3xl text-center" />
    </div>
  )
}

/* ─────────── Shared 3D flavour picker ─────────── */

/**
 * The coverflow ring, used by both packages. Items sit on an arc — pushed back
 * in Z, rotated on Y and scaled by depth — so the picker reads as a real
 * turntable rather than a row of thumbnails. `full` locks adding once a capped
 * box is complete; an uncapped Indulgent spread never passes it.
 */
function CupCarousel({
  mix,
  onBump,
  onSet,
  isMobile,
  full = false,
  fullLabel = 'Box is full',
  addLabel = 'Add to box',
  max,
}: {
  mix: Record<string, number>
  onBump: (id: string, delta: number) => void
  onSet?: (id: string, value: number) => void
  isMobile: boolean
  full?: boolean
  fullLabel?: string
  addLabel?: string
  /** Ceiling for the typed input. `onSet` clamps to it as well — this is the
   *  browser-level hint, not the enforcement. */
  max: number
}) {
  const [active, setActive] = useState(0)
  const prefersReducedMotion = useReducedMotion()
  const n = FLAVOURS.length
  const flavour = FLAVOURS[active]
  const spin = (d: number) => setActive((a) => (a + d + n) % n)

  // Keyboard users get the ring too — arrow keys spin it.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); spin(-1) }
    if (e.key === 'ArrowRight') { e.preventDefault(); spin(1) }
  }

  return (
    <>
      {/* ── 3D stage ── */}
      <div
        className="relative mx-auto mb-2 max-w-3xl select-none"
        style={{ perspective: 1100 }}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="group"
        aria-label="Flavour picker. Use arrow keys to spin."
      >
        {/* Contact shadow pooling under the front cup, so it reads as standing
            on a surface rather than floating. Kept flat: a rotateX'd plane gets
            dragged off-centre by the stage's perspective origin. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[74%] h-[70px] w-[min(560px,88%)] -translate-x-1/2 rounded-[50%]"
          style={{
            background: 'radial-gradient(closest-side, rgba(180,40,95,0.26), transparent 74%)',
            filter: 'blur(10px)',
          }}
        />

        <div className="relative h-[290px] sm:h-[330px]" style={{ transformStyle: 'preserve-3d' }}>
          {FLAVOURS.map((f, i) => {
            // Signed shortest distance around the ring, so the wrap-around
            // neighbour slides in from the correct side instead of racing
            // across the whole stage.
            let off = i - active
            if (off > n / 2) off -= n
            if (off < -n / 2) off += n
            const abs = Math.abs(off)
            // Phones show one cup at a time: at 400px the neighbours sit under
            // the spin arrows. They still travel and tilt, just at zero opacity,
            // so a tap still reads as the next cup swinging in from off-stage
            // rather than a cross-fade — same trick as the menu carousel.
            const visible = isMobile ? abs === 0 : abs <= 2
            const count = mix[f.id] ?? 0

            return (
              <motion.div
                key={f.id}
                className="absolute left-1/2 top-0 h-full w-[190px] sm:w-[210px]"
                style={{ marginLeft: isMobile ? -95 : -105, transformStyle: 'preserve-3d' }}
                animate={{
                  x: off * (isMobile ? 132 : 168),
                  z: -abs * 190,
                  rotateY: off * -26,
                  scale: 1 - abs * 0.13,
                  opacity: visible ? 1 - abs * 0.28 : 0,
                  zIndex: 20 - abs,
                }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 180, damping: 24 }
                }
              >
                <button
                  onClick={() => (off === 0 ? onBump(f.id, 1) : setActive(i))}
                  disabled={off === 0 && full}
                  aria-label={off === 0 ? `Add one ${f.name}` : `Show ${f.name}`}
                  tabIndex={visible ? 0 : -1}
                  className="group flex h-full w-full flex-col items-center justify-end rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8176D] disabled:cursor-not-allowed"
                >
                  <span className="relative block">
                    <img
                      src={cupSrc(f.img, 480)}
                      alt=""
                      width={370}
                      height={480}
                      decoding="async"
                      className="h-[210px] w-auto object-contain transition-transform duration-300 group-hover:-translate-y-2 sm:h-[240px]"
                      style={{ filter: 'drop-shadow(0 24px 26px rgba(80,30,55,0.32))' }}
                      draggable={false}
                    />
                    <AnimatePresence>
                      {count > 0 && (
                        <motion.span
                          key={count}
                          initial={{ scale: 0.3, y: -6 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 17 }}
                          className="absolute -right-1 top-1 flex h-9 min-w-9 items-center justify-center rounded-full bg-[#E8176D] px-2 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(232,23,109,0.45)]"
                        >
                          ×{count}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Spin controls */}
        <button
          onClick={() => spin(-1)}
          aria-label="Previous flavour"
          className="absolute left-0 top-[45%] z-30 flex h-11 w-11 items-center justify-center rounded-full border border-[#E8176D]/25 bg-white/80 text-[#E8176D] transition hover:bg-[#E8176D] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8176D] sm:h-14 sm:w-14"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={() => spin(1)}
          aria-label="Next flavour"
          className="absolute right-0 top-[45%] z-30 flex h-11 w-11 items-center justify-center rounded-full border border-[#E8176D]/25 bg-white/80 text-[#E8176D] transition hover:bg-[#E8176D] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8176D] sm:h-14 sm:w-14"
        >
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Active flavour copy + add controls */}
      <div className="mb-8 text-center" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={flavour.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="font-display text-lg uppercase tracking-[0.14em] text-[#E8176D]">
              {flavour.name}
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-[#7A3B5E]/80">
              {flavour.blurb}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => onBump(flavour.id, -1)}
            disabled={(mix[flavour.id] ?? 0) === 0}
            aria-label={`Remove one ${flavour.name}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8176D]/25 text-[#E8176D] transition hover:bg-[#E8176D] hover:text-white disabled:pointer-events-none disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8176D]"
          >
            <Minus size={16} strokeWidth={2.5} />
          </button>
          <motion.button
            whileHover={full ? undefined : { scale: 1.04 }}
            whileTap={full ? undefined : { scale: 0.95 }}
            onClick={() => onBump(flavour.id, 1)}
            disabled={full}
            className="rounded-full bg-[#E8176D] px-7 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#C01057] disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8176D]"
          >
            {full ? fullLabel : addLabel}
          </motion.button>
          <button
            onClick={() => onBump(flavour.id, 1)}
            disabled={full}
            aria-label={`Add one ${flavour.name}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8176D]/25 text-[#E8176D] transition hover:bg-[#E8176D] hover:text-white disabled:pointer-events-none disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8176D]"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* For anyone who'd rather not tap "+" dozens of times to fill a big
            box — type the count directly. */}
        {onSet && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <label htmlFor={`qty-${flavour.id}`} className="text-[11px] font-semibold text-[#7A3B5E]/60">
              or type a number
            </label>
            <input
              id={`qty-${flavour.id}`}
              type="number"
              inputMode="numeric"
              min={0}
              max={max}
              value={mix[flavour.id] ?? 0}
              onChange={(e) => onSet(flavour.id, Number(e.target.value))}
              onFocus={(e) => e.target.select()}
              aria-label={`Set ${flavour.name} count`}
              className="w-16 rounded-full border border-[#E8176D]/20 bg-white/80 px-3 py-1.5 text-center text-[13px] font-bold text-[#3B2116] outline-none transition focus:border-[#E8176D] focus:ring-2 focus:ring-[#E8176D]/25"
            />
          </div>
        )}
      </div>
    </>
  )
}

/* ─────────── Dubai & Cream: the paid topping strip ─────────── */

/**
 * Dubai and Cream used to be cups on the menu. They are toppings now — charged
 * per cup you put one on, rather than per cup in the box — so they sit out here
 * with the iced teas instead of competing for space inside the cap.
 *
 * Both share one strip because it is the same decision made twice: the tabs only
 * steer which topping the counter is pointed at, and each keeps its own count,
 * so switching tabs never silently drops the other one.
 */
function ToppingStrip({
  toppings,
  cap,
  onSet,
}: {
  toppings: Record<string, number>
  cap: number
  onSet: (id: string, n: number) => void
}) {
  const [active, setActive] = useState(0)
  const topping = TOPPINGS[active]
  const count = toppings[topping.id] ?? 0
  const chosen = sumToppings(toppings)
  /** Cups still plain — the room any topping has left to grow into. */
  const left = Math.max(0, cap - chosen)

  return (
    <div className="mx-auto mt-4 max-w-2xl rounded-3xl bg-[#FFF9ED] p-5 shadow-[0_16px_36px_rgba(180,40,95,0.1)]">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-[13px] font-bold text-[#3B2116]">Add a topping?</p>
        <p className="text-[12px] text-[#7A3B5E]/75">
          {rands(TOPPING_PRICE)} each · goes on top of your cups
        </p>
      </div>

      {/* A cup wears at most one topping, so the two together can never exceed
          the number of cups in the order — and with an empty box there is
          nothing to top yet, which the meter would otherwise report as the
          cheerful "0/0 · every cup topped". */}
      {cap === 0 ? (
        <p className="mb-3 rounded-2xl bg-[#E8176D]/[0.07] px-4 py-2.5 text-[12px] text-[#7A3B5E]">
          Add some cups first — toppings go on top of the cups you’ve picked.
        </p>
      ) : (
        <div className="mb-3 flex items-center gap-3">
          <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.1em] text-[#7A3B5E]">
            {chosen}/{cap} topped
          </span>
          <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[#E8176D]/15">
            <motion.span
              className="absolute inset-y-0 left-0 rounded-full bg-[#E8176D]"
              animate={{ width: `${Math.min(100, (chosen / cap) * 100)}%` }}
              transition={{ type: 'spring', stiffness: 170, damping: 24 }}
            />
          </span>
          <span className="shrink-0 text-[11px] font-semibold text-[#7A3B5E]/75">
            {left > 0 ? `${left} plain` : 'every cup topped'}
          </span>
        </div>
      )}

      {/* The cup picture does the explaining — "Dubai topping" means nothing to
          anyone who hasn't already seen one. */}
      <div role="tablist" aria-label="Toppings" className="flex gap-1.5 rounded-full bg-white/70 p-1.5">
        {TOPPINGS.map((t, i) => {
          const on = i === active
          const n = toppings[t.id] ?? 0
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(i)}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-full px-2 py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8176D] sm:px-3 ${
                on ? 'text-white' : 'text-[#7A3B5E] hover:text-[#E8176D]'
              }`}
            >
              {on && (
                <motion.span
                  layoutId="topping-tab"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 rounded-full bg-[#E8176D] shadow-[0_8px_18px_rgba(232,23,109,0.35)]"
                />
              )}
              <img
                src={cupSrc(t.img, 112)}
                alt=""
                width={86}
                height={112}
                decoding="async"
                className="relative h-11 w-auto shrink-0 object-contain sm:h-12"
                draggable={false}
              />
              <span className="relative text-[12px] font-bold leading-tight sm:text-[13px]">
                {t.name}
              </span>
              {n > 0 && (
                <span
                  className={`relative rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                    on ? 'bg-white text-[#E8176D]' : 'bg-[#E8176D] text-white'
                  }`}
                >
                  ×{n}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <p className="min-w-0 flex-1 text-[12px] leading-snug text-[#7A3B5E]/85">
          {topping.blurb}
          {count > 0 && (
            <span className="block font-semibold text-[#7A3B5E]">
              On {count} of your cups.
            </span>
          )}
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={() => onSet(topping.id, count - 1)}
            disabled={count === 0}
            aria-label={`Remove one ${topping.name}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E8176D]/25 text-[#E8176D] transition hover:bg-[#E8176D] hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            <Minus size={14} strokeWidth={2.5} />
          </button>
          <span className="w-6 text-center text-sm font-bold text-[#3B2116]">{count}</span>
          <button
            onClick={() => onSet(topping.id, count + 1)}
            disabled={left === 0}
            aria-label={`Add one ${topping.name}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E8176D]/25 text-[#E8176D] transition hover:bg-[#E8176D] hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Same escape hatch the cup carousel offers: topping a 50-cup box one
            tap at a time is nobody's idea of a good time. `onSet` clamps to the
            shared budget, so an over-typed number lands on whatever is left
            rather than being rejected. Its own full-width row so the blurb keeps
            its space and the field lines up under the stepper. */}
        <div className="flex basis-full items-center justify-end gap-2">
          <label
            htmlFor={`topping-qty-${topping.id}`}
            className="text-[11px] font-semibold text-[#7A3B5E]/60"
          >
            or type a number
          </label>
          <input
            id={`topping-qty-${topping.id}`}
            type="number"
            inputMode="numeric"
            min={0}
            max={count + left}
            value={count}
            disabled={cap === 0}
            onChange={(e) => onSet(topping.id, Number(e.target.value))}
            onFocus={(e) => e.target.select()}
            aria-label={`Set how many cups wear the ${topping.name}`}
            className="w-16 rounded-full border border-[#E8176D]/20 bg-white/80 px-3 py-1.5 text-center text-[13px] font-bold text-[#3B2116] outline-none transition focus:border-[#E8176D] focus:ring-2 focus:ring-[#E8176D]/25 disabled:opacity-40"
          />
        </div>
      </div>

      {chosen > 0 && (
        <p className="mt-3 border-t border-dashed border-[#E8176D]/20 pt-3 text-right text-[12px] font-bold text-[#E8176D]">
          +{rands(chosen * TOPPING_PRICE)} · {chosen} topped {chosen === 1 ? 'cup' : 'cups'}
        </p>
      )}
    </div>
  )
}

/* ─────────── Step 3a: the capped box — Little Moments or Signature ─────────── */

function StepBox({
  target,
  mix,
  cups,
  remaining,
  estimate,
  icedTeas,
  toppings,
  toppingCap,
  onBump,
  onSet,
  onIcedTeas,
  onTopping,
  onTopUp,
  isMobile,
}: {
  target: number
  mix: Record<string, number>
  cups: number
  remaining: number
  estimate: number
  icedTeas: number
  toppings: Record<string, number>
  toppingCap: number
  onBump: (id: string, delta: number) => void
  onSet: (id: string, value: number) => void
  onIcedTeas: (n: number) => void
  onTopping: (id: string, n: number) => void
  onTopUp: () => void
  isMobile: boolean
}) {
  const full = remaining === 0
  const pct = target > 0 ? Math.min(100, (cups / target) * 100) : 0

  return (
    <div>
      <StepHeading
        title={`Build your|box of ${target}.`}
        sub="Spin the ring, tap a cup to drop it in — or type a number to skip the tapping. Dubai & Cream toppings are add-ons further down."
      />

      <EstimateNote className="mx-auto mb-6 max-w-2xl text-center" />

      {/* Mobile only: the desktop nav already surfaces the running price, and
          the full box breakdown sits below the ring — but on a phone that's a
          scroll away while you're mid-build, so a subtle strip up here keeps
          both the price and progress in view above the carousel. */}
      <div className="mx-auto mb-5 flex max-w-sm items-center gap-3 rounded-full bg-white/70 px-4 py-2 shadow-sm sm:hidden">
        <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.1em] text-[#7A3B5E]">
          {cups}/{target}
        </span>
        <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[#E8176D]/15">
          <motion.span
            className="absolute inset-y-0 left-0 rounded-full bg-[#E8176D]"
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 170, damping: 24 }}
          />
        </span>
        <span className="shrink-0 text-[12px] font-bold text-[#E8176D]">{rands(estimate)}</span>
      </div>

      <CupCarousel mix={mix} onBump={onBump} onSet={onSet} isMobile={isMobile} full={full} max={target} />

      {/* ── Your box ── */}
      <div className="mx-auto max-w-2xl rounded-3xl bg-[#FFF9ED] p-6 shadow-[0_16px_36px_rgba(180,40,95,0.12)]">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold text-[#3B2116]">
            {cups} / {target} cups
          </span>
          <span className={`text-[12px] font-semibold ${full ? 'text-[#E8176D]' : 'text-[#7A3B5E]/75'}`}>
            {full ? 'Perfect — that’s the lot!' : `${remaining} to go`}
          </span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#E8176D]/12">
          <motion.div
            className="h-full rounded-full bg-[#E8176D]"
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 170, damping: 24 }}
          />
        </div>

        {cups > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {FLAVOURS.filter((f) => (mix[f.id] ?? 0) > 0).map((f) => (
              <motion.span
                key={f.id}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#3B2116] shadow-sm"
              >
                <img
                  src={cupSrc(f.img, 112)}
                  alt=""
                  width={86}
                  height={112}
                  decoding="async"
                  className="h-6 w-auto object-contain"
                  draggable={false}
                />
                {f.short} ×{mix[f.id]}
                <button
                  onClick={() => onBump(f.id, -1)}
                  aria-label={`Remove one ${f.name}`}
                  className="text-[#E8176D]/60 transition hover:text-[#E8176D]"
                >
                  <X size={13} strokeWidth={3} />
                </button>
              </motion.span>
            ))}
          </div>
        )}

        {remaining > 0 && cups > 0 && (
          <button
            onClick={onTopUp}
            className="mt-4 text-[12px] font-bold uppercase tracking-[0.14em] text-[#E8176D] underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8176D]"
          >
            Top up with Classic (+{remaining})
          </button>
        )}
      </div>

      <ToppingStrip toppings={toppings} cap={toppingCap} onSet={onTopping} />

      {/* Iced teas ride along outside the capped box */}
      <div className="mx-auto mt-4 flex max-w-2xl items-center justify-between gap-4 rounded-3xl bg-[#FFF9ED] px-6 py-5 shadow-[0_16px_36px_rgba(180,40,95,0.1)]">
        <div className="flex items-center gap-3">
          <img
            src="/menu-cups/ice-tea-flat-112.webp"
            alt=""
            width={67}
            height={112}
            decoding="async"
            loading="lazy"
            className="h-12 w-auto object-contain"
            draggable={false}
          />
          <div>
            <p className="text-[13px] font-bold text-[#3B2116]">Add Strawberry Peach Iced Teas?</p>
            <p className="text-[12px] text-[#7A3B5E]/75">{rands(ICED_TEA_PRICE)} each · on the side</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={() => onIcedTeas(Math.max(0, icedTeas - 1))}
            disabled={icedTeas === 0}
            aria-label="Remove one iced tea"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E8176D]/25 text-[#E8176D] transition hover:bg-[#E8176D] hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            <Minus size={14} strokeWidth={2.5} />
          </button>
          <span className="w-6 text-center text-sm font-bold text-[#3B2116]">{icedTeas}</span>
          <button
            onClick={() => onIcedTeas(Math.min(ICED_TEA_CAP, icedTeas + 1))}
            disabled={icedTeas >= ICED_TEA_CAP}
            aria-label="Add one iced tea"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E8176D]/25 text-[#E8176D] transition hover:bg-[#E8176D] hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────── Step 3b: the Indulgent station ─────────── */

function StepStation({
  guests,
  mix,
  isMobile,
  onGuests,
  onBump,
  onSet,
  icedTeas,
  onIcedTeas,
  toppings,
  toppingCap,
  onTopping,
}: {
  guests: number
  mix: Record<string, number>
  isMobile: boolean
  onGuests: (n: number) => void
  onBump: (id: string, delta: number) => void
  onSet: (id: string, value: number) => void
  icedTeas: number
  onIcedTeas: (n: number) => void
  toppings: Record<string, number>
  toppingCap: number
  onTopping: (id: string, n: number) => void
}) {
  const chosen = Object.values(mix).reduce((a, b) => a + b, 0)
  // The spread is a box of exactly `guests` cups. Adding is already clamped to
  // it, so `over` can only appear by dragging the slider down under a spread
  // that is already picked — which is why there is a way back from it below,
  // rather than a dead Next button and no explanation.
  const target = clampGuests(guests)
  const short = Math.max(0, target - chosen)
  const over = Math.max(0, chosen - target)

  /** Drops `n` cups, taking from the largest pile first so a lopsided spread
   *  evens out instead of one flavour being wiped. */
  const trim = (n: number) => {
    let left = n
    const byLargest = FLAVOURS
      .map((f) => ({ id: f.id, count: mix[f.id] ?? 0 }))
      .sort((a, b) => b.count - a.count)
    for (const { id, count } of byLargest) {
      if (left <= 0) break
      const take = Math.min(count, left)
      if (take > 0) {
        onBump(id, -take)
        left -= take
      }
    }
  }

  return (
    <div>
      <StepHeading
        title="Shape your|live station."
        sub="Every Indulgent event includes the premium station, our on-site team and full service for the duration."
      />

      <EstimateNote className="mx-auto mb-10 max-w-2xl text-center" />

      <div className="mx-auto mb-10 max-w-md text-center">
        <motion.p
          key={guests}
          initial={{ scale: 0.9, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="text-[clamp(2.6rem,7vw,4rem)] leading-none text-[#E8176D]"
          style={{ fontFamily: 'var(--font-display)' }}
          aria-live="polite"
        >
          {guests}
        </motion.p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7A3B5E]">guests</p>
        <input
          type="range"
          min={INDULGENT_MIN_GUESTS}
          max={INDULGENT_MAX_GUESTS}
          // Step 1, not 10. Off a floor of 51 a step of 10 offers 51, 61, 71 —
          // which reads as a bug rather than a choice. It also matters more than
          // it used to: the guest count now sets how many cups the spread must
          // contain, so someone with 55 guests should be able to say 55 instead
          // of being pushed to 61 cups.
          step={1}
          value={guests}
          onChange={(e) => onGuests(Number(e.target.value))}
          aria-label="Number of guests"
          className="mt-5 w-full cursor-pointer"
          style={{ accentColor: BERRY }}
        />
        <div className="mt-1 flex justify-between text-[11px] font-semibold text-[#7A3B5E]/60">
          <span>{INDULGENT_MIN_GUESTS}</span>
          <span>{INDULGENT_MAX_GUESTS}</span>
        </div>
        {/* The guest count is no longer just a guide — it is the size of the
            box — so it says so, rather than leaving someone to work out why the
            ring stopped letting them add. */}
        <p className="mt-3 text-[12px] text-[#7A3B5E]/70">
          One cup per guest — your spread is {clampGuests(guests)} cups.
        </p>
      </div>

      {/* ── The spread: the same 3D ring as the Little Moments box, and now the
             same rule too. The guest slider sets the size of the box; this fills
             it. The chips below keep every flavour's count visible while you
             spin. ── */}
      <div className="mb-5 text-center">
        <h2 className="uppercase text-[#3B2116] text-[clamp(1.05rem,2.2vw,1.4rem)]" style={{ fontFamily: 'var(--font-display)' }}>
          Choose your spread
        </h2>
        <p className="mt-2 text-[13.5px] text-[#7A3B5E]/80">
          Spin the ring and pick how many of each.{' '}
          <span className="font-semibold text-[#E8176D]" aria-live="polite">
            {chosen} of {target} cups
          </span>
        </p>
        {/* The one thing standing between here and the next step, said plainly
            and with the number in it. `aria-live` because this changes as cups
            go in and as the guest slider moves, and someone on a screen reader
            would otherwise never learn why Next is dead. */}
        <p className="mt-2 text-[13px] font-semibold" aria-live="polite">
          {short > 0 ? (
            <span className="text-[#E8176D]">
              Pick {short} more {short === 1 ? 'cup' : 'cups'} to cover your {target} guests.
            </span>
          ) : over > 0 ? (
            <span className="text-[#E8176D]">
              That's {over} {over === 1 ? 'cup' : 'cups'} more than {target} guests — drop {over} or raise the guest count.
            </span>
          ) : (
            <span className="text-[#7A3B5E]/70">
              Your spread covers all {target} guests.
            </span>
          )}
        </p>
        {short > 0 && (
          <button
            onClick={() => onBump('classic', short)}
            className="mt-3 rounded-full bg-[#E8176D]/10 px-5 py-2 text-[12px] font-bold uppercase tracking-[0.14em] text-[#E8176D] transition hover:bg-[#E8176D]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8176D]"
          >
            Fill with {short} Classic
          </button>
        )}
        {over > 0 && (
          <button
            onClick={() => trim(over)}
            className="mt-3 rounded-full bg-[#E8176D]/10 px-5 py-2 text-[12px] font-bold uppercase tracking-[0.14em] text-[#E8176D] transition hover:bg-[#E8176D]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8176D]"
          >
            Trim {over} {over === 1 ? 'cup' : 'cups'}
          </button>
        )}
      </div>

      <CupCarousel
        mix={mix}
        onBump={onBump}
        onSet={onSet}
        isMobile={isMobile}
        addLabel="Add to spread"
        // One cup per guest: the guest slider is the box size, so it is also the
        // ceiling on every count. Pass it, or the typed input goes back to
        // accepting any number a keyboard can produce.
        max={target}
        full={chosen >= target}
        fullLabel="That's every guest covered"
      />

      <div className="mx-auto max-w-2xl rounded-3xl bg-[#FFF9ED] p-6 shadow-[0_16px_36px_rgba(180,40,95,0.12)]">
        {chosen === 0 ? (
          <p className="text-center text-[13px] text-[#7A3B5E]/75">
            Nothing picked yet
          </p>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-2">
              {FLAVOURS.filter((f) => (mix[f.id] ?? 0) > 0).map((f) => (
                <motion.span
                  key={f.id}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#3B2116] shadow-sm"
                >
                  <img
                  src={cupSrc(f.img, 112)}
                  alt=""
                  width={86}
                  height={112}
                  decoding="async"
                  className="h-6 w-auto object-contain"
                  draggable={false}
                />
                  {f.short} ×{mix[f.id]}
                  <button
                    onClick={() => onBump(f.id, -1)}
                    aria-label={`Remove one ${f.name}`}
                    className="text-[#E8176D]/60 transition hover:text-[#E8176D]"
                  >
                    <X size={13} strokeWidth={3} />
                  </button>
                </motion.span>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => FLAVOURS.forEach((f) => onBump(f.id, -(mix[f.id] ?? 0)))}
                className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#7A3B5E] underline-offset-4 transition hover:text-[#E8176D] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8176D]"
              >
                Clear the spread
              </button>
            </div>
          </>
        )}
      </div>

      <ToppingStrip toppings={toppings} cap={toppingCap} onSet={onTopping} />

      {/* Iced teas — the same simple quantity add-on as the capped boxes,
          rather than another toggle card to tap. */}
      <div className="mx-auto mt-4 max-w-2xl flex items-center justify-between gap-4 rounded-3xl bg-[#FFF9ED] px-6 py-5 shadow-[0_16px_36px_rgba(180,40,95,0.1)]">
        <div className="flex items-center gap-3">
          <img
            src="/menu-cups/ice-tea-flat-112.webp"
            alt=""
            width={67}
            height={112}
            decoding="async"
            loading="lazy"
            className="h-12 w-auto object-contain"
            draggable={false}
          />
          <div>
            <p className="text-[13px] font-bold text-[#3B2116]">Add Strawberry Peach Iced Teas?</p>
            <p className="text-[12px] text-[#7A3B5E]/75">{rands(ICED_TEA_PRICE)} each · on the side</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={() => onIcedTeas(Math.max(0, icedTeas - 1))}
            disabled={icedTeas === 0}
            aria-label="Remove one iced tea"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E8176D]/25 text-[#E8176D] transition hover:bg-[#E8176D] hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            <Minus size={14} strokeWidth={2.5} />
          </button>
          <span className="w-6 text-center text-sm font-bold text-[#3B2116]">{icedTeas}</span>
          <button
            onClick={() => onIcedTeas(Math.min(ICED_TEA_CAP, icedTeas + 1))}
            disabled={icedTeas >= ICED_TEA_CAP}
            aria-label="Add one iced tea"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E8176D]/25 text-[#E8176D] transition hover:bg-[#E8176D] hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────── Step 4: details ─────────── */

type FormState = {
  name: string
  email: string
  phone: string
  date: string
  time: string
  venue: string
  notes: string
  consent: boolean
}

function StepDetails({
  form,
  onChange,
  errors,
  showAll,
  honeypot,
  onHoneypot,
}: {
  form: FormState
  onChange: (f: FormState) => void
  errors: FieldErrors
  /** Set once "Next" has been pressed: reveal every problem, not just visited ones. */
  showAll: boolean
  honeypot: string
  onHoneypot: (v: string) => void
}) {
  // Complaining while someone is still mid-word is hostile, and staying silent
  // until they press Next hides the problem until it blocks them. Blur is the
  // moment they have finished with a field and can act on the answer.
  const [touched, setTouched] = useState<Partial<Record<keyof FieldErrors, boolean>>>({})
  const shown = (k: keyof FieldErrors) => ((showAll || touched[k]) ? errors[k] : undefined)

  const set =
    (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...form, [k]: e.target.value })

  const blur = (k: keyof FieldErrors) => () => setTouched((t) => ({ ...t, [k]: true }))

  const cls = (k: keyof FieldErrors) =>
    `${inputCls} ${shown(k) ? 'border-[#C01057] ring-2 ring-[#C01057]/20' : ''}`


  /** `aria-required` rather than the native `required` attribute: the browser's
   *  own validation bubble would fire on submit and compete with the inline
   *  messages below each field, which are the ones that match this form's
   *  wording and timing. Screen readers still announce the field as required. */
  const a11y = (k: keyof FieldErrors, { optional = false } = {}) => ({
    onBlur: blur(k),
    'aria-required': optional ? undefined : true,
    'aria-invalid': shown(k) ? true : undefined,
    'aria-describedby': shown(k) ? `q-${k}-error` : undefined,
  })

  return (
    <div className="mx-auto max-w-xl">
      <StepHeading title="Where do we|send the sweetness?" sub="Just enough to get back to you with a real quote." />
      <div className="rounded-[28px] bg-[#FFF9ED] p-7 shadow-[0_18px_40px_rgba(180,40,95,0.13)] sm:p-8">
        {/* Honeypot. Hidden from sight and from screen readers, off the tab
            order, and never autofilled — anything in it came from a bot. */}
        <div aria-hidden="true" className="pointer-events-none absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden opacity-0">
          <label htmlFor="q-company">Company (leave blank)</label>
          <input
            id="q-company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => onHoneypot(e.target.value)}
            // Sized to nothing on the input itself, not just the wrapper, so it
            // stays invisible even if a browser or extension ignores the
            // wrapper's overflow clipping.
            style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="q-name" className={labelCls}>Your name</label>
            <input
              id="q-name"
              value={form.name}
              onChange={set('name')}
              placeholder="Berry Lover"
              maxLength={LIMITS.name}
              autoComplete="name"
              className={cls('name')}
              {...a11y('name')}
            />
            <FieldError id="name" msg={shown('name')} />
          </div>

          {/* `min-w-0` on every grid child, here and below: a grid item defaults
              to `min-width:auto`, so a child whose intrinsic width exceeds its
              track — a long placeholder, or a native date/time picker, which
              iOS Safari sizes to its own control — widens the column instead of
              shrinking, pushing the neighbouring field out of its cell. The
              inputs are already `w-full`; this is what makes `w-full` mean the
              column rather than the content. */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor="q-email" className={labelCls}>Email</label>
              <input
                id="q-email"
                type="email"
                inputMode="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@sweet.co.za"
                maxLength={LIMITS.email}
                autoComplete="email"
                className={cls('email')}
                {...a11y('email')}
              />
              <FieldError id="email" msg={shown('email')} />
            </div>
            <div className="min-w-0">
              <label htmlFor="q-phone" className={labelCls}>WhatsApp / phone</label>
              <input
                id="q-phone"
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="082 000 0000"
                maxLength={LIMITS.phone}
                autoComplete="tel"
                className={cls('phone')}
                {...a11y('phone')}
              />
              <FieldError id="phone" msg={shown('phone')} />
            </div>
          </div>

          {/* Date and time are one thought, so they share a row from `sm` up and
              stack on phones. Venue then gets a full-width row of its own rather
              than being squeezed into a third column: this card is `max-w-xl`,
              so three tracks would leave each about 160px — narrower than the
              native date picker renders on iOS, which is precisely how fields
              end up overlapping. */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor="q-date" className={labelCls}>Event date</label>
              <input
                id="q-date"
                type="date"
                value={form.date}
                onChange={set('date')}
                min={new Date().toISOString().slice(0, 10)}
                max={new Date(new Date().setFullYear(new Date().getFullYear() + 3))
                  .toISOString()
                  .slice(0, 10)}
                className={cls('date')}
                {...a11y('date')}
              />
              <FieldError id="date" msg={shown('date')} />
            </div>
            <div className="min-w-0">
              <label htmlFor="q-time" className={labelCls}>
                Start time <span className="normal-case opacity-60">(optional)</span>
              </label>
              <input
                id="q-time"
                type="time"
                value={form.time}
                onChange={set('time')}
                className={cls('time')}
                {...a11y('time', { optional: true })}
              />
              <FieldError id="time" msg={shown('time')} />
            </div>
          </div>

          <div>
            <label htmlFor="q-venue" className={labelCls}>Venue / area</label>
            <input
              id="q-venue"
              value={form.venue}
              onChange={set('venue')}
              placeholder="Constantia, Cape Town"
              maxLength={LIMITS.venue}
              className={cls('venue')}
              {...a11y('venue')}
            />
            <FieldError id="venue" msg={shown('venue')} />
          </div>

          <div>
            <label htmlFor="q-notes" className={labelCls}>
              Anything else? <span className="normal-case opacity-60">(optional)</span>
            </label>
            <textarea
              id="q-notes"
              rows={3}
              value={form.notes}
              onChange={set('notes')}
              placeholder="Theme, colours, allergies, timing…"
              maxLength={LIMITS.notes}
              className={`${cls('notes')} resize-none`}
              {...a11y('notes', { optional: true })}
            />
            <div className="mt-1 flex items-start justify-between gap-4">
              <FieldError id="notes" msg={shown('notes')} />
              <span className="ml-auto shrink-0 text-[11px] text-[#7A3B5E]/50">
                {form.notes.length}/{LIMITS.notes}
              </span>
            </div>
          </div>
        </div>

        {/* ── The agreement ──
            One tick, carrying POPIA consent, the Terms of Use and the
            confirmation that the details are correct. This was two boxes with a
            bulleted summary under each, which is the stronger legal shape but
            reads as a wall of small print at the exact moment someone is
            deciding whether to bother — so it is one short sentence with the
            detail one tap away instead. The reasoning is written up in full
            over CONSENT_STATEMENT in lib/quote.ts; the note below still carries
            the POPIA s18 essentials so the visitor is not agreeing blind. */}
        <div className="mt-7">
          <Agreement
            checked={form.consent}
            invalid={Boolean(shown('consent'))}
            statement={CONSENT_STATEMENT}
            note={CONSENT_NOTE}
            onToggle={(v) => {
              onChange({ ...form, consent: v })
              setTouched((t) => ({ ...t, consent: true }))
            }}
            links={
              <>
                <LegalLink href="/privacy-policy">Privacy Policy</LegalLink>
                <span aria-hidden="true"> · </span>
                <LegalLink href="/terms">Terms of Use</LegalLink>
              </>
            }
          >
            <FieldError id="consent" msg={shown('consent')} />
          </Agreement>
        </div>
      </div>
      <p className="mt-4 text-center text-[12px] text-[#7A3B5E]/60">
        Date not locked in yet? Leave it open — we’ll work it out together.
      </p>
    </div>
  )
}

/**
 * The validation message under a field.
 *
 * Module scope, not declared inside StepDetails: a component defined during
 * render is a brand-new component type on every keystroke, so React unmounts
 * and remounts the message instead of updating it — which re-announces it to a
 * screen reader each time and throws away the `role="alert"` semantics that
 * make it useful in the first place.
 */
function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null
  return (
    <p
      id={`q-${id}-error`}
      role="alert"
      className="mt-1.5 flex items-start gap-1.5 text-[12px] font-semibold text-[#C01057]"
    >
      <AlertCircle size={13} strokeWidth={2.5} className="mt-[1px] shrink-0" />
      <span>{msg}</span>
    </p>
  )
}

/**
 * The agreement tick: one short bold statement, one line of plain-language
 * detail, the two documents it refers to, and a slot for the error message.
 *
 * The statement is deliberately one sentence. POPIA s18 wants the visitor told
 * what happens to their details at the point of collection, which the `note`
 * satisfies — but a wall of bullets at the end of a quote builder gets skipped
 * wholesale, and text nobody reads informs nobody.
 */
function Agreement({
  checked,
  invalid,
  statement,
  note,
  links,
  onToggle,
  children,
}: {
  checked: boolean
  invalid: boolean
  statement: string
  note: string
  /** The Privacy Policy / Terms links. Rendered outside the <label>. */
  links: React.ReactNode
  onToggle: (v: boolean) => void
  /** The <FieldError> for this tick — owned by StepDetails, which holds state. */
  children: React.ReactNode
}) {
  return (
    <div
      className={`rounded-3xl border p-4 transition sm:p-5 ${
        invalid
          ? 'border-[#C01057] bg-[#C01057]/[0.06]'
          : checked
            ? 'border-[#E8176D]/35 bg-[#E8176D]/[0.05]'
            : 'border-[#E8176D]/20 bg-white/70'
      }`}
    >
      <label htmlFor="q-consent" className="flex cursor-pointer items-start gap-3.5">
        {/* The native input stays in the DOM — it is what screen readers,
            keyboards and form autofill actually talk to — with the visible
            box drawn beside it and driven off :checked / :focus-visible. */}
        <span className="relative mt-[1px] flex shrink-0 items-center justify-center">
          <input
            id="q-consent"
            type="checkbox"
            checked={checked}
            onChange={(e) => onToggle(e.target.checked)}
            required
            aria-invalid={invalid ? true : undefined}
            aria-describedby={`q-consent-note${invalid ? ' q-consent-error' : ''}`}
            className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-[#E8176D]/45 bg-white outline-none transition checked:border-[#E8176D] checked:bg-[#E8176D] focus-visible:ring-2 focus-visible:ring-[#E8176D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF9ED]"
          />
          <Check
            size={15}
            strokeWidth={3.5}
            aria-hidden="true"
            className="pointer-events-none absolute text-white opacity-0 transition peer-checked:opacity-100"
          />
        </span>

        <span className="min-w-0 text-[13.5px] font-bold leading-snug text-[#3B2116]">
          {statement}
        </span>
      </label>

      {/* Outside the label on purpose: a link inside one is activated by the
          label as well as followed, so tapping "Privacy Policy" would also
          toggle the tick. Indented to line up under the wording above. */}
      <p id="q-consent-note" className="mt-2 pl-[38px] text-[11.5px] leading-relaxed text-[#7A3B5E]/80">
        {note} {links}
      </p>

      {children}
    </div>
  )
}

/** A link to a legal page from inside the form. Opens in its own tab — someone
 *  who wants the detail should not lose a half-built quote to read it. */
function LegalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-bold text-[#E8176D] underline decoration-[#E8176D]/40 underline-offset-2 transition hover:text-[#C01057]"
    >
      {children}
    </a>
  )
}

/* ─────────── Step 5: the quote ─────────── */

function StepReview({
  quote,
  estimate,
  onEdit,
}: {
  quote: Quote
  estimate: number
  onEdit: () => void
}) {
  const tilt = useTilt(7)
  const capped = quote.pkg === 'little' || quote.pkg === 'signature'
  const dateLabel = quote.date
    ? new Date(`${quote.date}T00:00`).toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Date to be confirmed'
  const row = 'flex items-baseline justify-between gap-4 text-sm'

  return (
    <div className="mx-auto max-w-md">
      <StepHeading title="Your sweet|quote." sub="Give it a once-over — nothing is sent until you say so." />

      <div style={{ perspective: 1200 }}>
        <motion.div
          ref={tilt.ref}
          onPointerMove={tilt.onPointerMove}
          onPointerLeave={tilt.onPointerLeave}
          initial={{ opacity: 0, y: 40, rotateX: -14 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          className="rounded-[26px] bg-white px-7 py-8 shadow-[0_30px_60px_rgba(180,40,95,0.22)] sm:px-9"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'perspective(1200px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))',
          }}
        >
          <div className="text-center" style={{ transform: 'translateZ(28px)' }}>
            <img
              src="/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png"
              alt=""
              aria-hidden="true"
              className="mx-auto h-9 w-9 object-contain"
              draggable={false}
            />
            <p className="mt-2 uppercase text-[16px] text-[#E8176D]" style={{ fontFamily: 'var(--font-display)' }}>
              Naughty Berry
            </p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7A3B5E]/60">
              Quote request · {dateLabel}
            </p>
          </div>

          <div className="my-5 border-t border-dashed border-[#E8176D]/25" />

          <div className="space-y-2.5 text-[#3B2116]">
            <div className={row}>
              <span className="text-[#7A3B5E]">Occasion</span>
              <span className="font-bold">{quote.occasion}</span>
            </div>
            <div className={row}>
              <span className="text-[#7A3B5E]">Package</span>
              <span className="font-bold">{packageName(quote.pkg)}</span>
            </div>
            {!capped && (
              <div className={row}>
                <span className="text-[#7A3B5E]">Guests</span>
                <span className="font-bold">{quote.guests}</span>
              </div>
            )}
            {quote.time && (
              <div className={row}>
                <span className="text-[#7A3B5E]">Start time</span>
                <span className="font-bold">{quote.time}</span>
              </div>
            )}
            {quote.venue && (
              <div className={row}>
                <span className="text-[#7A3B5E]">Venue</span>
                {/* The venue is free text, so it is the one row here that can be
                    long enough to collide with its label — let it wrap and keep
                    it right-aligned rather than letting it push the label off. */}
                <span className="min-w-0 break-words text-right font-bold">{quote.venue}</span>
              </div>
            )}
          </div>

          <div className="my-5 border-t border-dashed border-[#E8176D]/25" />

          <div className="space-y-2.5 text-[#3B2116]">
            {capped ? (
              <>
                {FLAVOURS.filter((f) => (quote.mix[f.id] ?? 0) > 0).map((f) => (
                  <div key={f.id} className={row}>
                    <span>{quote.mix[f.id]} × {f.name}</span>
                    <span className="font-semibold">Included</span>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className={row}><span>The Naughty Berry stand</span><span className="font-semibold">Included</span></div>
                <div className={row}><span>Full on-site service</span><span className="font-semibold">Included</span></div>
                {FLAVOURS.filter((f) => (quote.mix[f.id] ?? 0) > 0).map((f) => (
                  <div key={f.id} className={row}>
                    <span>{quote.mix[f.id]} × {f.name}</span>
                    <span className="font-semibold">In the spread</span>
                  </div>
                ))}
              </>
            )}
            {TOPPINGS.filter((t) => (quote.toppings[t.id] ?? 0) > 0).map((t) => (
              <div key={t.id} className={row}>
                <span>{quote.toppings[t.id]} × {t.name}</span>
                <span className="font-semibold">
                  {capped
                    ? `+${rands((quote.toppings[t.id] ?? 0) * TOPPING_PRICE)}`
                    : 'Add-on'}
                </span>
              </div>
            ))}
            {quote.icedTeas > 0 && (
              <div className={row}>
                <span>{quote.icedTeas} × Iced Tea</span>
                <span className="font-semibold">
                  {capped ? rands(quote.icedTeas * ICED_TEA_PRICE) : 'Add-on'}
                </span>
              </div>
            )}
          </div>

          <div className="my-5 border-t border-dashed border-[#E8176D]/25" />

          {capped ? (
            <div className="flex items-baseline justify-between" style={{ transform: 'translateZ(22px)' }}>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7A3B5E]">
                Estimated from
              </span>
              <span className="text-2xl font-bold text-[#E8176D]">{rands(estimate)}</span>
            </div>
          ) : (
            <p className="text-center text-[13px] leading-relaxed text-[#7A3B5E]">
              We’ll price this around your event and email you a custom quote within 24 hours. Please check spam
            </p>
          )}

          {/* The disclaimer sits inside the slip, under the number, because the
              slip is the thing people screenshot and send to whoever is paying. */}
          <EstimateNote className="mt-5" />

          <p className="mt-3 text-center text-[11px] leading-relaxed text-[#7A3B5E]/60">
            No commitment yet — this just starts the conversation.
          </p>
        </motion.div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-[#7A3B5E] underline-offset-4 transition hover:text-[#E8176D] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8176D]"
        >
          <Pencil size={12} />
          Change something
        </button>
      </div>
    </div>
  )
}

/* ─────────── Confirm dialog ─────────── */

function ConfirmDialog({
  open,
  sending,
  error,
  quote,
  estimate,
  onCancel,
  onConfirm,
}: {
  open: boolean
  sending: boolean
  error: string | null
  quote: Quote
  estimate: number
  onCancel: () => void
  onConfirm: () => void
}) {
  // Escape closes, and the body doesn't scroll behind the dialog.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !sending && onCancel()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, sending, onCancel])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-[#2D1225]/45 backdrop-blur-sm"
            onClick={() => !sending && onCancel()}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            initial={{ scale: 0.9, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="relative w-full max-w-sm rounded-[26px] bg-[#FFF9ED] p-8 text-center shadow-[0_30px_70px_rgba(120,20,70,0.4)]"
          >
            <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF0F6]">
              <Send size={20} className="text-[#E8176D]" aria-hidden="true" />
            </span>
            <h2 id="confirm-title" className="uppercase text-xl leading-tight text-[#3B2116]" style={{ fontFamily: 'var(--font-display)' }}>
              Send this quote?
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-[#7A3B5E]">
              We’ll send your {packageName(quote.pkg)} request
              {quote.pkg === 'little' || quote.pkg === 'signature' ? ` (${rands(estimate)} estimated)` : ''} to
              the team, and email you a formal quote with the final price within 24 hours. Please check your spam folder
            </p>
            <p className="mt-3 text-[11.5px] leading-relaxed text-[#7A3B5E]/70">
              {ESTIMATE_NOTE_SHORT}
            </p>

            {error && (
              <p className="mt-4 rounded-2xl bg-[#E8176D]/10 px-4 py-3 text-[13px] font-semibold text-[#C01057]">
                {error} Please try again, or use the form on the home page.
              </p>
            )}

            <div className="mt-7 flex flex-col gap-3">
              <motion.button
                whileHover={sending ? undefined : { scale: 1.03 }}
                whileTap={sending ? undefined : { scale: 0.97 }}
                onClick={onConfirm}
                disabled={sending}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E8176D] px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#C01057] disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8176D]"
              >
                {sending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Check size={15} strokeWidth={3} />
                    Yes, send it
                  </>
                )}
              </motion.button>
              <button
                onClick={onCancel}
                disabled={sending}
                className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#7A3B5E] underline-offset-4 transition hover:text-[#E8176D] hover:underline disabled:opacity-50"
              >
                Not yet — let me tweak it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─────────── Sent ─────────── */

function SentScreen({ name }: { name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      className="nb-card-berry mx-auto max-w-lg px-8 py-16 text-center"
    >
      <motion.span
        initial={{ scale: 0, rotate: -18 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.15 }}
        className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-white"
      >
        <PartyPopper size={34} className="text-[#E8176D]" aria-hidden="true" />
      </motion.span>

      <h1 className="uppercase leading-[1.08] text-white text-[clamp(1.5rem,4vw,2.3rem)]" style={{ fontFamily: 'var(--font-display)' }}>
        Sweet! It’s on its way.
      </h1>
      <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-white/85">
        Thanks {name.split(' ')[0] || 'friend'} — your request is with the team. We’ll email you a
        formal quote with the final price within 24 hours. Please check your spam folder. 
      </p>
      <p className="mx-auto mt-4 max-w-sm text-[12px] leading-relaxed text-white/65">
        Anything you saw here was an estimate — the emailed quote is the one that counts, and it
        accounts for travel, setup and current ingredient costs.
      </p>

      <div className="mt-9 flex flex-col items-center gap-3">
        <a
          href="/"
          className="rounded-full bg-white px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.18em] text-[#E8176D] transition hover:bg-[#FFF0F6]"
        >
          Back to Naughty Berry
        </a>
        <a
          href="https://www.instagram.com/naughtyberrycpt"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] font-bold uppercase tracking-[0.16em] text-white/75 underline-offset-4 transition hover:text-white hover:underline"
        >
          Follow our journey
        </a>
      </div>
    </motion.div>
  )
}
