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
    retail: 'For retail',
    investors: 'For investors',
    howItWorks: 'How it works',
    company: 'Company',
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
      headline: 'Take back containers at the store entrance.',
      subhead:
        'Green Exchange builds and operates reverse vending machines that accept used PET bottles and aluminium cans and return value to the depositor. We install, service and report. Your staff do not touch the machine.',
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
  },

  a11y: {
    skipToContent: 'Skip to main content',
    mainNav: 'Main navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    placeholderFact: 'Figure not yet published',
  },
} as const;
