import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading'
import { Users, Star, Check, Sparkles } from 'lucide-react'

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
    id: 'medium',
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
    id: 'medium',
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
const quoteHref = (pkgId: string) => `/quote?pkg=${pkgId === 'small' ? 'little' : 'indulgent'}`

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

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        <SectionHeading
          eyebrow="Events & Catering"
          word="EVENTS"
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

        {/* Packages — two cards now, so a capped, centred 2-up grid instead of
            thirds that left a phantom empty column on the right. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20 items-start max-w-4xl mx-auto">
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
                    Most Popular
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
                    fontFamily: "'Archivo Black', system-ui, sans-serif",
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
          <div className="text-center mb-8">
            <h3
              className="uppercase leading-[1.05] text-[clamp(1.5rem,3.4vw,2.5rem)]"
              style={{ fontFamily: "'Archivo Black', system-ui, sans-serif" }}
            >
              <span className="text-[#E8176D]">Let’s make it </span>
              <span className="text-[#3B2116]">sweet.</span>
            </h3>
            <p className="mt-3 text-[#7A3B5E]">
              Rather keep it classic? The form below works too — either way we’ll
              come back to you within 24 hours.
            </p>
          </div>

          {/* Signpost to the builder, for anyone who scrolled past the package
              cards without clicking one. */}
          <div className="mb-8 text-center">
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="/quote"
              className="inline-flex items-center gap-2.5 rounded-full bg-[#E8176D] px-8 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_14px_32px_rgba(232,23,109,0.32)] transition-colors hover:bg-[#C01057]"
            >
              <Sparkles size={15} />
              Build your quote
            </motion.a>
            <p className="mt-3 text-[13px] text-[#7A3B5E]/70">
              Takes about a minute — and it’s a lot more fun than a form.
            </p>
          </div>

          <div className="nb-card overflow-hidden">
            <iframe
              title="Naughty Berry event enquiry form"
              src="https://airtable.com/embed/appIfLyWzGV0npV6U/pagEgThqjTZEQCLFY/form"
              width="100%"
              height="733"
              className="block w-full"
              style={{ background: 'transparent', border: 'none' }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
