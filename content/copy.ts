/**
 * Every headline, subhead, body string and CTA label on the site.
 *
 * RULES (see CLAUDE.md):
 * - Copy is edited here, never inside a component.
 * - No numbers in this file. Numbers live in content/facts.ts and render
 *   through <Fact />, so the build can verify them.
 * - No claim that is not supported. If a sentence needs a figure to be
 *   true, reference a fact instead of asserting it in prose.
 * - Tone: operational and precise. We sell throughput, uptime and
 *   material recovery. Confidence comes from specificity.
 */

export const COPY = {
  site: {
    name: 'Green Exchange',
    // Kept claim-free and mechanism-first on purpose.
    descriptor:
      'Reverse vending machines for PET bottles and aluminium cans, built and operated by Green Exchange.',
  },

  nav: {
    label: 'Primary',
    items: [
      { label: 'Technology', href: '/technology' },
      { label: 'For Retailers', href: '/retailers' },
      { label: 'Impact', href: '/impact' },
      { label: 'Investors', href: '/investors' },
      { label: 'Company', href: '/company' },
    ],
  },

  /**
   * The audience fork — the primary routing device of the site.
   *
   * Retail is listed first and weighted heavier because audience A outranks
   * audience B. The previews say what is behind each door in that audience's
   * own terms, so nobody has to guess which panel is for them.
   */
  fork: {
    eyebrow: 'Two ways in',
    retail: {
      title: 'I run retail stores',
      summary: 'Floor space, servicing, revenue share, and reporting you can file.',
      preview: [
        'Footprint, power, and collection access per machine',
        'Who services the machine, and how often',
        'Revenue share and in-store redemption',
        'Volumes and availability, reported per site',
      ],
      cta: 'Request a pilot',
      href: '/retailers',
    },
    investor: {
      title: 'I invest',
      summary: 'Unit economics, payback, material offtake, and the deployment plan.',
      preview: [
        'Capital and operating cost per machine',
        'Payback period and the assumptions behind it',
        'Offtake pricing by material stream',
        'Egypt deployment plan and MENA expansion case',
      ],
      cta: 'Investor access',
      href: '/investors',
    },
  },

  cta: {
    pilot: {
      label: 'Request a pilot',
      href: '/pilot',
      supporting: 'Site assessment and install plan for a named store.',
    },
    dataRoom: {
      label: 'Request data room access',
      href: '/investors/data-room',
      supporting: 'Unit economics, deployment plan and material offtake.',
    },
    /** Header CTA — deliberately quieter wording than the data room request. */
    investorAccess: {
      label: 'Investor access',
      href: '/investors',
    },
    spec: {
      label: 'Download machine specification',
      href: '/machine',
    },
  },

  // -----------------------------------------------------------------
  // Home — must serve the retail buyer first, investor second
  // -----------------------------------------------------------------
  home: {
    hero: {
      /**
       * Two headline forms, both real code paths.
       *
       * `scaled` is used once containers-per-machine-per-day has a value, and
       * states throughput inside the sentence. `base` is used while it is a
       * PLACEHOLDER, because "Take back — containers a day" is not a headline.
       * The scale is then carried by the specification strip below, with each
       * pending figure visibly marked.
       */
      headline: {
        base: 'Take back PET and aluminium at the store entrance.',
        scaled: { before: 'Take back', after: 'containers a day, at the store entrance.' },
      },
      subhead:
        'Green Exchange builds and operates reverse vending machines that accept used PET bottles and aluminium cans and return value to the depositor. We install, service and report. Your staff do not touch the machine.',
      /** Reads to both audiences: throughput and uptime for operations, deployment for investors. */
      specHeading: 'Per machine',
      scrollCue: 'Next — two ways in',
    },
    proposition: {
      headline: 'One machine, three outcomes',
      retail: {
        headline: 'Return footfall to the store',
        body: 'Depositors come to the machine, and the machine sits inside your footprint. Value returned to the depositor can be redeemed in store.',
      },
      operations: {
        headline: 'No servicing burden on store staff',
        body: 'Collection, maintenance and material logistics are ours. You provide floor space and power.',
      },
      compliance: {
        headline: 'Reporting you can put in a disclosure',
        body: 'Every deposit is counted by stream. Recovered tonnage is reported per site on a fixed cadence.',
      },
    },
    howItWorks: {
      headline: 'How a deposit works',
      steps: [
        {
          headline: 'Insert',
          body: 'The depositor feeds in a PET bottle or aluminium can. The machine identifies the container and the stream.',
        },
        {
          headline: 'Validate and compact',
          body: 'Accepted containers are compacted and sorted by material on board, so a collection carries more.',
        },
        {
          headline: 'Return value',
          body: 'The depositor receives value for the container, redeemable in store.',
        },
        {
          headline: 'Collect and bale',
          body: 'We collect on a scheduled route, bale by stream, and report the recovered tonnage back to the site.',
        },
      ],
    },
    traction: {
      headline: 'Where we are now',
      // Deliberately no adjectives. The facts carry this section.
      body: 'Current deployment and recovery figures, updated as machines go live.',
    },
    closing: {
      headline: 'Start with one store.',
      body: 'A pilot is a single site, a defined review period, and a written assessment at the end of it.',
    },
  },

  // -----------------------------------------------------------------
  // Retail — audience A, the primary commercial target
  // -----------------------------------------------------------------
  retail: {
    hero: {
      headline: 'A deposit point that pays for its floor space.',
      subhead:
        'For hypermarket, supermarket and convenience operators placing machines at store entrances or in car parks.',
    },
    footprint: {
      headline: 'What the machine needs from the site',
      body: 'Floor space, power and access for collection. Nothing else.',
    },
    servicing: {
      headline: 'Who does the work',
      body: 'Green Exchange operates the machine. Collection and maintenance run on our schedule, not your rota.',
    },
    commercial: {
      headline: 'How the site earns',
      body: 'Revenue share on recovered material, plus redemption in store when depositors spend the value they receive.',
    },
    reporting: {
      headline: 'What you receive',
      body: 'Volumes by stream and by site, recovered tonnage, and machine availability, on a fixed reporting cadence.',
    },
    pilot: {
      headline: 'What a pilot involves',
      steps: [
        'Site assessment: entrance or car park, siting, power and collection access.',
        'Install and commissioning on an agreed date.',
        'Defined review period with reporting from day one.',
        'Written assessment: volumes, availability, and a decision on rollout.',
      ],
    },
  },

  // -----------------------------------------------------------------
  // Investors — audience B
  // -----------------------------------------------------------------
  investors: {
    hero: {
      headline: 'Deposit infrastructure for the Egyptian retail network.',
      subhead:
        'Machines built in Romania, deployed and operated in Egypt. Revenue from recovered material and retail partnerships.',
    },
    thesis: {
      headline: 'The position',
      body: 'PET and aluminium enter Egypt in volume and are recovered at a fraction of that rate. Retail is where containers are already carried in.',
    },
    unitEconomics: {
      headline: 'Unit economics',
      body: 'Capital cost, operating cost and payback measured per machine. Material offtake priced by stream.',
    },
    defensibility: {
      headline: 'Defensibility',
      body: 'We build the hardware and hold the retail siting agreements and collection routes. Placement compounds: each site makes the next route cheaper to serve.',
    },
    market: {
      headline: 'Market',
      body: 'Egypt first, on the retail network. MENA is expansion, not the near-term case.',
    },
    dataRoom: {
      headline: 'Data room',
      body: 'Financial model, deployment plan, machine specification and offtake terms. Access on request.',
    },
  },

  /**
   * The journey of one container, in the order it actually happens.
   *
   * Three corrections to the obvious reading of the sequence, each for a
   * mechanical reason:
   *
   * 1. SORTING PRECEDES COMPACTION. The machine has to know the material
   *    before it can route it, and each stream is compacted differently — PET
   *    is perforated so it cannot be re-inflated and refunded twice, cans are
   *    flattened. A crushed mixed mass cannot be sorted afterwards.
   * 2. RETURNING VALUE IS A STEP. It is the entire point of a reverse vending
   *    machine and it happens at the machine, immediately after acceptance.
   * 3. IDENTIFY AND VALIDATE ARE DIFFERENT. Identification reads the
   *    container; validation decides whether it is a registered,
   *    deposit-bearing container and hands back anything it cannot place.
   *
   * Baling happens at a processing centre rather than in the store, which is
   * why it sits after collection.
   */
  technology: {
    eyebrow: 'Technology',
    headline: 'One container, end to end.',
    intro:
      'What happens between a depositor putting a bottle in and a reprocessor buying the material back. Each step carries the specification that governs it.',
    progressLabel: 'Sequence progress',
    steps: [
      {
        id: 'deposit',
        title: 'Deposit',
        body: 'The depositor feeds a single container into the intake. One at a time, upright or on its side — the machine indexes it onto the transport before anything else happens.',
        factId: 'accepted-container-sizes',
      },
      {
        id: 'identify',
        title: 'Identify',
        body: 'A barcode read establishes which product it is. In parallel, near-infrared sensing reads the polymer and an inductive sensor detects metal, so the machine knows the material even if the label is damaged.',
        factId: 'container-recognition-rate',
      },
      {
        id: 'validate',
        title: 'Validate',
        body: 'The read is checked against the register of deposit-bearing containers, and the container is checked for shape and emptiness. Anything unrecognised is handed straight back rather than swallowed.',
        factId: 'deposit-cycle-per-container',
      },
      {
        id: 'return-value',
        title: 'Return value',
        body: 'Accepted containers are credited to the depositor at the machine — the reason they came. Value is redeemable in the store, which is what turns a return trip into a shopping trip.',
        factId: 'deposit-value-per-container',
      },
      {
        id: 'sort',
        title: 'Sort by stream',
        body: 'The container is diverted to its own path on the strength of the material read: PET one way, aluminium the other. Sorting happens here, before anything is crushed, because a compacted mixed mass cannot be separated.',
        factId: 'stream-separation-purity',
      },
      {
        id: 'compact',
        title: 'Compact',
        body: 'Each stream is compacted its own way. PET is perforated and flattened so it cannot be re-inflated and claimed twice; cans are pressed flat. This is what makes a collection worth sending a vehicle for.',
        factId: 'compaction-ratio',
      },
      {
        id: 'store',
        title: 'Store',
        body: 'Compacted material drops into a separate bin per stream, never a single mixed hopper. Fill level is monitored continuously, so a collection is scheduled against real volume rather than a calendar.',
        factId: 'machine-capacity-per-collection',
      },
      {
        id: 'collect',
        title: 'Collect and report',
        body: 'Green Exchange collects on a route driven by fill level. Every accepted container is already counted, so the site receives volumes by stream and machine availability without anyone tallying anything.',
        factId: 'servicing-frequency',
      },
      {
        id: 'offtake',
        title: 'Bale and offtake',
        body: 'Material is baled by stream at a processing centre, not in the store, then sold to a reprocessor. Separation quality upstream is what the bale is priced on.',
        factId: 'value-per-tonne-baled-pet',
      },
    ],
  },

  // -----------------------------------------------------------------
  // Forms
  // -----------------------------------------------------------------
  forms: {
    pilot: {
      headline: 'Request a pilot',
      subhead: 'Tell us the chain and the store. We come back with a site assessment.',
      fields: {
        name: 'Full name',
        role: 'Role',
        company: 'Chain or company',
        email: 'Work email',
        phone: 'Phone',
        storeCount: 'Number of stores',
        city: 'City',
        siteType: 'Intended placement',
        message: 'Anything we should know about the site',
      },
      submit: 'Request a pilot',
      success: 'Received. We will come back to you with next steps for a site assessment.',
      error: 'That did not send. Please try again, or email us directly.',
    },
    dataRoom: {
      headline: 'Request data room access',
      subhead: 'Access is granted to named individuals.',
      fields: {
        name: 'Full name',
        firm: 'Firm',
        email: 'Work email',
        type: 'Investor type',
        ticket: 'Typical cheque size',
        message: 'What you want to see first',
      },
      submit: 'Request access',
      success: 'Received. We will review and come back to you about access.',
      error: 'That did not send. Please try again, or email us directly.',
    },
  },

  footer: {
    company: 'Green Exchange',
    // No certifications, awards or memberships until they exist and are documented.
    legal: 'Registered in Romania.',
    rights: 'All rights reserved.',
    registrationHeading: 'Registered entity',
    contactHeading: 'Contact',
    legalHeading: 'Legal',
    languageHeading: 'Language',
    links: [
      { label: 'Privacy', href: '/legal/privacy' },
      { label: 'Cookies', href: '/legal/cookies' },
      { label: 'Terms', href: '/legal/terms' },
      { label: 'Investor disclaimer', href: '/legal/investor-disclaimer' },
    ],
    /**
     * EN is live. AR and RO are stubs and are marked unavailable rather than
     * rendered as working controls — a language switch that silently does
     * nothing is worse than one that says it isn't ready.
     */
    locales: [
      { code: 'EN', label: 'English', available: true },
      { code: 'AR', label: 'العربية', available: false },
      { code: 'RO', label: 'Română', available: false },
    ],
    localeUnavailable: 'Not yet available',
  },

  a11y: {
    skipToContent: 'Skip to main content',
    mainNav: 'Main navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    menuLabel: 'Site menu',
    forkLabel: 'Choose the path that describes you',
    currentLanguage: 'Current language',
    placeholderFact: 'Figure not yet published',
  },
} as const;
