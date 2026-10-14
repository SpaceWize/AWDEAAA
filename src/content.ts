/*
 * ============================================================================
 *  AWDEA SITE WORDING  -  edit the words on the website from this one file
 * ============================================================================
 *
 *  HOW TO EDIT SAFELY
 *  1. Change ONLY the words between the quote marks. Leave everything else
 *     (the names on the left of the colons, commas, brackets, braces) alone.
 *  2. Every piece of text sits inside straight double quotes: "like this".
 *     Inside the quotes you can type almost anything, including apostrophes
 *     (it's, James’s) - both the straight ' and the curly ’ are fine.
 *     The one thing you must NOT type inside the text is a straight double
 *     quote ". If you want quotation marks around a word, use the curly
 *     ones instead: “yes”.
 *  3. Keep the quote mark at the start and end of each piece of text, and keep
 *     the comma at the end of the line.
 *  4. To add another paragraph, donor or team member, copy a whole existing
 *     { ... }, entry or "...", line, paste it below, and change the words.
 *  5. Some sentences are cut into pieces because part of them is styled
 *     (for example the underlined “free and discounted tickets”). The pieces
 *     are named before / highlight / after and are joined back together in
 *     that order on the page. Keep the spaces at the edges of the pieces
 *     exactly as they are, so words do not run together.
 *  6. A few messages contain {n}, {total}, {number}, {name}, {title} or
 *     {timezone}. The website replaces those with the real value. Leave them
 *     exactly as written.
 *  7. If a phone number or email changes, change it in the "contact" group
 *     AND search this file for the old one: it also appears inside a few
 *     sentences (the “couldn’t load” messages).
 *
 *  IF SOMETHING GOES WRONG
 *  A typing slip (for example a missing quote mark) stops the website from
 *  being rebuilt. When that happens the previous version of the site simply
 *  stays live, nothing breaks for visitors, and you can fix the file and save
 *  again.
 *
 *  Image descriptions (the “alt” and “label” lines) are read aloud to people
 *  using screen readers. Edit these descriptions in the AWDEA Gallery Google 
 *  Drive folder directly to prevent any unwanted bugs.
 * ============================================================================
 */

export const content = {
  // ---------------------------------------------------------------------
  // Contact details. Used in the footer (every page) and on the Donate page.
  // ---------------------------------------------------------------------
  contact: {
    phone: "604-837-5616",
    email: "james@awdea.org",
    address: "605-125 20th St. E, North Vancouver V7L 3A3",
  },

  // ---------------------------------------------------------------------
  // Browser tab titles, and the “… page loaded” announcement for screen
  // readers when someone moves to another page.
  // ---------------------------------------------------------------------
  pages: {
    home: { title: "AWDEA — Accessible Entertainment for All", name: "Home" },
    team: { title: "Our Team — AWDEA", name: "Our team" },
    gallery: { title: "Gallery — AWDEA", name: "Gallery" },
    account: { title: "Your account — AWDEA", name: "Your account" },
    donate: { title: "How to Donate — AWDEA", name: "How to donate" },
    donors: { title: "Our Donors — AWDEA", name: "Our donors" },
    notFound: { title: "Page not found — AWDEA", name: "Page not found" },
    loadedAnnouncement: "{name} page loaded",
  },

  // ---------------------------------------------------------------------
  // On every page: hidden “skip” link at the very top, and the round
  // “back to top” button.
  // ---------------------------------------------------------------------
  site: {
    skipLink: "Skip to main content",
    backToTop: "Back to top",
  },

  // ---------------------------------------------------------------------
  // Top menu bar (every page)
  // ---------------------------------------------------------------------
  nav: {
    logoAlt: "AWDEA home",
    tagline: "Entertainment Access",
    mainMenuLabel: "Main menu",
    mobileMenuLabel: "Mobile menu",
    openMenuLabel: "Open main menu",
    closeMenuLabel: "Close main menu",
    // The order here is the order of the links in the menu.
    links: [
      { label: "About Us", to: "/" },
      { label: "Gallery", to: "/gallery" },
      { label: "Our Team", to: "/bios" },
      { label: "Donors", to: "/donors" },
      { label: "My account", to: "/account" },
    ],
    donateButton: "Donate",
  },

  // ---------------------------------------------------------------------
  // Home page > the big opening section at the top
  // ---------------------------------------------------------------------
  hero: {
    eyebrow: "Adults With Disabilities Entertainment Access",
    // The three words of the headline, in order. The page puts a space
    // between them and adds the purple highlight to the last one.
    headlineWords: ["Entertainment", "without", "exclusion."],
    paragraph:
      "We connect disabled adults across British Columbia with free and discounted tickets to concerts, festivals, and sporting events.",
    //ACTUAL TEXT:
    //We connect disabled adults across British Columbia with free and discounted tickets to concerts, festivals, and sporting events.
    primaryButton: "Support our mission",
    secondaryButton: "See how it works",
    scrollHint: "Scroll to explore",
  },

  home: {
    // -------------------------------------------------------------------
    // Home page > What we are about
    // -------------------------------------------------------------------
    about: {
      videoLabel:
        "People seated together in an accessible seating area at a live event, talking and smiling",
      heading: "What we are about",
      paragraph:
        "AWDEA was conceptualized by James Willetts, a quadriplegic, who recognized that many in the disabled community are shut out of the entertainment happening all around them. We exist to close that gap.",
      button: "Meet our team",
    },

    // -------------------------------------------------------------------
    // Home page > What we offer (dark purple section)
    // -------------------------------------------------------------------
    offer: {
      heading: "What we offer",
      // One sentence in three pieces; the middle piece is underlined.
      introBefore: "Register with AWDEA and you can win ",
      introHighlight: "free and discounted tickets",
      introAfter: " to entertainment events near you.",
      cards: [
        {
          title: "Concerts",
          body: "Live music from local venues to arena headliners.",
        },
        {
          title: "Festivals",
          body: "Seasonal and cultural festivals across the Lower Mainland.",
        },
        {
          title: "Sporting Events",
          body: "Games and matches with accessible seating arrangements.",
        },
      ],
      button: "Help fund a ticket",
    },

    // -------------------------------------------------------------------
    // Home page > Get involved
    // -------------------------------------------------------------------
    getInvolved: {
      heading: "Get involved",
      paragraph:
        "Support our mission by donating tickets, making a financial contribution, or simply spreading the word.",
      button: "How to donate",
    },

    // -------------------------------------------------------------------
    // Home page > Accessible venues
    // -------------------------------------------------------------------
    venues: {
      videoLabel:
        "A wheelchair user propelling themselves along a wooden boardwalk, gloved hand gripping the wheel rim",
      heading: "Accessible venues",
      paragraph:
        "Exploring accessible venues and locations for disabled adults opens up a world of inclusive opportunity.",
    },
  },

  // ---------------------------------------------------------------------
  // Home page > How it works
  // ---------------------------------------------------------------------
  howItWorks: {
    eyebrow: "Coming soon",
    heading: "How it works",
    intro: "Four steps between you and a night out.",
    // Read aloud before each step title, e.g. “Step 2 of 4: ”.
    stepAnnouncement: "Step {number} of {total}: ",
    // The big number in the circle is the step's "num". "note" is optional
    // small print under a step; leave it as "" (empty quotes) for none.
    steps: [
      {
        num: "01",
        title: "Sign Up",
        description: "Create your free AWDEA account.",
        note: "Eligibility is restricted to disabled adults aged 19+.",
      },
      {
        num: "02",
        title: "Register for an Event",
        description: "Browse what's available on the Raffle Events page and enter.",
        note: "",
      },
      {
        num: "03",
        title: "Wait for the Raffle",
        description: "Draws happen two weeks before each event date.",
        note: "",
      },
      {
        num: "04",
        title: "Receive Your Tickets",
        description:
          "Winners get an email with their tickets roughly two weeks before the event.",
        note: "",
      },
    ],
  },

  // ---------------------------------------------------------------------
  // Home page > Upcoming events (the list itself comes from the Google
  // Calendar; this is only the wording around it)
  // ---------------------------------------------------------------------
  events: {
    heading: "Upcoming events",
    intro: "Draws happen two weeks before each event date. All times are Pacific.",
    // Hidden messages read aloud by screen readers.
    loadingAnnouncement: "Loading upcoming events.",
    countOne: "{n} upcoming event listed.",
    countMany: "{n} upcoming events listed.",
    errorAnnouncement: "Upcoming events could not be loaded.",
    timezoneAnnouncement: "All event times are in the {timezone} timezone.",
    loading: "Loading upcoming events…",
    errorHeading: "We couldn’t load the events list just now.",
    errorBody:
      "Please try again shortly, or call 604-837-5616 and we’ll tell you what’s coming up.",
    empty: "No events are scheduled at the moment. Check back soon.",
    sampleNotice:
      "Example events — these are placeholders until AWDEA’s calendar is connected.",
    addToCalendar: "Add to my calendar",
    // Read aloud for the “Add to my calendar” link; {title} is the event name.
    addToCalendarFull: "Add {title} to my calendar (opens in a new tab)",
  },

  // ---------------------------------------------------------------------
  // Gallery page (the photographs themselves come from Google Drive)
  // ---------------------------------------------------------------------
  gallery: {
    eyebrow: "Gallery",
    heading: "Nights out, together.",
    intro:
      "Photographs from events our members have been to. Each one is shown in full — select any photo to see it larger.",
    photosHeading: "Photographs",
    loadingAnnouncement: "Loading photographs.",
    countOne: "{n} photograph shown.",
    countMany: "{n} photographs shown.",
    errorAnnouncement: "Photographs could not be loaded.",
    loading: "Loading photographs…",
    errorHeading: "We couldn’t load the photographs just now.",
    errorBody:
      "Please try again shortly, or call 604-837-5616 if you need anything from this page.",
    empty: "There are no photographs here yet. Check back soon.",
    // Read aloud on each photo's button, e.g. “Enlarge photograph 3 of 12”.
    enlargeLabel: "Enlarge photograph {n} of {total}",
    // The pop-up with the large photo
    dialogLabel: "Enlarged photograph",
    noDescription: "No description has been added for this photograph.",
    previous: "Previous photograph",
    next: "Next photograph",
    close: "Close",
  },

  // ---------------------------------------------------------------------
  // Our Team page. Each person is one { ... }, entry; each paragraph of
  // their story is one "...", line. People appear in this order, and the
  // photo switches sides automatically.
  // ---------------------------------------------------------------------
  team: {
    eyebrow: "About us",
    heading: "Our team",
    intro:
      "AWDEA was founded and is run by people with lived experience of disability — and a shared love of live entertainment.",
    members: [
      {
        name: "James Willetts",
        role: "Founder",
        photo: "https://awdea.org/james_biopic.jpeg",
        photoAlt: "James Willetts",
        paragraphs: [
          "Our founder, James Willetts, grew up in Edmonton, Alberta. He played competitive hockey until a knee injury ended that dream. He has always loved live music, entertainment, and professional sports, and once camped out for two nights to get tickets to the 40th NHL All-Star Game in Edmonton! James apprenticed as a chef and then, in 1996, switched gears to attend Cameron’s Professional Driving School to become a Class One Professional Truck Driver.",
          "After six years of driving, a 2003 accident changed his life’s direction, but that didn’t slow him down. Always seeking adventure, he found like-minded individuals through the BC Mobility Opportunity Society. He hiked with a BCMOS team, who specialize in accessible outdoor activities, up Mount Steele on the Sunshine Coast. Working with BCMOS, James thought that flying in an unpowered aircraft would be fun. He enjoyed it so much that he became a Coordinator with the Vancouver Soaring Association for six years, planning flights and encouraging people with disabilities to experience the thrill of gliding.",
          "In his free time, James loves attending concerts and sporting events (300 and counting!) Recognizing that ticket prices can be prohibitive, especially for those with disabilities on low incomes, James created AWDEA. Helping people with disabilities experience new sights and sounds has now become his passion and driving force.",
        ],
      },
      {
        name: "Chris Jacinto",
        role: "Director",
        photo: "https://awdea.org/chris_biopic.jpeg",
        photoAlt: "Chris Jacinto",
        paragraphs: [
          "Chris was raised in the interior of British Columbia, where he developed a love for outdoor activities and competitive sports. Passionate about music and entertainment, he and a group of friends began hosting and producing numerous events and shows. He also started studying business at Selkirk College in Castlegar.",
          "In 1997, he was involved in a motor vehicle accident that left him a quadriplegic. After intensive rehab, he chose to settle in North Vancouver. Soon after, he attended Capilano University and earned his Bachelor of Business Administration. Following his studies, he became HR Manager at Northview Golf and Country Club in Langley, a position he held for seven years before resigning due to health concerns. Over the past 20 years, he has served in various roles on the Board of Directors for the North Shore Housing Co-op.",
          "Chris enjoys attending entertainment and sports events. He is dedicated to giving others the opportunity to attend these events and enhance their psychological, social, and emotional well-being.",
        ],
      },
      {
        name: "Stephen Rogers",
        role: "Founding Director",
        photo: "https://awdea.org/steve.jpg",
        photoAlt: "Stephen Rogers",
        paragraphs: [
          "Stephen was born in Kitimat, BC, and had the opportunity to live in Quebec, Australia, Ontario, and British Columbia due to his father’s work. Although he injured his spinal cord in two different places during separate car accidents in 1983 and 2000, he feels very fortunate to still be able to walk. Stephen’s passion for food led him to pursue a culinary career, completing a three-year apprenticeship in 1990. He also has a deep love of music and played in a few bands during his younger years. In 2006, he earned certification as a life skills coach.",
          "In 2008, Stephen’s sister, who is also disabled, fell ill, and he stepped up to become her caregiver. Since then, he has worked with many individuals with disabilities.",
          "He heard about James’s idea for a non-profit organization at the start of 2023, and his personal encouragement had a big impact on James. Stephen knows firsthand the challenges that people with disabilities face when attending entertainment events, so when asked to join AWDEA as a founding director, he said “yes” and offered to help.",
        ],
      },
    ],
    // Dark purple section at the bottom of the page
    callToAction: {
      heading: "Want to help us grow?",
      paragraph:
        "Donate tickets or contribute financially so more disabled adults can get out to the events they love.",
      button: "How to donate",
    },
  },

  // ---------------------------------------------------------------------
  // Donate page
  // ---------------------------------------------------------------------
  donate: {
    // Top section
    eyebrow: "Join us",
    heading: "Promoting inclusivity and joy with your help",
    intro:
      "Your donation removes the barriers that keep disabled adults out of the events the rest of us take for granted.",
    imagePlaceholder: "Photo to come — AWDEA guests enjoying an event",
    // Your donation matters
    matters: {
      heading: "Your donation matters",
      paragraphs: [
        "At AWDEA, we believe in a world where everyone, regardless of their abilities, has the opportunity to experience the joy and community spirit of public events and activities. Our initiative aims to provide free tickets to disabled individuals, allowing them to enjoy concerts, art exhibitions, sports games, and more, alongside their friends and families.",
        "Many individuals with disabilities face barriers that prevent them from participating in events that many of us take for granted. These can range from financial constraints to logistical challenges. Your donation helps us remove these barriers by covering the costs of tickets, ensuring everyone has an equal chance to enjoy these experiences.",
      ],
    },
    // How you can help (dark purple section, two cards)
    help: {
      heading: "How you can help",
      cards: [
        {
          title: "Make a donation",
          body: "Every contribution, big or small, makes a difference. Whether it's providing a single ticket to a local concert or funding an entire day out for a group, your donation is a step towards inclusivity.",
        },
        {
          title: "Spread the word",
          body: "Help us grow our impact by sharing our mission with your friends, family, and on social media. Awareness is key to our growth and success.",
        },
      ],
    },
    // Donation methods
    methods: {
      heading: "Donation methods",
      paragraph:
        "We are currently accepting donations through Stripe. All proceeds will be donated to AWDEA and used for providing tickets to accessible events for adults with disabilities.",
      stripeButton: "Donate through Stripe",
      stripeLink: "https://buy.stripe.com/cN215g7UG1ip7UA144",
      ticketsHeading: "Donating tickets",
      ticketsParagraph:
        "Have tickets you can’t use? We’d love to pass them on. Get in touch with James and he’ll take it from there.",
    },
  },

  // ---------------------------------------------------------------------
  // Donors page. The donors list is plain text, so it lives here: add a new
  // donor by copying one { ... }, line to the TOP of the list (newest first).
  // ---------------------------------------------------------------------
  donors: {
    eyebrow: "Our donors",
    heading: "Thank you!",
    intro:
      "Thank you to all our donors for your generous contributions. Each donation helps us make a difference in our community. Your support is vital to our success and is deeply appreciated by everyone impacted by your generosity.",
    listHeading: "Our donors",
    tableCaption: "AWDEA donors, with donation date and amount",
    columnName: "Name",
    columnDate: "Date",
    columnAmount: "Amount / Item",
    list: [
      { name: "Nick", date: "Wed Sep 24 2025", amount: "$50" },
      { name: "Nick", date: "Wed May 14 2025", amount: "$25" },
      { name: "GOODWIN VENTURES CORP", date: "Sat Mar 15 2025", amount: "$500" },
      { name: "Keon Kirby", date: "Wed Jun 12 2024", amount: "$100" },
      { name: "Anonymous donation", date: "Wed May 29 2024", amount: "$1000" },
    ],
    // Dark purple section at the bottom of the page
    callToAction: {
      heading: "Add your name",
      paragraph:
        "Donations of any size go directly towards tickets for disabled adults across the Lower Mainland.",
      button: "How to donate",
    },
  },

  // ---------------------------------------------------------------------
  // Your account page (explanatory text only; form labels, buttons and
  // error messages are not here)
  // ---------------------------------------------------------------------
  account: {
    eyebrow: "Members",
    heading: "Your account",
    intro:
      "Create an account to keep your details with AWDEA. You only need an email address or a phone number, and you can give both.",
    headingSignedIn: "Your details",
    headingSignedOut: "Join AWDEA",
    nameHint:
      "What you would like us to call you. Your full name is fine, and so is a nickname.",
    emailHint: "Optional if you give a phone number.",
    phoneHint: "Optional if you give an email. Include the area code.",
    signInEmailHint: "The email you used when you created your account.",
    signOutHeading: "Sign out",
    signOutText: "Signs this browser out. Your details stay saved on this device.",
    deleteHeading: "Delete my account",
    deleteText:
      "This removes your name, email, phone number and raffle entries from this device. It cannot be undone.",
    deleteConfirm: "Are you sure? Your account and details will be deleted.",
    privacyHeading: "How we look after your details",
    privacyPoints: [
      "We only ask for what we need: a name or username, and an email or phone number.",
      "We do not ask for anything about your disability.",
      "Credit card payments are handled by Stripe. Card details never reach AWDEA.",
      "You can change or delete your details at any time from this page.",
    ],
  },

  // ---------------------------------------------------------------------
  // Bottom of every page (footer)
  // ---------------------------------------------------------------------
  footer: {
    contactHeading: "Contact us",
    aboutHeading: "About us",
    aboutTeamLink: "Our team",
    aboutDonorsLink: "Our donors",
    joinHeading: "Join us",
    joinDonateLink: "Make a donation",
    copyright: "© 2026 AWDEA™",
  },

  // ---------------------------------------------------------------------
  // “Page not found” page (shown for a web address that does not exist)
  // ---------------------------------------------------------------------
  notFound: {
    heading: "Page not found",
    paragraph: "That page doesn’t exist yet.",
    button: "Back to home",
  },
};
