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
      { label: 'For Retailers', href: '/for-retailers' },
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
      href: '/for-retailers',
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

  /**
   * /for-retailers — audience A, and the page that has to survive a
   * risk-averse operations lead reading it properly.
   *
   * The headline names their exposure rather than our product, and the page is
   * ordered the way the objections arrive: what does it cost me in space, in
   * labour, in attention. Nothing on this page carries a price; the ask is a
   * pilot conversation.
   */
  forRetailers: {
    hero: {
      eyebrow: 'For retail operators',
      headline: 'Take-back arrives as three costs: floor space, staff time, and attention.',
      subhead:
        'Green Exchange installs and operates the machine, so the only one you carry is the floor space. This page states how much of it, what the machine needs from the site, who does the work when something jams, and what comes back to you.',
    },

    deployment: {
      heading: 'Deployment model',
      intro:
        'One line each, so there is no question about where the boundary sits. The machine stays on our balance sheet and our rota.',
      columns: [
        {
          heading: 'What we install',
          items: [
            'The machine, commissioned and tested on site',
            'Signage at the deposit point',
            'Connectivity and remote monitoring',
            'Fill-level telemetry that schedules its own collection',
          ],
        },
        {
          heading: 'What we own and operate',
          items: [
            'The hardware, for its whole life',
            'Collection, transport and baling',
            'Maintenance, spares and fault response',
            'Material offtake and the reporting you receive',
          ],
        },
        {
          heading: 'What you provide',
          items: [
            'Floor space at an agreed position',
            'A power supply within reach of it',
            'Access for a collection vehicle',
            'A named site contact — not a trained operator',
          ],
        },
      ],
      placementHeading: 'Placement options',
      placementIntro:
        'Three positions, and they trade off against each other. The right one is a site-by-site decision made at the assessment, not a policy.',
      placementColumns: [
        'Placement',
        'Space comes from',
        'Weather exposure',
        'Footfall exposure',
        'Servicing access',
        'Power run',
      ],
      placements: [
        {
          name: 'Inside the entrance',
          space: 'Sales floor',
          weather: 'None — fully sheltered',
          footfall: 'Highest: every visitor passes it',
          servicing: 'During trading hours, through the entrance',
          power: 'Shortest, from the store board',
        },
        {
          name: 'Under an external canopy',
          space: 'External area, not sales floor',
          weather: 'Sheltered from rain, exposed to heat',
          footfall: 'High: visible on the approach',
          servicing: 'Outside trading hours, no entry to the store',
          power: 'External run required',
        },
        {
          name: 'Car park island',
          space: 'Parking bay, no sales floor at all',
          weather: 'Full exposure — needs the outdoor specification',
          footfall: 'Lower: a deliberate stop, not a passing one',
          servicing: 'Easiest — vehicle pulls alongside',
          power: 'Longest run, and a civils job',
        },
      ],
    },

    footprint: {
      heading: 'Footprint and site requirements',
      intro:
        'What a site engineer needs before they can say yes. Every figure here is measured or marked as unmeasured — none of it is indicative.',
      note: 'Service clearance is additional to the machine footprint. A site that fits the machine but not the clearance is not a site.',
      specs: [
        'floor-space-required-m2',
        'machine-dimensions',
        'service-clearance',
        'floor-loading',
        'power-requirement',
        'connectivity-requirement',
      ],
    },

    servicing: {
      heading: 'Servicing',
      intro:
        'The part that decides whether this is an asset or a chore. None of it lands on your staff.',
      items: [
        {
          question: 'Who empties it?',
          answer:
            'We do. A Green Exchange crew collects on a route driven by fill-level telemetry, not by a calendar and not by a phone call from your duty manager.',
          factId: 'servicing-frequency',
        },
        {
          question: 'What happens when it jams?',
          answer:
            'The machine reports the fault itself and takes itself out of service so it cannot swallow another container. Your site contact does not diagnose anything; they do not need a key. We attend.',
          factId: 'fault-response-time',
        },
        {
          question: 'What is the uptime commitment?',
          answer:
            'Availability is measured per machine over a stated window and reported to you with the volumes. A machine that is down is our problem and it appears in your report, not just ours.',
          factId: 'machine-uptime',
        },
      ],
    },

    benefits: {
      heading: 'What comes back to you',
      intro:
        'Four things, in the order a board will ask about them. Two of them are unmeasured, and this page says so rather than borrowing a number from another market.',
      items: [
        {
          heading: 'Footfall and dwell',
          body: 'A deposit point gives a reason to come, and the value returned is redeemable in store. We will not put a figure on this before a pilot measures it at your site — anyone who does is guessing on your behalf.',
          factIds: ['footfall-effect', 'dwell-time-effect'],
        },
        {
          heading: 'Loyalty integration',
          body: 'Value can be issued to your existing loyalty scheme instead of a paper voucher, which keeps the redemption inside your basket and inside your data.',
          factIds: ['voucher-redemption-rate'],
        },
        {
          heading: 'ESG reporting output',
          body: 'Volumes by material stream, recovered tonnage, and machine availability, per site, on a fixed cadence — in a form you can put into a disclosure without re-deriving it.',
          factIds: ['esg-reporting-cadence'],
        },
        {
          heading: 'Compliance positioning',
          body: 'Egypt has no national deposit-return scheme today. Operating collection infrastructure before one exists is a materially different position from retrofitting under a deadline, and it is the one we can help you take.',
          factIds: ['retailer-revenue-share'],
        },
      ],
    },

    roi: {
      heading: 'Estimate the scale',
      intro:
        'Set your own numbers. The model is deliberately simple and every coefficient behind it is listed below, with the source it has to come from.',
      inputs: {
        stores: 'Stores in scope',
        dailyFootfall: 'Average daily visitors per store',
        machinesPerStore: 'Machines per store',
      },
      outputs: {
        containers: 'Containers recovered per month',
        tonnage: 'Material recovered per month',
        benefit: 'Estimated benefit to you per month',
      },
      /** Permanent and non-dismissible. Not a toast, not a tooltip. */
      disclaimer:
        'These outputs are estimates produced by a model, not a quotation and not a forecast. They are only as good as the assumptions listed below, and they carry no commercial commitment.',
      assumptionsHeading: 'Assumptions in this model',
      assumptions: [
        'Every visitor is counted once per day, and a fixed share of visitors deposits containers.',
        'Deposits cannot exceed what the machines on site can physically accept, so throughput caps the result.',
        'The split between PET and aluminium is treated as constant across all sites.',
        'Container mass is an average over the size mix actually returned, not a single container size.',
        'Material value is a spot price per tonne and is volatile; the benefit range does not model that volatility.',
        'Your benefit is a share of recovered material value only. Redemption in store, footfall effects and compliance value are excluded — they are real, and none of them is measured yet.',
        'No capital cost, operating cost or price appears here. Commercial terms are a conversation, not a calculator.',
      ],
      unavailableHeading: 'This calculator cannot produce a number yet',
      unavailableBody:
        'The coefficients below have not been measured. Rather than fill them with plausible values, the model reports that it cannot compute. Every input above still works, and the moment a pilot supplies these figures the outputs appear.',
      throughputNote:
        'At these settings machine throughput is the limit, not footfall — additional visitors would not add containers.',
    },

    pilot: {
      heading: 'Request a pilot',
      intro:
        'One site, a defined review period, and a written assessment at the end of it. No price, no commitment on this page — a pilot conversation.',
      progressiveSummary: 'Add role and city (optional)',
      fields: {
        company: 'Chain or company',
        email: 'Work email',
        stores: 'Number of stores',
        role: 'Your role',
        city: 'City',
      },
      submit: 'Request a pilot',
      /**
       * There is no submission destination configured yet. The form validates
       * properly and says so plainly rather than pretending to have sent.
       */
      unconfigured:
        'This form has no destination configured yet, so nothing was sent. Your details were validated but not stored.',
      validationFailed: 'Check the highlighted fields.',
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

  /**
   * /impact — recovery, stated as measurement rather than sentiment.
   *
   * No trees, globes or droplets anywhere: material is represented as material.
   * Every figure carries its unit and the period it covers, because a number
   * without a basis is decoration.
   */
  impact: {
    hero: {
      eyebrow: 'Impact',
      headline: 'Material recovered, and how we know.',
      subhead:
        'Impact here means tonnes of PET and aluminium that went back into material rather than to landfill, counted per container at the machine. Every figure below states its unit and the period it covers. Anything not yet measured shows as a dash rather than as a number.',
    },

    counters: {
      heading: 'Recovery to date',
      intro:
        'Cumulative totals from machine telemetry. A figure animates only once it has been measured and has a stated period — until then it is a dash.',
      ids: [
        'containers-collected-to-date',
        'material-recovered-to-date',
        'machines-deployed',
        'depositor-value-returned',
      ],
    },

    flow: {
      heading: 'Where Egypt’s PET actually goes',
      intro:
        'The gap this business addresses is not between consumption and recycling — it is between consumption and FORMAL recovery. Informal collectors already recover a large share, and leaving them out of the picture would overstate the problem and misrepresent the market.',
      title: 'Egypt PET material flow: consumed against destination',
      totalPrefix: 'Total annual consumption:',
      sourcePrefix: 'Source:',
      unsourcedHeading: 'Chart not drawn — no public source',
      unsourcedBody:
        'The structure of the flow is shown, but not the proportions. Drawing magnitudes without a public source for every band would produce a chart that reads as authoritative and is not. Each band needs a figure from the same study and the same year — mixing sources is how a flow chart ends up looking right and being wrong.',
      unsourcedDescription:
        'Structure of the Egypt PET material flow: consumption divides into formally collected, informally collected and uncollected. Proportions are not shown because no public source has been supplied.',
      mismatchHeading: 'Chart not drawn — bands do not reconcile',
      mismatchBody:
        'The three destinations do not sum to total consumption within tolerance, which means at least one figure comes from a different study, a different year or a different definition. The chart refuses to draw rather than hide the discrepancy behind rounding.',
    },

    methodology: {
      heading: 'How we calculate recovered tonnage',
      intro:
        'Short version: we count containers, not bags. Tonnage is derived from counted containers and weighed collections, and the two are reconciled.',
      steps: [
        {
          heading: 'Count at the point of acceptance',
          body: 'Every accepted container is counted by the machine at the moment it is validated, by material stream. Rejected containers are not counted. This is a count of objects, not an estimate from volume.',
        },
        {
          heading: 'Weigh at collection',
          body: 'Each collection is weighed by stream when it leaves the site. That gives an actual mass, independent of the container count.',
        },
        {
          heading: 'Reconcile the two',
          body: 'Counted containers multiplied by the average container mass for that stream should agree with the weighed mass. Where they diverge, the weighed mass is authoritative and the average mass is corrected — not the other way round.',
        },
        {
          heading: 'Report the weighed figure',
          body: 'Published tonnage is weighed mass, not modelled mass. Contamination and moisture are part of the weighed figure until material is sorted at the processing centre, so the reported figure is conservative rather than flattering.',
        },
      ],
      exclusions: {
        heading: 'What is deliberately excluded',
        items: [
          'No avoided-emissions figure is published without a stated methodology and a source. A CO₂e number is a calculation, not a measurement, and it inherits every assumption behind it.',
          'No claim is made about material that leaves our custody. We report what we recovered and sold, not what a reprocessor ultimately did with it.',
          'Containers rejected by the machine are excluded entirely, even though a depositor carried them in.',
        ],
      },
    },
  },

  /**
   * /investors — the PUBLIC page. Qualitative and directional only.
   *
   * Hard rules encoded in this copy:
   * - No projected returns, no valuation, no multiples, no raise size.
   * - No "invest now" language. The ask is data room access, reviewed manually.
   * - Revenue lines are described as mechanisms, never quantified here.
   * - Market figures are not written into this copy at all. They render from
   *   facts.ts only when a fact carries a named public source, so an unsourced
   *   statistic cannot reach this page through prose.
   */
  investorsPublic: {
    hero: {
      eyebrow: 'For investors',
      headline: 'Deposit infrastructure, built before the mandate arrives.',
      /** The thesis, in three sentences. No more. */
      thesis: [
        'PET and aluminium enter Egypt in volume and are recovered at a fraction of the rate, because collection depends on informal channels rather than infrastructure.',
        'Retail is where those containers are already carried in and out every day, which makes a store entrance the cheapest place to intercept them.',
        'Regulation is moving toward producer responsibility across the region, and the operators holding retail siting agreements and collection routes when it lands are the ones who can serve it.',
      ],
    },

    market: {
      heading: 'Market context',
      intro:
        'Four figures matter here, and each appears only when it carries a named public source. Anything unsourced is absent from this page rather than shown with a caveat.',
      /** Rendered through SourcedFigure — omitted entirely when unsourced. */
      figures: [
        'egypt-annual-pet-consumption',
        'egypt-pet-collection-rate',
        'egypt-aluminium-collection-rate',
        'egypt-regulatory-direction',
      ],
      /** Shown in place of the figures while none are citable. Not a caveat on a number — a statement that there is no number. */
      pendingHeading: 'No sourced market figures are published yet',
      pendingBody:
        'The figures for this section have not been tied to a named public source. Rather than publish them with a hedge, they are withheld until each one cites the instrument or dataset it comes from. The full market analysis, with its sources, is in the data room.',
      regulatoryNote:
        'Direction of travel, not a prediction: Egypt legislated a framework for waste management in 2020, and producer-responsibility instruments across MENA have followed the same pattern. We do not model a mandate date, and nothing on this page depends on one arriving.',
    },

    model: {
      heading: 'How a machine makes money',
      intro:
        'Four revenue lines. Described as mechanisms only — no figures appear on this page, and the unit economics are in the data room.',
      lines: [
        {
          heading: 'Retailer contract',
          body: 'The site pays for placement and service, or takes a share of recovered material value, depending on the deal. Either way the machine is contracted per site rather than sold as hardware.',
        },
        {
          heading: 'Material sale',
          body: 'Baled PET and aluminium are sold to reprocessors. Separation quality upstream sets the price, which is why sorting happens before compaction rather than after.',
        },
        {
          heading: 'Brand sponsorship',
          body: 'A machine at a store entrance is a branded surface with a measurable interaction count, and beverage producers facing producer-responsibility obligations have a reason to fund collection directly.',
        },
        {
          heading: 'Data',
          body: 'Every accepted container is a counted, located, time-stamped return by material and by product. That record is what a producer needs to evidence recovery, and it is the line with the lowest marginal cost.',
        },
      ],
      note: 'Which lines carry the model, in what proportion, and at what cost is exactly the question the data room answers. It is not answered here.',
    },

    traction: {
      heading: 'Where we actually are',
      intro:
        'Stated conservatively and stage-appropriately. Built, signed and deployed are separate counts and are kept separate; an unmeasured figure is shown as unmeasured rather than rounded up.',
      figures: [
        'company-stage',
        'machines-built',
        'machines-deployed',
        'pilots-signed',
        'lois-signed',
      ],
      note: 'A letter of intent is not a pilot and a pilot is not a rollout. Conflating them is the most common way an early company overstates itself, so these are counted separately here.',
    },

    team: {
      heading: 'Team',
      intro: 'Real names and real current roles only.',
      /** Rendered when TEAM is empty. Honest, and obviously incomplete. */
      pendingHeading: 'Team details are not published yet',
      pendingBody:
        'No names or roles have been supplied for publication. An investor will verify every person listed on a page like this, so nothing is listed until it is accurate and the individuals have agreed to appear. Team and background are covered in the data room.',
    },

    cta: {
      heading: 'Request data room access',
      body: 'Access is reviewed and granted manually. Requests are not approved automatically, and submitting this form does not create any commitment on either side.',
    },
  },

  /**
   * The gated data room request.
   *
   * The declaration text is a legal representation, so it is a marked
   * PLACEHOLDER on the same footing as the disclaimer: a lawyer writes it.
   */
  dataRoomRequest: {
    heading: 'Request data room access',
    intro:
      'Six details and one declaration. Requests are reviewed by a person; nothing is granted on submission.',
    fields: {
      name: 'Full name',
      organisation: 'Organisation',
      role: 'Role',
      investorType: 'Investor type',
      country: 'Country',
      email: 'Work email',
      linkedin: 'LinkedIn profile',
    },
    investorTypes: ['Angel', 'Venture capital', 'Family office', 'Strategic', 'Other'],
    investorTypePrompt: 'Select investor type',
    declaration: {
      /**
       * PLACEHOLDER — NOT FINAL. Must be written by a qualified lawyer in the
       * relevant jurisdictions before this form is used with real requesters.
       * Deliberately not drafted here: a self-certification of investor status
       * has legal effect and the wording carries the risk.
       */
      label:
        'PLACEHOLDER — LAWYER TO DRAFT: a self-declaration that the requester is a professional or qualified investor, and that they understand these materials are not an offer of securities.',
      requiredError: 'You must confirm the declaration to request access.',
    },
    submit: 'Request access',
    pending: {
      heading: 'Request lodged',
      body: 'Your request has been recorded and our team has been notified. Access is granted manually — you will receive a time-limited link by email if it is approved. Nothing has been granted by submitting this form.',
    },
    failure: {
      heading: 'Request could not be lodged',
      body: 'Nothing was recorded, so please do not treat this as submitted. The request store is not configured in this environment.',
    },
    validationFailed: 'Check the highlighted fields.',
  },

  /**
   * GDPR consent.
   *
   * One purpose per form, stated in the sentence itself: consent to be replied
   * to about THIS request. Not a marketing opt-in wearing a reply's clothes —
   * bundling the two is what makes a consent record worthless, because it stops
   * being clear what the person agreed to.
   *
   * Unticked by default and required. `CONSENT_VERSION` in
   * src/lib/forms/schemas.ts is stored with every submission alongside this
   * text, so a record always says which wording its owner actually saw.
   *
   * STILL NEEDED FROM A DPO: the retention period, the lawful basis stated on
   * the privacy page, and confirmation that consent is the right basis here
   * rather than legitimate interest for a B2B enquiry. The wording below is
   * plain-language product copy, not legal advice.
   */
  consent: {
    pilot:
      'Green Exchange may use these details to reply to this pilot request and arrange a site assessment.',
    dataRoom:
      'Green Exchange may use these details to review this request and reply about data room access.',
    privacyLinkText: 'How we handle your details',
    privacyHref: '/legal/privacy',
  },

  /**
   * What a refused submission says.
   *
   * Every branch ends with a way to reach us, because the one outcome this site
   * cannot afford is a lead that reaches nobody and knows it reached nobody.
   */
  formFailure: {
    delivery: {
      heading: 'This did not send',
      body: 'Nothing was recorded, so please do not treat this as submitted. Email us directly and we will pick it up from there.',
    },
    rateLimited: {
      heading: 'Too many submissions from this connection',
      body: 'Wait and try again, or email us directly if this is urgent.',
    },
    stale: {
      heading: 'This page has been open too long',
      body: 'Reload the page and submit again — your details are still in the fields below. Nothing was sent.',
    },
    suspectedBot: {
      heading: 'This submission was blocked',
      body: 'An automated-submission check rejected this. If you are a person, email us directly and we will handle it that way.',
    },
    /** Rendered where the contact address is unknown, rather than a bare dash. */
    fallbackUnknown: 'A direct contact address has not been published yet.',
    /** Development only. Never shown to a visitor. */
    fallbackUnknownHint: 'Set contact-email in content/facts.ts.',
    fallbackPrefix: 'Email us directly:',
  },

  /**
   * Success pages. Real routes, not a toast.
   *
   * Each one answers the two questions a person actually has after submitting:
   * what happens now, and by when. The "by when" is a fact, not a sentence
   * written here — see pilot-response-time and data-room-review-time in
   * content/facts.ts. Until those carry real values the build gate blocks a
   * production deploy, which is the intended behaviour: a response commitment
   * is a promise the company makes, not one this file invents.
   */
  received: {
    pilot: {
      eyebrow: 'Pilot request received',
      heading: 'We have your request.',
      referenceLabel: 'Your reference',
      referenceNote: 'Quote this if you follow up.',
      nextHeading: 'What happens next',
      steps: [
        {
          heading: 'We read it and come back to you',
          body: 'A person reviews the request and replies to the address you gave, to confirm we have it and to ask anything missing about the site.',
        },
        {
          heading: 'Site assessment',
          body: 'We look at the entrance or car park you have in mind: siting, power, connectivity and collection access. This can start as a call and a photo of the doorway.',
        },
        {
          heading: 'Install plan for one named store',
          body: 'You get a written plan for a single site — placement, servicing rota, and what we need from your team — before anything is committed.',
        },
      ],
      responseLabel: 'Response time',
      changedYourMind:
        'If you need to correct anything you sent, reply to the confirmation email or write to us directly.',
    },
    dataRoom: {
      eyebrow: 'Request lodged',
      heading: 'Your request is with us.',
      referenceLabel: 'Your reference',
      referenceNote: 'Quote this if you follow up.',
      nextHeading: 'What happens next',
      steps: [
        {
          heading: 'A person reviews the request',
          body: 'Requests are reviewed individually against who is asking and why. Nothing is granted automatically, and submitting this form has granted nothing.',
        },
        {
          heading: 'We reply either way',
          body: 'You get an answer whether or not access is granted. A decision not to open the data room is not a silence.',
        },
        {
          heading: 'Access, if granted, is a time-limited link',
          body: 'Approved requesters receive a signed link to the materials that expires. It is issued to you by name and is not transferable.',
        },
      ],
      responseLabel: 'Review time',
      notGranted: 'Access has not been granted by this submission.',
    },
  },

  /**
   * Persistent investor disclaimer.
   *
   * PLACEHOLDER ONLY. `scripts/check-legal.ts` fails a production build while
   * this marker is present, so it cannot ship as final by accident.
   */
  investorDisclaimer: {
    marker: 'LEGAL-PLACEHOLDER-DO-NOT-SHIP',
    heading: 'Placeholder disclaimer — not legal text',
    body: 'This block is a placeholder for a disclaimer to be drafted by a qualified lawyer covering, at minimum: that nothing on these pages is an offer or solicitation to buy or sell securities, the jurisdictions in which the materials may be received, forward-looking-statement language, and the basis on which any figure is presented. It has deliberately not been drafted in-house. The production build fails while this placeholder is in place.',
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
