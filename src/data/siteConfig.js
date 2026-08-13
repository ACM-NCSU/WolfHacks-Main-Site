const siteConfig = {
  seo: {
    title: 'WolfHacks: a student hackathon at NC State',
    description:
      'WolfHacks is a fall hackathon at NC State hosted by ACM. Open to all majors and skill levels. Workshops, sponsor networking, free food, and swag. Build a project in 24 hours.',
  },

  social: {
    twitterHandle: 'wolfhacks',
    instagramHandle: 'wolfhacks',
  },

  event: {
    name: 'WolfHacks',
    date: 'Oct 3-4, 2026',
    location: 'Centennial Campus, Raleigh, NC',
    coordinates: '35.7847°N 78.6821°W',
    countdownTarget: '2026-10-03T09:00:00',

    acm: {
      name: 'ACM at NC State',
    },

    // MLH trust badge, same mechanism as the original boilerplate template.
    // year/color "2017"/"white" is the only combo that currently resolves to a
    // real image at MLH's asset host (verified directly). It's their generic
    // demo badge, not tied to a real date. Region "na" is correct for NC State.
    // Swap these once you generate your real badge from MLH's organizer dashboard.
    trustBadge: {
      year: '2017',
      region: 'na',
      color: 'white',
    },

    hero: {
      eyebrowPrefix: 'ACM AT NC STATE',
      headline: 'Build something wild.',
      subhead:
        "WolfHacks is a fall hackathon brought together by ACM at NC State, where students come together to build something in one weekend. It's open to all majors and all skill levels. You'll have access to workshops, sponsor networking, mentors, and yes, free food, swag, and merch. All you have to do is build a project in 24 hours.",
      registerNote:
        "Registration isn't open yet. Fill out this quick form to let us know you're interested, and we'll notify you the moment it goes live.",
      // TODO: replace with your real pre-registration form URL (Google Form, Typeform, etc.)
      preRegisterUrl: 'https://forms.gle/REPLACE-WITH-YOUR-PRE-REG-FORM',
    },

    faq: {
      eyebrow: 'QUESTIONS',
      heading: 'FAQ',
      items: [
        {
          question: 'What is a hackathon?',
          answer:
            "A hackathon is an invention marathon. Students team up to build a software or hardware project over 24 hours, from a blank slate to a working demo. It's very beginner friendly; you don't need to have hackathon experience.",
        },
        {
          question: 'How much does it cost?',
          answer: 'Nothing. Attending WolfHacks is free, including meals for the weekend.',
        },
        {
          question: 'Do I need to be a student to attend?',
          answer:
            'Yes. Any current college or university student, or anyone who has graduated within the past 12 months, is eligible to attend, not just NC State students.',
        },
        {
          question: 'Do I need a team, or experience, to apply?',
          answer:
            'No to both. You can apply solo and form a team at check-in, and total beginners are welcome. There will be workshops and mentors all weekend.',
        },
        {
          question: 'Where is the event?',
          answer:
            'Centennial Campus, NC State University, Raleigh, NC. Exact building and room details go out closer to the event.',
        },
        {
          question: 'Is there a code of conduct?',
          answer:
            'Yes, and we enforce it. A link to the full code of conduct will be posted here before applications open.',
        },
      ],
    },

    registerThanksMessage: "You'll receive more information closer to the hackathon.",
  },
};

export default siteConfig;
