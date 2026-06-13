# abhinav-portfolio

Hand-built portfolio. No frameworks — HTML, CSS, JS. Live at
<https://abhinavsingh1176.github.io/abhinav-portfolio/>.

## Editing

Open `/admin.html` on the live site (token setup explained there), or edit
`index.html` directly — the comment at the top of that file explains the
three usual edit points.

## Regenerating the link-preview image

`og-image.png` (the card shown when the site is shared on LinkedIn, Slack,
iMessage, etc.) is a screenshot of `og-card.html`. After a rev bump or a
headline change, update `og-card.html` to match and re-render:

```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless --disable-gpu --screenshot="og-image.png" --window-size=1200,630 --virtual-time-budget=8000 --hide-scrollbars "og-card.html"
```

Then commit the new PNG. (Run from the repo folder; any Chromium browser's
`--headless --screenshot` works the same way.)
