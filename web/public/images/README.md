Drop screenshots here, then point at them from web/content/cases.ts:

  heroImage: {
    src: '/images/playhub-home.png',
    alt: 'PlayHub home screen listing three nearby venues with hourly rates',
    width: 1472,
    height: 812,
  },

  figureImages: [
    { src: '/images/playhub-leaderboard.png', alt: '…', width: 1459, height: 827 },
    { src: '/images/playhub-bookings.png',    alt: '…', width: 1472, height: 824 },
  ],

width and height are required: without them the browser cannot reserve the
space and every image shifts the page as it loads. Use the file's real pixel
dimensions — the CSS still sizes it.

Write alt text describing what the screen shows, not that it is a screenshot.
