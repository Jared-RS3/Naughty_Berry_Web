import LegalLayout, {
  A,
  BUSINESS,
  Bullet,
  Bullets,
  Callout,
  DataTable,
  Section,
  SubHeading,
  type TocEntry,
} from './LegalLayout'
import { CookieSettingsLink } from './CookieBanner'

/**
 * /cookie-policy
 *
 * ── What this page has to keep true ─────────────────────────────────────────
 * This page used to say "we set no cookies at all", and that was accurate until
 * Google Analytics 4 was added. It now describes exactly one non-essential
 * technology (GA4) and exactly one piece of essential storage (the record of
 * the visitor's own consent decision). Both claims were checked against the
 * source, and both have to be re-checked by anyone who changes it:
 *
 *   • GA4 — src/lib/analytics.ts. gtag.js is appended to the document only
 *     after consent is granted, never before, and withdrawal disables the
 *     library and deletes its cookies. The measurement ID comes from
 *     VITE_GA_MEASUREMENT_ID; with it unset, nothing loads and the banner does
 *     not appear, which is a state this page has to remain honest about too.
 *   • The consent record — src/lib/consent.ts. One key in localStorage,
 *     `nb.cookie-consent`, holding a version, an answer and a timestamp.
 *   • The Airtable form iframe in Events.tsx is still the only third-party
 *     frame, and still the only place a cookie we do not control can appear.
 *
 * Nothing else in src/ touches document.cookie, localStorage or sessionStorage.
 * Adding any further analytics, embed, chat widget or A/B tool means rewriting
 * this page, adding the category to the banner, and bumping CONSENT_VERSION —
 * in the same commit. POPIA s11 needs a lawful ground for placing a
 * non-essential cookie, and for a tracking cookie that ground can only be
 * consent.
 *
 * Google Search Console, declared in section 3, is deliberately NOT in that
 * category. It is server-side on Google's end: domain ownership is proven by a
 * DNS record, not a tag in index.html, and the figures come from Google's
 * search logs rather than from anything observing a visitor here. No script, no
 * cookie, nothing to consent to.
 */

const TOC: TocEntry[] = [
  { id: 'summary', label: 'The short version' },
  { id: 'what-cookies-are', label: 'What cookies are' },
  { id: 'what-we-use', label: 'What this site uses' },
  { id: 'analytics', label: 'Google Analytics in detail' },
  { id: 'third-party', label: 'The one third-party frame' },
  { id: 'your-choice', label: 'Your choice, and changing it' },
  { id: 'control', label: 'How to control cookies yourself' },
  { id: 'changes', label: 'Changes to this policy' },
]

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      path="/cookie-policy"
      eyebrow="Cookies"
      title={
        <>
          Cookie
          <br />
          Policy
        </>
      }
      documentTitle="Cookie Policy – Naughty Berry | Cape Town"
      intro={
        <>
          Most cookie policies are long because the site has a lot to declare. Ours is short because{' '}
          {BUSINESS.site} uses exactly one non-essential technology — Google Analytics — and it does
          not run at all unless you say yes. This page explains what it is, what it sets on your
          device, and how to switch it off again at any time.
        </>
      }
      toc={TOC}
    >
      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="summary" heading="1. The short version">
        <Callout>
          <strong>Nothing non-essential loads until you agree to it.</strong> Google Analytics is
          the only tracking technology on this site, and its script is not added to the page — at
          all — unless you have accepted it. If you decline, or simply ignore the banner, no
          analytics cookie is ever set and no information about your visit reaches Google Analytics.
          There is no advertising pixel, no session recording, no heatmap and no fingerprinting on
          this site.
        </Callout>

        <p>So there are three things on this page worth knowing:</p>

        <Bullets>
          <Bullet>
            <strong>Google Analytics</strong> — optional, off by default, sets Google’s{' '}
            <code className="rounded bg-[#E8176D]/8 px-1 text-[13px]">_ga</code> cookies for up to
            two years if you accept. <A href="#analytics">Section 4</A>.
          </Bullet>
          <Bullet>
            <strong>The record of your answer</strong> — one line in your browser’s local storage so
            we do not ask you again on every page. Essential, identifies nobody, never sent to us.{' '}
            <A href="#what-we-use">Section 3</A>.
          </Bullet>
          <Bullet>
            <strong>The Airtable enquiry form</strong> embedded in our Events section, which is
            another company’s page inside ours and may set its own necessary cookies.{' '}
            <A href="#third-party">Section 5</A>.
          </Bullet>
        </Bullets>

        <p>
          We also use Google Search Console, which despite the name is not analytics and never
          reaches your browser — <A href="#what-we-use">section 3</A> explains the difference.
        </p>

        <p>
          Changed your mind, either way? <CookieSettingsLink asProse className="font-semibold text-[#E8176D] underline decoration-[#E8176D]/30 underline-offset-[3px] transition-colors hover:text-[#C01057]" />{' '}
          — it is in the footer of every page too.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="what-cookies-are" heading="2. What cookies are">
        <p>
          A cookie is a small text file a website asks your browser to keep and hand back on your
          next visit. Related technologies — local storage, session storage, pixels, device
          fingerprinting — do much the same job by other means, and this policy treats them all the
          same way.
        </p>

        <p>They are usually put to one of a few uses:</p>

        <Bullets>
          <Bullet>
            <strong>Strictly necessary</strong> — keeping you logged in, holding a shopping basket,
            remembering a privacy choice you have just made. A site cannot do what you asked of it
            without these, so they do not need your consent.
          </Bullet>
          <Bullet>
            <strong>Preferences</strong> — remembering a language, a region, a dark mode.
          </Bullet>
          <Bullet>
            <strong>Analytics</strong> — counting visitors and measuring which pages get read.
          </Bullet>
          <Bullet>
            <strong>Marketing and advertising</strong> — following you between sites to target ads.
            These are the ones consent rules exist for.
          </Bullet>
        </Bullets>

        <p>
          We use the first category (one item, described below) and the third (Google Analytics,
          only with your consent). We use no preference cookies and no marketing or advertising
          cookies whatsoever.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="what-we-use" heading="3. What this site uses">
        <DataTable
          columns={['Technology', 'Do we use it?', 'Notes']}
          rows={[
            [
              'Google Analytics 4',
              'Only if you accept',
              'Off by default. The script is not loaded until you consent, and declining means it is never loaded at all. See section 4.',
            ],
            [
              'Consent record (local storage)',
              'Yes — strictly necessary',
              'One key, nb.cookie-consent, holding your answer, the version of this policy you answered against, and the date. Not a cookie, never sent to our server, identifies nobody. Without it we would have to ask you on every single page.',
            ],
            [
              'Other first-party cookies',
              'No',
              'The site sets none of its own.',
            ],
            [
              'Advertising or retargeting pixels',
              'No',
              'No Meta pixel, no Google Ads tag, no TikTok pixel, nothing. Google Analytics is configured with Google Signals and ad personalisation switched off, so it cannot be used to build advertising audiences either.',
            ],
            [
              'Session recording or heatmaps',
              'No',
              'We do not record what you click, scroll or type.',
            ],
            [
              'Social media embeds and share widgets',
              'No',
              'Our Instagram and WhatsApp links are ordinary links. Nothing loads from those companies unless you click through.',
            ],
            [
              'Google Search Console',
              'Yes — but it is not a cookie',
              'Adds nothing to this site and sets nothing on your device. Reports on Google’s own search results, not on your visit. See below.',
            ],
            [
              'Third-party frame (Airtable enquiry form)',
              'Yes — one',
              'May set its own necessary cookies inside the frame. See section 5.',
            ],
          ]}
        />

        <SubHeading>Things that are not cookies, but are worth telling you about</SubHeading>

        <p>
          Two parts of the site make a request to another company’s servers while a page loads, no
          matter what you choose here. That discloses your IP address to them — a normal consequence
          of loading anything from the web, and not something a cookie banner would address, but you
          should know about it:
        </p>

        <Bullets>
          <Bullet>
            <strong>Google Fonts.</strong> Your browser downloads our two typefaces from Google’s
            font servers. Google receives your IP address and browser details. No cookie is set and
            nothing about your visit to us is sent.
          </Bullet>
          <Bullet>
            <strong>Airtable.</strong> Our pop-up schedule is read live from Airtable by your
            browser, so the dates and locations on the page are never stale. Airtable receives your
            IP address and browser details as part of that request.
          </Bullet>
        </Bullets>

        <p>
          Both are covered in more detail in our{' '}
          <A href="/privacy-policy#sharing">Privacy Policy</A>.
        </p>

        <SubHeading>Google Search Console</SubHeading>

        <p>
          We use Google Search Console, and we are declaring it here because it is easily confused
          with the analytics described in the next section. They are different tools and only one of
          them touches your browser.
        </p>

        <p>
          Search Console is a tool Google gives the owner of a website to see how that site behaves{' '}
          <em>in Google’s search results</em>. All of it happens on Google’s side. Nothing is added
          to this site to make it work — no script, no pixel, no tag, no cookie, nothing that loads
          or runs while you are reading this page. Proving to Google that we own the domain is a
          one-off record in our domain settings, invisible to your browser.
        </p>

        <p>
          What it shows us is Google’s own count of things Google already did: which search terms
          brought people to us, how often a page of ours was shown, how often it was clicked, and
          the country or region those searches came from — all as totals, never as people. We could
          not identify a visitor from it if we wanted to.
        </p>

        <Callout>
          <strong>Nothing to opt out of.</strong> Search Console places nothing on your device and
          receives nothing about your visit here, so there is no consent to give and no setting for
          you to change on our side. If you would rather Google knew less about your searches
          generally, that is a matter between you and Google — their{' '}
          <A href="https://myactivity.google.com/">My Activity</A> page is where those controls live.
        </Callout>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="analytics" heading="4. Google Analytics in detail">
        <p>
          We use <strong>Google Analytics 4</strong>, a measurement service provided by Google
          Ireland Limited and Google LLC, to understand how many people visit {BUSINESS.site}, which
          pages they read and which pop-ups and flavours they care about. We are a small dessert
          business deciding where to park a trailer; that is genuinely what this is for.
        </p>

        <Callout>
          <strong>It runs only with your consent.</strong> Google Analytics is not loaded when the
          page opens. Its script is fetched from{' '}
          <code className="rounded bg-[#E8176D]/8 px-1 text-[13px]">googletagmanager.com</code> only
          after you accept, which means that if you decline — or never answer — Google receives no
          request, no cookie is set, and there is no record of your visit in our analytics at all.
        </Callout>

        <SubHeading>What it stores on your device</SubHeading>

        <DataTable
          columns={['Cookie', 'What it is for', 'How long it lasts']}
          rows={[
            [
              '_ga',
              'Gives your browser a random identifier so Google can tell one returning browser from another. It is a random number, not a name.',
              'Up to 2 years',
            ],
            [
              '_ga_<container ID>',
              'Keeps track of the current session — when it started and whether it is still going.',
              'Up to 2 years',
            ],
          ]}
        />

        <p>
          These are first-party cookies set on our domain, but the information in them is read by
          Google’s script. If Google adds or renames a cookie, the current list is in Google’s own{' '}
          <A href="https://developers.google.com/analytics/devguides/collection/ga4/cookie-usage">
            cookie usage documentation
          </A>
          .
        </p>

        <SubHeading>What is sent to Google</SubHeading>

        <Bullets>
          <Bullet>
            The page you are on, its title, the page you came from, and when.
          </Bullet>
          <Bullet>
            Your device and browser — type, operating system, screen size, language.
          </Bullet>
          <Bullet>
            Your IP address, which every request on the internet discloses. Google Analytics uses it
            to work out an approximate location — country, region, roughly which city — and does not
            store the address itself in the Analytics data we see.
          </Bullet>
          <Bullet>
            The random identifier in the <code className="rounded bg-[#E8176D]/8 px-1 text-[13px]">_ga</code>{' '}
            cookie, which is how repeat visits are recognised as repeat visits.
          </Bullet>
          <Bullet>
            A handful of interactions Google Analytics measures automatically, which it calls{' '}
            <em>enhanced measurement</em>: how far down a page you scrolled, clicks on links that
            lead off our site, and the fact that a form on the page was started or submitted.
          </Bullet>
        </Bullets>

        <Callout>
          <strong>Never the contents of a form.</strong> Enhanced measurement records{' '}
          <em>that</em> our enquiry form was started or sent, as a count. It does not read the boxes
          and we do not send it their contents — no name, no email address, no phone number, no
          notes. What you typed goes to us, and stays between us.
        </Callout>

        <Callout>
          <strong>We never send Google your personal information.</strong> Google’s own terms forbid
          it and so does our code: nothing you type into the quote builder — your name, email
          address, phone number, venue or notes — is ever sent to Google Analytics. Our analytics
          code refuses to send any value that looks like an email address or a phone number, and
          strips anything of that shape out of a page address before it is recorded. If you ever see
          evidence to the contrary, tell us at{' '}
          <A href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</A> and we will fix it.
        </Callout>

        <SubHeading>What we can and cannot see</SubHeading>

        <p>
          We see reports: how many people came, which pages were read, how long for, roughly where
          in the world they were, and which sites or searches sent them. We cannot see who you are,
          we cannot look up an individual, and we have no way to connect a visit to an enquiry you
          later send us.
        </p>

        <p>
          We have deliberately turned off <strong>Google Signals</strong> and{' '}
          <strong>ad personalisation</strong>. That means your visit cannot be added to an
          advertising audience, cannot be used to retarget you, and is not combined with the
          Google-account browsing history Google holds about you elsewhere. This is measurement, and
          we have restricted it to measurement.
        </p>

        <SubHeading>Google’s side of it</SubHeading>

        <p>
          Google processes this information on our instructions as our operator under POPIA, and as
          a processor under its own data-processing terms. Because Google LLC is a United States
          company, accepting analytics means your device sends this information outside South
          Africa. Section 72(1)(c) of POPIA permits that transfer where you have consented to it,
          which is precisely what the banner is asking.
        </p>

        <p>
          How Google handles it is set out in{' '}
          <A href="https://policies.google.com/privacy">Google’s Privacy Policy</A> and in{' '}
          <A href="https://policies.google.com/technologies/partner-sites">
            How Google uses information from sites or apps that use our services
          </A>
          . Event-level data is deleted after the retention period set in our Google Analytics
          account; Google’s options are 2 or 14 months, after which only aggregated reporting
          remains.
        </p>

        <SubHeading>Turning it off</SubHeading>

        <Bullets>
          <Bullet>
            <strong>Here, at any time.</strong>{' '}
            <CookieSettingsLink asProse className="font-semibold text-[#E8176D] underline decoration-[#E8176D]/30 underline-offset-[3px] transition-colors hover:text-[#C01057]" />{' '}
            and switch analytics off. We stop the script immediately, tell it to store nothing
            further, and delete the{' '}
            <code className="rounded bg-[#E8176D]/8 px-1 text-[13px]">_ga</code> cookies it set — no
            reload needed.
          </Bullet>
          <Bullet>
            <strong>Everywhere, for every site.</strong> Google publishes a{' '}
            <A href="https://tools.google.com/dlpage/gaoptout">
              browser add-on that opts you out of Google Analytics
            </A>{' '}
            across the whole web.
          </Bullet>
          <Bullet>
            <strong>In your browser.</strong> Blocking cookies or using a tracker-blocking extension
            works here exactly as it does anywhere — see <A href="#control">section 7</A>.
          </Bullet>
        </Bullets>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="third-party" heading="5. The one third-party frame">
        <p>
          The Events section of our home page embeds an enquiry form hosted by Airtable. That frame
          is Airtable’s own page displayed inside ours. If it loads, Airtable may set cookies that
          are necessary to make the form work and to protect it from abuse.
        </p>

        <Bullets>
          <Bullet>Those cookies belong to Airtable, not to us. We cannot read them.</Bullet>
          <Bullet>
            Anything you type into that form goes directly to Airtable, governed by Airtable’s
            privacy policy alongside ours.
          </Bullet>
          <Bullet>
            You can avoid it entirely: use our <A href="/quote">quote builder</A> instead, or just
            email <A href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</A>. Blocking third-party
            cookies in your browser will also stop it, though the form may then not work.
          </Bullet>
        </Bullets>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="your-choice" heading="6. Your choice, and changing it">
        <p>
          Under POPIA, placing a non-essential cookie on your device is processing that needs a
          lawful ground, and in practice the only honest one is your consent — voluntary, specific
          and informed, and withdrawable at any time. That is what the banner is for, and we have
          tried to build it the way those words actually read:
        </p>

        <Bullets>
          <Bullet>
            <strong>Nothing runs while you decide.</strong> Analytics is not loading in the
            background behind the banner. Consent comes first, then the script.
          </Bullet>
          <Bullet>
            <strong>Declining is one click, the same as accepting.</strong> Same size, same place,
            same weight. No maze, no “manage 412 partners”, no button greyed out to make refusing
            feel like the difficult option.
          </Bullet>
          <Bullet>
            <strong>Ignoring it means no.</strong> Closing the banner, scrolling past it or never
            touching it is not consent, and we do not treat it as consent.
          </Bullet>
          <Bullet>
            <strong>The switch starts off.</strong> A pre-ticked box is not a choice, so the toggle
            in the preferences panel is off until you turn it on.
          </Bullet>
          <Bullet>
            <strong>The site works either way.</strong> Nothing is withheld, blurred or paywalled
            because you said no. We are selling strawberries, not your attention.
          </Bullet>
          <Bullet>
            <strong>You can change your mind forever.</strong> The “Cookie settings” link sits in
            the footer of every page, including this one, and withdrawing is as quick as consenting
            was.
          </Bullet>
        </Bullets>

        <p>
          We record your answer together with the version of this policy it was given against, so
          that if we ever materially change what we use cookies for, the old answer expires and we
          ask you again rather than assuming the previous yes still covers it.
        </p>

        <Callout>
          <strong>Your settings, right here:</strong>{' '}
          <CookieSettingsLink asProse className="font-semibold text-[#E8176D] underline decoration-[#E8176D]/30 underline-offset-[3px] transition-colors hover:text-[#C01057]" />
          . You can also clear the record entirely and have the banner ask you from scratch.
        </Callout>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="control" heading="7. How to control cookies yourself">
        <p>
          Our own switch is above, but you are entitled to control what any site does, and your
          browser is the place to do it. Every major browser lets you see stored cookies, delete
          them, block third-party cookies, or refuse them entirely:
        </p>

        <Bullets>
          <Bullet>
            <strong>Chrome</strong> — Settings → Privacy and security → Third-party cookies
          </Bullet>
          <Bullet>
            <strong>Safari</strong> — Settings → Privacy (macOS: Safari → Settings → Privacy)
          </Bullet>
          <Bullet>
            <strong>Firefox</strong> — Settings → Privacy &amp; Security → Cookies and Site Data
          </Bullet>
          <Bullet>
            <strong>Edge</strong> — Settings → Cookies and site permissions
          </Bullet>
        </Bullets>

        <p>
          One honest side effect: clearing your browser storage for this site also clears the record
          of your cookie choice, so the banner will introduce itself again on your next visit. That
          is the trade-off of not tracking you — we have no other way to remember what you said.
        </p>

        <p>
          Blocking cookies site-wide can break other websites; on ours the visible effects would be
          the embedded Airtable form and the banner reappearing. Private or incognito browsing
          clears everything when you close the window, which achieves much the same thing without
          changing your settings.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="changes" heading="8. Changes to this policy">
        <p>
          If we add anything that stores data in your browser or tracks your visit, this page
          changes before it goes live, not after — and if what we add is not strictly necessary, we
          will ask your permission first, through the same banner, with the same real option to
          refuse.
        </p>

        <p className="!mt-8 text-[14px] text-[#7A3B5E]/70">
          Questions? Email <A href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</A>. See also our{' '}
          <A href="/privacy-policy">Privacy Policy</A> and{' '}
          <A href="/terms">Terms of Use</A>.
        </p>
      </Section>
    </LegalLayout>
  )
}
