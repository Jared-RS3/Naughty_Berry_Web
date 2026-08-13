import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading'
import { Users, Star, Check } from 'lucide-react'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

const BERRY = '#E8176D'

const PACKAGES = [
  {
    id: 'small',
    icon: Users,
    name: 'Little Moments',
    // subtitle: 'Up to 30 guests',
    price: 'Starting From R1675',
    features: [
      
      '25 cups of your choice (mixed)',
      'Select between classic or brownie',
      'Available in Dubai or Cream for an additional charge',
      'Delivered right to your door step',
    ],
    cta: 'Enquire Now',
  },
  {
    id: 'signature',
    icon: Star,
    name: 'Signature',
    subtitle: '50 guests',
    price: 'Starting From R7750',
    featured: true,
    // The one thing this package has that Little Moments cannot: the branded
    // stand itself, staffed, at your venue. Showing it is what earns the click
    // on Enquire — a bullet list saying "Premium Live Station" never will.
    photo: '/Stand.webp',
    features: [
      '50 Cups of your choice',
      'Dubai & Cream available as add on',
      'Premium Live Station',
      'Chocolate Tap',
      'Full Service for Duration of Event',
      'On Site Service',
    ],
    cta: 'Enquire Now',
  },
  
  {
    id: 'large',
    icon: Star,
    name: 'Indulgent',
    subtitle: '50+ guests',
    // price: 'From R4 500',
    featured: true,
    // The one thing this package has that Little Moments cannot: the branded
    // stand itself, staffed, at your venue. Showing it is what earns the click
    // on Enquire — a bullet list saying "Premium Live Station" never will.
    photo: '/Stand.webp',
    features: [
      'build a custom quotation for your special occassion. This package is fully customizable and will be tailored to cater specifically to your event',
      'Dubai & Cream available as add on',
      'Premium Live Station',
      'Chocolate Tap',
      'Full Service for Duration of Event',
      'On Site Service',
    ],
    cta: 'Enquire Now',
  },

]

const OCCASIONS = [
  'Weddings',
  'Birthdays',
  'Corporate Events',
  'Graduations',
  'Baby Showers',
  'Year Ends',
  'Girls Night',
  'Any Celebration',
]

/** "Enquire Now" hands off to the /quote builder with the package preselected,
 *  so the visitor lands in the flow already one answer ahead. */
const PKG_TO_QUOTE: Record<string, string> = {
  small: 'little',
  signature: 'signature',
  large: 'indulgent',
}
const quoteHref = (pkgId: string) => `/quote?pkg=${PKG_TO_QUOTE[pkgId] ?? 'indulgent'}`

export default function Events() {

  return (
    <section
      id="events"
      className="py-24 lg:py-32 relative overflow-hidden bg-[#FFDCEA] scroll-mt-20"
    >
      {/* Checkerboard — the one patterned surface on the page, faded out at the
          edges so the cards still sit on clean pink. */}
      <div
        aria-hidden="true"
        className="nb-checker absolute inset-0 pointer-events-none"
        style={{
          WebkitMaskImage:
            'radial-gradient(120% 78% at 50% 42%, black 0%, rgba(0,0,0,0.55) 46%, transparent 82%)',
          maskImage:
            'radial-gradient(120% 78% at 50% 42%, black 0%, rgba(0,0,0,0.55) 46%, transparent 82%)',
        }}
      />

      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        <SectionHeading
          eyebrow="Events & Catering"
          word="PACKAGES"
          title={['','']}
          // title={['We cater for', 'any occasion.']}
          lead="From intimate birthdays to full-scale weddings, our signature chocolate taps bring fresh strawberries, flowing chocolate and a little extra sweetness to every celebration."
          className="mb-14"
        />

        {/* Occasions */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-16">
          {OCCASIONS.map((o, i) => (
            <motion.span
              key={o}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.04 * i, ease: EASE_OUT }}
              className="nb-pill px-5 py-2.5 text-[13px] font-semibold text-[#7A3B5E]"
            >
              {o}
            </motion.span>
          ))}
        </div>

        {/* Packages — three cards across. The cap is sized to the 3-up grid, not
            to the 2-up one this used to be: max-w-4xl (896px) was left over from
            the two-card layout and squeezed three cards into two cards' width,
            which is what put the huge empty gutters either side of this block. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 items-start max-w-6xl mx-auto">
          {PACKAGES.map((pkg, i) => {
            const Icon = pkg.icon
            const featured = !!pkg.featured
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: EASE_OUT }}
                className={`relative overflow-hidden ${featured ? 'nb-card-berry' : 'nb-card p-8'}`}
              >
                {/* The stand leads the featured card, full-bleed above the copy,
                    so the photo is the first thing the eye lands on. */}
                {pkg.photo && (
                  <div className="relative -mt-px">
                    <img
                      src={pkg.photo}
                      alt="The Naughty Berry stand, staffed and serving at an event"
                      loading="lazy"
                      className="h-64 w-full object-cover object-[50%_52%] sm:h-72"
                      draggable={false}
                    />
                    {/* Held off the photo until the last third — a wash across
                        the whole frame turns the stand into a pink smudge, and
                        the stand is the entire point of the card. */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(232,23,109,0) 0%, rgba(232,23,109,0.05) 46%, rgba(232,23,109,0.42) 74%, #E8176D 100%)',
                      }}
                    />
                    <span className="absolute left-6 top-6 rounded-full bg-white px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8176D] shadow-lg">
                      The stand comes to you
                    </span>
                    {/* <p className="absolute inset-x-6 bottom-4 text-[13px] font-semibold leading-snug text-white drop-shadow">
                      Lit, branded and fully staffed — your guests watch every cup poured.
                    </p> */}
                  </div>
                )}

                <div className={featured ? 'p-8 pt-6' : 'contents'}>
                {featured && (
                  // Hidden on phones: beside the "stand comes to you" badge at
                  // 400px the two labels end up all but touching, and the photo
                  // already does the "pick this one" work.
                  <span className="absolute top-6 right-6 hidden text-[10px] font-bold tracking-[0.18em] uppercase text-white/85 sm:block">
                    {/* Most Popular */}
                  </span>
                )}

                <Icon
                  size={22}
                  strokeWidth={2}
                  style={{ color: featured ? '#fff' : BERRY }}
                  aria-hidden="true"
                />

                <h3
                  className="mt-6 uppercase text-2xl leading-none"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: featured ? '#fff' : '#3B2116',
                  }}
                >
                  {pkg.name}
                </h3>
                <p className={`mt-2 text-sm ${featured ? 'text-white/70' : 'text-[#7A3B5E]/70'}`}>
                  {pkg.subtitle}
                </p>
                <p
                  className="mt-5 text-2xl font-bold"
                  style={{ color: featured ? '#fff' : BERRY }}
                >
                  {pkg.price}
                </p>

                <ul className={`mt-7 space-y-3 ${featured ? 'text-white/85' : 'text-[#7A3B5E]'}`}>
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm leading-snug">
                      <Check
                        size={14}
                        strokeWidth={3}
                        className="mt-[3px] shrink-0"
                        style={{ color: featured ? '#fff' : BERRY }}
                        aria-hidden="true"
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={quoteHref(pkg.id)}
                  className={`mt-9 block w-full py-3.5 rounded-full text-center text-[12px] font-bold tracking-[0.18em] uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFDCEA] focus-visible:ring-[#E8176D] ${
                    featured
                      ? 'bg-white text-[#E8176D] hover:bg-[#FFF0F6]'
                      : 'bg-[#E8176D] text-white hover:bg-[#C01057]'
                  }`}
                  aria-label={`Build a quote for the ${pkg.name} package`}
                >
                  {pkg.cta}
                </motion.a>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Enquiry form — the plain-form fallback for anyone who'd rather not
            go through the /quote builder. */}
        <motion.div
          id="event-form"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
          className="scroll-mt-24"
        >
          {/* <div className="text-center mb-8">
            <h3
              className="uppercase leading-[1.05] text-[clamp(1.5rem,3.4vw,2.5rem)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span className="text-[#E8176D]">Let’s make it </span>
              <span className="text-[#3B2116]">sweet.</span>
            </h3>
            <p className="mt-3 text-[#7A3B5E]">
              Rather keep it classic? The form below works too — either way we’ll
              come back to you within 24 hours.
            </p>
          </div> */}

          {/* Signpost to the builder, for anyone who scrolled past the package
              cards without clicking one. */}
     
{/* 
          <div className="nb-card overflow-hidden">
            <iframe
              title="Naughty Berry event enquiry form"
              src="https://airtable.com/embed/appIfLyWzGV0npV6U/pagEgThqjTZEQCLFY/form"
              width="100%"
              height="733"
              className="block w-full"
              style={{ background: 'transparent', border: 'none' }}
            />
          </div> */}

          {/* POPIA s18 notice at the point of collection. This form is Airtable's
              own page inside a frame on ours, so the disclosure has to sit out
              here — we cannot put anything inside the frame. */}
          {/* <p className="mt-4 text-center text-[12.5px] leading-relaxed text-[#7A3B5E]/70">
            This form is hosted by Airtable, and what you send goes straight to
            them on our behalf. We use it only to quote and to plan your event —
            see our{' '}
            <a
              href="/privacy-policy"
              className="font-semibold text-[#E8176D] underline decoration-[#E8176D]/30 underline-offset-2 hover:text-[#C01057]"
            >
              Privacy Policy
            </a>
            .
          </p> */}
        </motion.div>
      </div>
    </section>
  )
}
