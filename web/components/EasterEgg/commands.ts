/* ─────────────────────────────────────────────────────────────────────────
   commands.ts — what the terminal knows.

   Everything here is derived from the same content files the visible site
   renders from. That is not tidiness for its own sake: a terminal that lists
   projects Meet does not have, or a skill count that disagrees with the Stack
   section two scrolls up, is worse than no terminal — it is a portfolio
   caught contradicting itself by the one visitor curious enough to dig.

   The spec's example output listed "Organic_Meet, Bhumi Developers, Portfolio
   CMS, AI Assistant". Only Bhumi Developers exists, so the real list comes
   from `content/projects.ts` instead.
   ───────────────────────────────────────────────────────────────────────── */

import { archive, caseStudies } from '../../content/projects';
import { stack, stackCount } from '../../content/stack';
import { stats } from '../../content/stats';

const EMAIL = 'kapadiameet07@gmail.com';
const GITHUB = `https://github.com/${stats.github}`;

export type Tone = 'heading' | 'accent' | 'muted' | 'plain';

export interface Line {
  text: string;
  tone?: Tone;
}

export interface CommandContext {
  navigate: (to: string) => void;
  open: (url: string) => void;
}

export type Outcome =
  | { kind: 'lines'; lines: Line[] }
  | { kind: 'clear' }
  | { kind: 'exit' };

interface Command {
  name: string;
  summary: string;
  run: (ctx: CommandContext) => Outcome;
}

const lines = (value: Line[]): Outcome => ({ kind: 'lines', lines: value });

const COMMANDS: Command[] = [
  {
    name: 'help',
    summary: 'list every command',
    run: () =>
      lines([
        { text: 'Available commands', tone: 'heading' },
        ...COMMANDS.map((c) => ({ text: `  ${c.name.padEnd(11)}${c.summary}`, tone: 'plain' as Tone })),
        { text: '' },
        { text: 'Esc closes the terminal. Esc again leaves the garden.', tone: 'muted' },
      ]),
  },
  {
    name: 'whoami',
    summary: 'the short version',
    run: () =>
      lines([
        { text: 'Meet Kapadia', tone: 'heading' },
        { text: 'Full-stack developer · systems builder', tone: 'accent' },
        { text: '' },
        { text: 'B.Tech CSE, IIIT Vadodara. Based in Bharuch, Gujarat.' },
        { text: 'Builds web apps, AI tooling and local-first systems —' },
        { text: 'schema through to the last hover state.' },
      ]),
  },
  {
    name: 'about',
    summary: 'what I actually do',
    run: () =>
      lines([
        { text: 'About', tone: 'heading' },
        { text: '' },
        { text: 'Most of my work sits where AI meets infrastructure: a tool' },
        { text: 'that grades a repository against its actual code, an' },
        { text: 'assistant with a swappable brain, a memory layer that never' },
        { text: 'leaves the machine.' },
        { text: '' },
        { text: 'I care about the seams — the schema that stays normalized,' },
        { text: 'the payment flow that does not drop, the transition that' },
        { text: 'lands.' },
        { text: '' },
        { text: 'Run `open approach` for the long version.', tone: 'muted' },
      ]),
  },
  {
    name: 'skills',
    summary: `the stack (${stackCount} technologies)`,
    run: () =>
      lines([
        { text: `Stack · ${stackCount} technologies`, tone: 'heading' },
        { text: '' },
        ...stack.flatMap<Line>((group) => [
          { text: group.name, tone: 'accent' },
          { text: `  ${group.items.join(' · ')}` },
          { text: '' },
        ]),
      ]),
  },
  {
    name: 'projects',
    summary: `${caseStudies.length + archive.length} shipped`,
    run: () => {
      const featured = caseStudies.filter((p) => p.featured);
      const total = caseStudies.length + archive.length;
      /* Every project currently has a case study, which made the old
         "18 shipped, 18 written up" read as a copy-paste error. Only draw the
         distinction when there is one. */
      const written =
        caseStudies.length === total ? 'every one written up' : `${caseStudies.length} written up`;
      return lines([
        { text: `Projects · ${total} shipped, ${written}`, tone: 'heading' },
        { text: '' },
        ...featured.map<Line>((p) => ({ text: `  ${p.year}  ${p.name}` })),
        { text: '' },
        { text: `  …and ${total - featured.length} more.`, tone: 'muted' },
        { text: '' },
        { text: 'Run `open projects` to browse them all.', tone: 'muted' },
      ]);
    },
  },
  {
    name: 'experience',
    summary: 'clients, teams, hackathons',
    run: () => {
      const all = [...caseStudies, ...archive];
      const count = (category: string) => all.filter((p) => p.category === category).length;
      return lines([
        { text: 'Experience', tone: 'heading' },
        { text: '' },
        { text: `  Client work     ${count('Client work')} projects, 3 paying clients` },
        { text: `  Hackathons      ${count('Hackathons')} builds` },
        { text: `  Products        ${count('Products')} of my own` },
        { text: `  AI & tooling    ${count('AI & tooling')} projects` },
        { text: '' },
        { text: 'Every one has a write-up. None of them are placeholders.', tone: 'muted' },
      ]);
    },
  },
  {
    name: 'future',
    summary: 'what is next',
    run: () =>
      lines([
        { text: 'Currently learning', tone: 'heading' },
        { text: '' },
        { text: '  Distributed systems' },
        { text: '  Rust' },
        { text: '  Vector search at scale' },
        { text: '  On-device inference' },
        { text: '  Motion & interaction design' },
        { text: '' },
        { text: 'I am a student, so this list changes every few months —', tone: 'muted' },
        { text: 'which is the point.', tone: 'muted' },
      ]),
  },
  {
    name: 'resume',
    summary: 'where the CV is',
    run: () =>
      /* The spec said this should download a resume. There is no resume file
         in this repository, and a command that silently 404s is worse than
         one that tells the truth. Drop a PDF in web/public/ and this becomes
         a real download — see STATUS.md. */
      lines([
        { text: 'No resume on file', tone: 'heading' },
        { text: '' },
        { text: 'There is no PDF published here yet, so this command has' },
        { text: 'nothing honest to hand you.' },
        { text: '' },
        { text: 'In the meantime:' },
        { text: `  email     ${EMAIL}`, tone: 'accent' },
        { text: `  github    ${GITHUB}`, tone: 'accent' },
        { text: '' },
        { text: 'The case studies are a better read anyway.', tone: 'muted' },
      ]),
  },
  {
    name: 'github',
    summary: 'open the profile',
    run: (ctx) => {
      ctx.open(GITHUB);
      return lines([{ text: `Opening ${GITHUB}`, tone: 'accent' }]);
    },
  },
  {
    name: 'contact',
    summary: 'go to the contact page',
    run: (ctx) => {
      ctx.navigate('/contact');
      return lines([
        { text: 'Opening /contact', tone: 'accent' },
        { text: `Or just write to ${EMAIL}.`, tone: 'muted' },
      ]);
    },
  },
  {
    name: 'open',
    summary: 'open a page: home projects approach stats contact',
    run: () =>
      lines([
        { text: 'Usage: open <page>', tone: 'heading' },
        { text: '  home  projects  approach  stats  contact' },
      ]),
  },
  {
    name: 'clear',
    summary: 'empty the screen',
    run: () => ({ kind: 'clear' }),
  },
  {
    name: 'exit',
    summary: 'leave the garden',
    run: () => ({ kind: 'exit' }),
  },
];

const ROUTES: Record<string, string> = {
  home: '/',
  projects: '/projects',
  approach: '/approach',
  stats: '/stats',
  contact: '/contact',
};

export function commandNames(): string[] {
  return COMMANDS.map((c) => c.name);
}

export function run(input: string, ctx: CommandContext): Outcome {
  const trimmed = input.trim();
  if (!trimmed) return lines([]);

  const [name, ...args] = trimmed.toLowerCase().split(/\s+/);

  // `open <page>` is the one command that takes an argument.
  if (name === 'open' && args.length) {
    const target = ROUTES[args[0] ?? ''];
    if (!target) {
      return lines([
        { text: `open: unknown page "${args[0]}"`, tone: 'accent' },
        { text: `  try: ${Object.keys(ROUTES).join('  ')}`, tone: 'muted' },
      ]);
    }
    ctx.navigate(target);
    return lines([{ text: `Opening ${target}`, tone: 'accent' }]);
  }

  const command = COMMANDS.find((c) => c.name === name);
  if (!command) {
    return lines([
      { text: `command not found: ${name}`, tone: 'accent' },
      { text: "Run `help` to see what is available.", tone: 'muted' },
    ]);
  }

  return command.run(ctx);
}
