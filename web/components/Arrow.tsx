/* An arrow that leaves and is replaced, rather than one that slides and
   returns. Two identical glyphs on a track twice the width of its clip: at
   rest the track sits at -50% showing the second, and on hover it slides to 0
   — which carries the second glyph out to the right and brings the first in
   from the left. One transition, no JS, no timing to keep in sync.

   Hover is on the *parent*, so it triggers from anywhere on the button
   rather than only when the pointer is over the 1em arrow itself.

   aria-hidden because it is punctuation. The buttons already read as links
   from their own text ("See all projects"); an arrow announced as "right
   arrow" after every one of them is noise. */
export function Arrow({ glyph = '→' }: { glyph?: string }) {
  return (
    <span className="arrow" aria-hidden="true">
      <span className="arrow-track">
        <span>{glyph}</span>
        <span>{glyph}</span>
      </span>
    </span>
  );
}
