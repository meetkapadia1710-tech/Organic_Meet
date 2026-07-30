/* What is current, as opposed to what is finished.

   Lifted out of pages/Approach.tsx so the homepage's "Right now" block and
   the Approach page's "Currently learning" list are the same list rather than
   two copies that drift — the failure mode being a homepage still claiming
   you are learning something you finished six months ago.

   The other half of "right now" — what is being built — is not here. It comes
   from the projects marked `status: 'In progress'` in projects.ts, because
   that fact already lives there and is already what the work rows display. */

export const LEARNING = [
  'Distributed systems',
  'Rust',
  'Vector search at scale',
  'On-device inference',
  'Motion & interaction design',
];
