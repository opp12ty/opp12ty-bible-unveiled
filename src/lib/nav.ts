export interface NavItem { href: string; label: string; desc: string; flag?: "ai" | "community" | "vault" }
export interface NavGroup { id: string; label: string; items: NavItem[] }

/** One navigation model feeds the header, the mobile menu, the Explore hub and the sitemap. */
export const NAV: NavGroup[] = [
  { id: "investigate", label: "Investigate", items: [
    { href: "/investigations", label: "Bible Detective", desc: "Structured case files with evidence and competing explanations" },
    { href: "/oddity-vault", label: "Oddity Vault", desc: "Curious questions about daily life in the biblical world" },
    { href: "/belief-check", label: "Popular Belief Check", desc: "Did the Bible actually say that?" },
    { href: "/interpretations", label: "Interpretation Arena", desc: "Competing readings and textual differences side by side" },
    { href: "/silence", label: "Silence Explorer", desc: "What the text says, implies, and leaves unknown" },
    { href: "/wait-what", label: "Wait… What?", desc: "Reveal-by-reveal surprising findings" },
    { href: "/surprise", label: "Surprise Me", desc: "A random discovery, matched to your interests" },
  ] },
  { id: "evidence", label: "Evidence", items: [
    { href: "/evidence-lab", label: "Evidence Lab", desc: "How claims are classified, with every limit stated" },
    { href: "/archaeology", label: "Archaeology Explorer", desc: "What was found, how it was dated, what is inferred" },
    { href: "/manuscripts", label: "Manuscripts", desc: "Scrolls, codices and papyri" },
    { href: "/objects", label: "Object Detective", desc: "What is this? Guess first, then reveal" },
    { href: "/sources", label: "Source Library", desc: "Every source cited on the platform" },
  ] },
  { id: "world", label: "Ancient World", items: [
    { href: "/map", label: "Interactive Map", desc: "Places with how securely each is located" },
    { href: "/timeline", label: "Timeline", desc: "Events across Israel, Egypt, Mesopotamia, Persia, Greece and Rome" },
    { href: "/ancient-world", label: "Civilisations", desc: "The empires and peoples around the Bible" },
    { href: "/people", label: "People", desc: "Figures and what is known of them outside the Bible" },
    { href: "/places", label: "Places", desc: "Cities and sites" },
    { href: "/graph", label: "Knowledge Graph", desc: "Follow connections between people, places, texts and finds" },
  ] },
  { id: "scripture", label: "Scripture", items: [
    { href: "/bible", label: "Scripture Reader", desc: "KJV with Strong's numbers, BSB, ASV, Hebrew and Greek" },
    { href: "/bible/search", label: "Search Scripture", desc: "Concordance search with phrase and wildcard support" },
    { href: "/bible/strongs", label: "Original Languages", desc: "Hebrew and Greek lexicon with every occurrence" },
  ] },
  { id: "learn", label: "Learn", items: [
    { href: "/ai", label: "Unveiled AI", desc: "Source-grounded research assistant", flag: "ai" },
    { href: "/journeys", label: "Learning Journeys", desc: "Guided paths through the material" },
    { href: "/quizzes", label: "Quizzes & Quests", desc: "Test what you have learned" },
    { href: "/questions", label: "Global Questions", desc: "Ask and vote on questions people are afraid to ask", flag: "community" },
    { href: "/journey", label: "My Journey", desc: "Your progress, notes, saved items and level" },
  ] },
  { id: "more", label: "More", items: [
    { href: "/vault", label: "The Vault", desc: "Premium investigations and study collections", flag: "vault" },
    { href: "/pricing", label: "Membership", desc: "Plans and what each includes" },
    { href: "/method", label: "Methodology", desc: "How we select sources, label evidence and use AI" },
    { href: "/help", label: "Help & Support", desc: "FAQ, installing the app, accessibility, reporting errors" },
  ] },
];
