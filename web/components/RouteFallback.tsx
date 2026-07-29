/* The Suspense fallback shown while a lazy route chunk is still in flight.

   In practice this should almost never appear: TLink and Nav call
   prefetchRoute() on hover/focus, so the chunk is usually sitting in the
   browser's module cache well before the click lands. This exists for what's
   left over — a click that beats the hover (arrow-key navigation, the
   command palette's Enter key, a very fast trackpad flick) and, once per
   session per route, the very first visitor to click before anything has
   been prefetched.

   It reserves roughly a header's worth of height rather than nothing, so the
   footer doesn't jump up to meet the nav for the instant the fallback is on
   screen — collapsing to zero height is the more jarring version of this. */
export function RouteFallback() {
  return (
    <div
      aria-hidden="true"
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span className="route-fallback-dot" />
    </div>
  );
}
