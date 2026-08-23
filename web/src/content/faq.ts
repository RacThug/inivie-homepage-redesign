/**
 * Frequently asked questions.
 *
 * Production's own nine pairs, taken from the `FAQPage` structured data its
 * homepage already publishes, so the answers here are the answers a search
 * engine is being told.
 *
 * One correction, per the brief ch. 4A: production writes "Ini Vie" in every
 * one of these answers and "iNi ViE" everywhere else on the same page. This
 * redesign uses one spelling in every position, including inside quoted FAQ
 * copy, because a brand that cannot spell itself consistently on its own
 * homepage is the smallest and most visible kind of carelessness.
 */

export interface FaqEntry {
  readonly question: string;
  readonly answer: string;
}

export const FAQ = {
  eyebrow: "Good to Know",
  heading: "Frequently asked questions",
  entries: [
    {
      question: "What is iNi ViE Hospitality?",
      answer:
        "iNi ViE Hospitality is a leading Bali-based hospitality management company specializing in luxury villas, resorts, and restaurants. We are renowned for our Instagrammable designs, intimate service, and modern lifestyle concepts.",
    },
    {
      question: "Where are iNi ViE Hospitality properties located?",
      answer:
        "Our properties are situated in Bali's most sought-after locations, including Ubud, Canggu, Seminyak, Legian, Sanur, and Jimbaran. Each property is uniquely designed to reflect the local character of its surroundings.",
    },
    {
      question: "How can I get the best rates for a reservation?",
      answer:
        "To secure the best rates and access exclusive offers, guests are encouraged to book directly through our official property websites or contact our central reservations team via WhatsApp.",
    },
    {
      question:
        "Do you offer special packages for honeymoons or anniversaries?",
      answer:
        "Yes, we are specialists in creating romantic moments. We offer various add-on packages such as romantic flower decorations for the bed or pool, floating breakfasts, and private candlelight dinners.",
    },
    {
      question: "Does iNi ViE Hospitality provide airport transfer services?",
      answer:
        "We offer airport transportation services for an additional fee. Guests may request this service during the booking process or by contacting the villa staff at least 24 hours prior to arrival.",
    },
    {
      question: "Do all villas feature a private pool?",
      answer:
        "The majority of villa units managed by iNi ViE Hospitality are equipped with private pools to ensure maximum privacy and comfort for every guest.",
    },
    {
      question: "What in-room entertainment facilities are available?",
      answer:
        "To support modern comfort, most of our properties are equipped with smart technology, including smart speakers (Alexa), Netflix access, and high-speed Wi-Fi.",
    },
    {
      question: "Can non-staying guests dine at iNi ViE restaurants?",
      answer:
        "Certainly. We manage several popular restaurants across Bali that are open to the public. Guests can enjoy a variety of culinary experiences, ranging from authentic local dishes to international cuisine.",
    },
    {
      question: "Are Spa services available in-villa?",
      answer:
        "Yes, we provide professional massage and spa treatments that can be performed directly within the villa, allowing guests to relax without leaving the comfort of their room.",
    },
  ] as readonly FaqEntry[],
} as const;
