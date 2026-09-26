# abhinav-portfolio

Hand-built portfolio. No frameworks — HTML, CSS, JS. Live at
<https://abhinavsingh1176.github.io/abhinav-portfolio/>.

## Editing

Open `/admin.html` on the live site (token setup explained there), or edit
`index.html` directly — the comment at the top of that file lists the usual
edit points. `Abhinav_Singh_Resume.pdf` is the resume every link points to;
replace that file to update it.

## Regenerating the link-preview image

`og-image.png` (the card shown when the site is shared on LinkedIn, Slack,
iMessage, etc.) is a 1200×630 screenshot of `og-card.html`. After a headline
change, update `og-card.html` and re-render from the repo folder:

```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless --disable-gpu --screenshot="og-image.png" --window-size=1200,630 --virtual-time-budget=8000 --hide-scrollbars "og-card.html"
```

Check the result: some Chromium builds subtract window chrome from
`--window-size`, which crops the bottom of the card. If that happens, render
with Playwright at an exact 1200×630 viewport instead. Then commit the PNG.
