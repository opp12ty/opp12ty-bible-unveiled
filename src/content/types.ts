/**
 * Content model for BIBLE UNVEILED. Everything is plain, typed data so that every claim can be traced to
 * a source id (see sources.ts) and every item can carry an explicit evidence classification and status.
 */

export type EvidenceKind =
  | "scripture" | "original-language" | "history" | "ancient-sources" | "archaeology"
  | "manuscripts" | "scholarship" | "tradition" | "popular-culture" | "speculation";

/** Editorial confidence vocabulary (defined on the methodology page). No numeric "truth scores". */
export type Status = "documented" | "well-supported" | "likely" | "debated" | "unknown";

export type Difficulty = "beginner" | "curious" | "advanced" | "researcher" | "expert" | "open-problem";

export type VisualKind =
  | "authentic-photograph" | "historical-illustration" | "digital-reconstruction"
  | "ai-generated" | "artistic-interpretation" | "schematic-diagram";

export type Kind =
  | "investigations" | "oddity-vault" | "belief-check" | "interpretations" | "silence"
  | "people" | "places" | "archaeology" | "manuscripts" | "ancient-world" | "objects";

export interface Source {
  id: string;
  title: string;
  author: string;
  year?: string;
  type: "biblical-text" | "scholarly-book" | "academic-article" | "manuscript-catalogue" | "museum-collection"
    | "archaeological-report" | "ancient-text" | "reference-work" | "institutional" | "digital-archive";
  note?: string;
  url?: string;
}

export interface Base {
  kind: Kind;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  /** ids of sources in sources.ts that support the material on the page */
  sources: string[];
  /** slugs, as "kind/slug", of related entries (used for the knowledge graph and "go deeper") */
  links: string[];
  premium?: boolean;
  /** hue key used by generated artwork */
  art?: string;
  visual?: VisualKind;
}

export interface Layer {
  depth: number; // 1..10; shown when the reader's depth >= this
  heading: string;
  body: string[];
  tag?: EvidenceKind;
}

export interface Claim {
  text: string;
  kind: EvidenceKind;
  status: Status;
  sources: string[];
  limits: string;
}

export interface Viewpoint {
  label: string;
  nature: "tradition" | "scholarly" | "individual" | "hypothesis";
  position: string;
  support: string[];
  objections: string[];
}

export interface QuizQ { q: string; options: string[]; answer: number; why: string }

export interface Investigation extends Base {
  kind: "investigations";
  question: string;
  difficulty: Difficulty;
  period: string;
  passages: string[];
  layers: Layer[];
  claims: Claim[];
  viewpoints: Viewpoint[];
  unresolved: string[];
  quiz: QuizQ[];
  minutes: number;
}

export interface Oddity extends Base {
  kind: "oddity-vault";
  question: string;
  explanation: string[];
  context: string;
  bible?: string;
  evidence: string;
  uncertainties: string;
  ageOk: "all" | "teen+" | "adult";
  label: "strange" | "beautiful" | "forgotten" | "misunderstood" | "mysterious" | "unexpected" | "rarely-taught";
  status: Status;
}

export type BeliefVerdict = "explicitly-stated" | "implied" | "later-tradition" | "scholarly-interpretation" | "not-established";
export interface Belief extends Base {
  kind: "belief-check";
  claim: string;
  verdict: BeliefVerdict;
  why: string;
  text: string[]; // what the text says
  tradition?: string[]; // what later tradition says
  scholarship?: string[]; // what scholarship says
  popular?: string[]; // what popular culture says
  passages: string[];
}

export interface Arena extends Base {
  kind: "interpretations";
  question: string;
  mode: "interpretation" | "textual-difference";
  passages: string[];
  positions: Viewpoint[];
  note: string;
}

export interface Silence extends Base {
  kind: "silence";
  passage: string;
  says: string[];
  implies: string[];
  tradition: string[];
  scholarship: string[];
  unknown: string[];
}

export interface Person extends Base {
  kind: "people";
  role: string;
  period: string;
  passages: string[];
  outside: string; // attestation outside the Bible, honestly stated
  body: string[];
}

export interface Place extends Base {
  kind: "places";
  lat: number;
  lng: number;
  modern: string;
  /** known | proposed | disputed identification */
  location: "known" | "proposed" | "disputed";
  period: string;
  passages: string[];
  body: string[];
}

export interface Dig extends Base {
  kind: "archaeology";
  site: string;
  found: string; // what was physically discovered
  dating: string; // how it was dated
  inference: string; // what researchers infer
  connection: "direct" | "indirect" | "debated" | "speculative";
  connectionNote: string;
  limits: string;
  holding: string;
  year: string;
  passages: string[];
}

export interface Manuscript extends Base {
  kind: "manuscripts";
  language: string;
  composed: string; // composition date of the work
  copied: string; // date of the surviving witness
  holding: string;
  content: string;
  why: string;
  limits: string;
}

export interface Civilisation extends Base {
  kind: "ancient-world";
  region: string;
  period: string;
  contact: string; // how it touches the Bible
  directEvidence: string;
  body: string[];
  cautions: string;
}

export interface ObjectItem extends Base {
  kind: "objects";
  prompt: string;
  hints: string[];
  answer: string;
  function: string;
  material: string;
  period: string;
  evidence: string;
  bible?: string;
  uncertainty: string;
  glyph: string; // svg path key
}

export type Entry = Investigation | Oddity | Belief | Arena | Silence | Person | Place | Dig | Manuscript | Civilisation | ObjectItem;

export interface TimelineEvent {
  id: string;
  year: number; // negative = BCE
  yearTo?: number;
  label: string;
  region: "israel" | "egypt" | "mesopotamia" | "persia" | "greece-rome" | "text";
  note: string;
  certainty: Status;
  link?: string; // "kind/slug"
}

export interface Journey { slug: string; title: string; blurb: string; steps: string[]; minutes: number }
