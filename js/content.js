/* =====================================================
   CONTENT — edit text, projects, links and socials here.
   ===================================================== */

// Typewriter lines in the hero
const TITLES = ['I PLAY.', 'I EDIT.', 'I AM THEREFORE, I AM.'];

// media: what plays when someone clicks the card's thumbnail. Use ONE of:
//   a YouTube link  -> 'https://www.youtube.com/watch?v=XXXXXXXXXXX' (youtu.be and /shorts/ links work too)
//   a video file    -> 'assets/videos/edit1.mp4'
//   an image        -> 'assets/images/lock.jpg'
//   several items   -> ['link1', 'link2']  (shows arrows in the popup)
//   nothing yet     -> ''  (the card just shows a placeholder)
// thumb (optional): a custom thumbnail image, e.g. thumb: 'assets/images/cover.jpg'
// YouTube links get their thumbnail automatically.
const P = {
  edit: [
   { t: 'Baguio Montage', d: 'Simple edit about my trip to Baguio featuring You Owe Me by Malcom Todd.', tags: ['Adobe Premiere Pro'], media: 'https://www.youtube.com/embed/1i_HowoN1hk', links: [['WATCH', 'https://youtu.be/1i_HowoN1hk']] },
{ t: 'After School - Valorant Edit', d: 'A fast-paced edit with transitions and effects featuring After School by Weeekly', tags: ['Adobe Premiere Pro'], media: 'https://www.youtube.com/embed/VmDUjzPr_Ek', links: [['WATCH', 'https://youtu.be/VmDUjzPr_Ek']] },
    { t: 'U da reel Art', d: 'A life in a CpE student.', tags: ['Adobe Premiere Pro'], media: 'https://www.youtube.com/embed/e8Du4CrUaQw?rel=0', links: [['WATCH', 'https://youtube.com/shorts/e8Du4CrUaQw', '#']] }
  ],
  eng: [
    { t: 'COMING SOON', d: 'COMING SOON', tags: ['COMING SOON'], media: '', links: [['COMING SOON', '#'], ['COMING SOON', '#']] },
    { t: 'COMING SOON', d: "COMING SOON", tags: ['COMING SOON'], media: '', links: [['COMING SOON', '#'], ['COMING SOON', '#']] },
    { t: 'COMING SOON', d: 'COMING SOON', tags: ['COMING SOON'], media: '', links: [['COMING SOON', '#'], ['COMING SOON', '#']] },
    { t: 'COMING SOON', d: 'COMING SOON', tags: ['COMING SOON'], media: '', links: [['COMING SOON', '#'], ['COMING SOON', '#']] }
  ]
};

// Contact buttons: [label, value, copy?]
//   no 3rd value -> opens the link in a new tab (↗)
//   3rd value = 1 -> copies the value to the clipboard (⧉)
const C = [
  ['GITHUB',    'https://github.com/hiraiie'],
  ['LINKEDIN',  'https://linkedin.com/in/your-handle'],
  ['YOUTUBE',   'https://youtube.com/@hiraiie'],
  ['TIKTOK',    'https://tiktok.com/@itshiraiie'],
  ['FACEBOOK',  'https://facebook.com/japeeeeeh'],
  ['INSTAGRAM', 'https://instagram.com/justin.a.p'],
  ['GMAIL',     'j.amboyapanaligan@gmail.com', 1],
  ['DISCORD',   'hiraiie', 1],
  ['TELEGRAM',  '@your_handle', 1]
];
