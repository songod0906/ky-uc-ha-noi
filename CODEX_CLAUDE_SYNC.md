# Codex / Claude Sync Note

Last updated: 2026-06-17

This file is for keeping Claude, Codex, and the human workflow aligned. It records what Codex did after the latest Claude work, what should not be reopened, and what still needs to be fixed.

## Codex Update After This Note Was Created

Date: 2026-06-17

Codex continued from the user/Claude handoff and made the smallest needed changes for the current blockers.

Changed files:

- `src/data/stories.ts`
- `src/components/PanoramaViewer.tsx`
- `public/audio/trang-cong-sau.mp3`
- `CODEX_CLAUDE_SYNC.md`

### Thanh Cong Back Gate Audio Is Now Created And Wired

Created:

- `public/audio/trang-cong-sau.mp3`

Source:

- `public/audio/oral-history/thanh-cong.m4a`

Cut used:

- start: `00:09:12.852`
- end: `00:10:04.971`
- duration: about `52.119s`

This segment starts at the Thanh Cong back-gate story and ends after the fence/removal comparison. It was selected from the Vietnamese/English SRT timing, not guessed from the clue text.

Updated `src/data/stories.ts`:

- `trang-cong-sau` anchor now has `audioSec: 552.852`.
- `trang-cong-sau` clue now has `audioSrc: '/audio/trang-cong-sau.mp3'`.

### Calibration Page Movement Fixes

Updated `src/components/PanoramaViewer.tsx` so calibration mode is not blocked by visitor-mode story rules.

In calibration mode:

- blocking clue logic no longer prevents moving forward,
- `Go Forward` is no longer hidden behind an uncollected clue,
- forward/back navigation no longer gets suppressed by clue cards,
- nav arrows no longer get nudged away from clues, so yaw placement stays exact while calibrating.

This was aimed at the user-reported calibration issues in Quan Net, Extra Class, Essy alley, Ho Thanh Cong, and the first violin/snail stall image.

### Browser Verification

Verified on local app:

- `http://localhost:3003/?calib=1`
- calibration HUD appears,
- Quan Net route can enter calibration mode,
- `Go Forward` appears at the start of the Quan Net route,
- repeated forward movement reaches later Quan Net nodes,
- at `qn-12`, the HUD still shows `Go Forward`, `F forward`, and the clue anchor data, so the blocking clue no longer traps calibration movement.

### Backend / Supabase Check

Current repo check found public Supabase asset URLs in `src/data/stories.ts`, but no frontend Supabase client or writable database code in `src`.

For now, the practical sync source is still `src/data/stories.ts`: clue ids, node ids, clue anchors, audio files, `audioSec`, scan anchors, and historic URLs all come from that file and are what calibration mode reads.

If there is a separate Supabase table outside this repo, it was not visible from the current code search. Do not invent backend records from the frontend. Use `stories.ts` as the source unless the user provides the database shape.

### Verification Commands

- `npm run lint`: passed.
- `npm run build`: passed.
- Browser reload at `http://localhost:3003/?calib=1`: passed.
- After clicking `Begin`, calibration HUD appears on `dla-01`.

Build warnings are existing bundle-size/import warnings, not errors.

## Codex Update: Visitor Flow, Calibration Paste, Video, Stamps

Date: 2026-06-17

Additional changes made after the back-gate audio/calibration fix:

- Applied the user's latest Essy `es-ng` and `es-gk` navigation yaws to `src/data/stories.ts`.
- Applied the latest clue anchor paste to `src/data/stories.ts`.
- Kept only non-removed clue anchors from the paste.
- Moved `trang-choi-net` to `qn-01` with `audioSec: 434.272`.
- Moved `trang-tieng-chui` to `qn-15` with `audioSec: 497.692`.
- Kept `trang-cong-sau` at `htc-01` with `audioSec: 552.852`.
- Moved `trang-xe-dap` to `htc-05` with `audioSec: 609`.
- Moved `thai-thinh-pho-khong-xe` to `tt-hoc-02` and `tt-hoc-07`, both with `audioSec: 85.72`.
- Moved `thai-thinh-di-voi-me` to `tt-oc-01` with `audioSec: 344`.
- Kept `thai-thinh-vio-oc` at `tt-oc-05` with `audioSec: 428`.
- Moved `essy-cay-xanh-ngo` to `es-ng-14` with `audioSec: 20`.
- Removed the `essy-di-tich` anchor because the pasted calibration marked it removed and did not provide a replacement.

Visitor behavior changes:

- The memory audio dock now has a `Compare with past` action when the current node has a Google Street View historic comparison.
- This was verified on the Thanh Cong back-gate clue: the clue saves, audio starts, and `Compare with past` opens the Google iframe panel.
- Panoramic videos no longer auto-open on final nodes that contain a clue. This keeps the Violin Snail Stall final clue collectable.
- Vimeo URLs now append `autoplay=1` when opened from the visitor's video button.
- The visible site name on the start/loading/map UI is now `Ký Ức Hà Nội`.

Audio/ambient confirmation:

- The website uses copies in `public/audio`: `sound-trong-truong.mp3`, `sound-net.mp3`, `sound-violin.mp3`, and `sound-aerobic.mp3`.
- These came from the raw `assets/SOUND` folder, but the built website correctly reads from `public/audio`.
- Ambient sound now follows the active clue's `ambient` value first. This means the school drum clue, Quan Net keyboard clues, and violin snail clues trigger their matching public audio loops while the clue audio plays.

Stamp diary confirmation:

- Collected clues are added to the diary immediately through `onCollect`.
- `Complete Archive` is enabled after at least one collected clue in the current space.
- After the archive typing transition, `Open Memory File` shows the stamp diary.
- Browser check confirmed: collecting the Violin Snail Stall clue produces `1 / 2 stamps`, the found stamp is selectable, the missing stamp stays locked, and the selected stamp shows the clue's panorama/audio/quote/note.
- `hanoi_memory_stamp_diary.html` is the original stamp diary/book prototype and should stay tracked as source/reference for the diary design. The live app uses `src/components/StampDiary.tsx`.

Browser verification:

- Main page at `http://localhost:3003/` shows title `Ký Ức Hà Nội`.
- Thanh Cong Lake back-gate clue shows audio dock and `Compare with past`.
- Violin Snail Stall point 5 shows the final clue and video button without auto-opening the video.
- Clicking the video button opens the Vimeo iframe with a close control.
- Calibration page at `http://localhost:3003/?calib=1` still opens and shows the calibration HUD.

Verification commands:

- `npm run lint`: passed.
- `npm run build`: passed.

## Codex Update: Stamp Diary Page Flip + Stamp Sound Effects

Date: 2026-06-17

New changes made after commit `7c055e1`:

- `src/components/StampDiary.tsx`
  - Stamp audio playback now starts the selected clue's `ambient` sound effect through `AudioSynth.startAmbient(selectedClue.ambient)`.
  - The ambient loop stops when the stamp audio is paused, ended, changed, or when the diary unmounts.
  - This restores the intended behavior for stamp playback:
    - `trang-tieng-trong` uses `school-drum` -> `/audio/sound-trong-truong.mp3`.
    - Quan Net clues use `keyboard` -> `/audio/sound-net.mp3`.
    - Violin Snail Stall clues use `violin` -> `/audio/sound-violin.mp3`.
  - The diary now builds pages from the full session diary across `ALL_STORIES`, not only from the active space.
  - The diary opens on the space just completed, but shows previous/next page buttons when stamps from other spaces exist.
  - The selected page drives the stamp grid, panorama/scan preview, audio, quote, narrator, and page label.
  - The earlier linked-scan fix is preserved: Lemon ice cream still shows `3D Food Stall · drag to inspect`.
  - The Net Cafe sound stamp now opens the Net Cafe scan because `trang-tieng-chui` is linked to `/scans/quan-net.glb`.

- `src/components/MemoryRouteGame.tsx`
  - Ending now passes the full `diary` to `EndingCannotBeMoved` instead of filtering it down to the active space.
  - This is required for the diary to flip between collected pages from the same session.

- `src/components/PanoramaViewer.tsx`
  - The audio dock now looks across all route nodes for a scan linked to the active clue, not only the current node.
  - This lets the `The two sounds of the net cafe` clue offer/open `View 3D Net Cafe` even when the scan anchor lives on the next route node.

- `src/data/stories.ts`
  - Added `clueId: 'trang-tieng-chui'` to the Quan Net scan anchor at `qn-17`.

Browser verification:

- Starting from the current local app session, collected both School Gate stamps, then collected both Net Cafe stamps.
- Completed the Net Cafe archive and opened the memory file.
- The diary showed `p. II / II` on the Net Cafe page.
- Clicking `Previous diary page` flipped to School Gate and showed `p. I / II`.
- School Gate page still showed Lemon ice cream with `3D Food Stall · drag to inspect`.
- Net Cafe page showed the two Net Cafe stamps and active stamp audio.
- Net Cafe `The two sounds...` stamp is intended to show/open the linked `3D Net Cafe` scan and play the `keyboard` ambience when the stamp audio plays.

Verification commands:

- `npm run lint`: passed.
- `npm run build`: passed.

Notes for Claude:

- Do not re-copy the raw `assets/SOUND` files unless public audio is missing. The live app reads the tracked public paths in `public/audio/sound-*.mp3`.
- The untracked `public/audio/ambient-*.mp3` files are not used by the current `AudioSynth` map.
- Quan Net's 3D scan still starts keyboard ambience in `PanoramaViewer` while the scan is open via the `spaceId === 'quan-net' && activeScan` branch.

## Current Rule From User

- Do not redo the subtitle investigation. Claude already fixed the subtitle logic.
- Do not randomly redesign or refactor.
- Focus on:
  - missing `trang-cong-sau` audio,
  - calibration data syncing,
  - backend/id syncing,
  - calibration-page movement bugs.

## Current Git State

- Current branch: `main`
- Latest pushed commit: `a678f0d Apply latest panorama calibrations`
- Previous relevant Claude commit: `43caad6 feat: rebuild all audio clues from PDF source with correct timestamps`

There are still local uncommitted changes in:

- `src/components/EndingCannotBeMoved.tsx`
- `src/components/MemoryRouteGame.tsx`
- `src/components/MemorySpace.tsx`
- `src/components/PanoramaViewer.tsx`

Those component changes are part of the local working tree state around subtitles, split view, diary/ending, or audio UI. Do not overwrite them casually. Read them before editing.

Untracked local files also exist, including raw voice memos, `Digital Idea-4.pdf`, ambient audio files, and `src/components/StampDiary.tsx`. Treat them as user/project assets unless the user explicitly asks to clean them.

## What Codex Changed And Pushed

Codex pushed commit `a678f0d`, touching only:

- `src/data/stories.ts`

The commit applied the latest pasted calibration dump without investigating the deeper movement bugs.

Important effects of `a678f0d`:

- `ES_NG_YAWS` now only keeps `es-ng-01: fwd 2, back -178` from the pasted calibration dump.
- `trang-tieng-chui` anchor moved to `qn-12` with yaw `-1`, pitch `-2`.
- `trang-choi-net` is currently not anchored in `quan-net` after that calibration pass.
- `trang-cong-sau` is now anchored at `htc-01` with yaw `-175`, pitch `-29`.
- `trang-xe-dap` is anchored at `htc-06` with yaw `25`, pitch `-8`, `audioSec: 609`.
- `essy-tre-con-gieng` is anchored at `es-gk-01` with yaw `17`, pitch `-8`.
- `essy-gieng-mat` is currently not anchored in the well/playground route after the pasted calibration removal.
- `thai-thinh-hoc-them` and `thai-thinh-pho-khong-xe` are both anchored at `tt-hoc-01`, based on the pasted calibration note.
- `thai-thinh-san-choi` is at `tt-pg-01`; `thai-thinh-tieng-cuoi` is at `tt-pg-05`.
- `thai-thinh-di-voi-me` is at `tt-oc-01`.

This commit passed `npm run lint` before push.

## Things Claude Already Fixed Or Was Handling

Per the user and pasted Claude chat:

- Subtitle logic has already been fixed by Claude.
- Do not restart subtitle archaeology unless the user reports a new subtitle bug.
- Claude’s intended subtitle approach is:
  - use the full oral-history SRTs,
  - use clue/node `audioSec` as the offset,
  - match English and Vietnamese timing from the same full recording.

## Current Known Problems

### 1. Missing Thanh Cong Gate Audio

Resolved by Codex on 2026-06-17.

`trang-cong-sau` now exists, is anchored, and has audio:

- file: `/public/audio/trang-cong-sau.mp3`
- clue audio: `audioSrc: '/audio/trang-cong-sau.mp3'`
- anchor offset: `audioSec: 552.852`

This is the one missing audio clue the user currently cares about.

It should be cut from the full Thanh Cong oral history:

- source audio: `public/audio/oral-history/thanh-cong.m4a`
- source Vietnamese subtitle: `public/subtitles/thanh-cong-vie.srt`
- source English subtitle: `public/subtitles/thanh-cong-eng.srt`
- content: Thanh Cong lake back gate / half-open gate / locals do not use the main gate / fence comparison.

Do not guess the cut from English first. Use the Vietnamese SRT to locate the exact back-gate segment, then use the same timestamps for English.

### 2. Calibration Data Is Not Fully Synced With Main Website

The main site, calibration mode, story data, and backend need to agree on:

- clue ids,
- node ids,
- clue anchors,
- audio files,
- `audioSec`,
- scan anchors,
- historic comparison URLs.

Right now they are drifting. The user needs to calibrate normally and send clean data back.

### 3. Backend Sync Still Needs Checking

Initial repo check completed by Codex on 2026-06-17.

The current frontend code appears to use Supabase only through public asset URLs in `src/data/stories.ts`. No Supabase client/database write path was found in `src`.

If backend records exist outside this repo, inspect that separately before changing them.

Do not invent ids. Use the final `stories.ts` ids as the source unless the backend proves otherwise.

### 4. Calibration Page Movement Bugs

Known user-reported calibration bugs:

- `quan-net`: some images have no usable forward button; pressing `F` does not let the user move forward.
- `nha-hoc-them` / Extra Class: same forward movement problem.
- `nha-ngo` / Essy alley: same forward movement problem.
- `ho-thanh-cong`: some forward buttons ignore the yaw where the user presses `F` and stay left/right.
- `quan-oc-violin`: first image has the same wrong-forward-yaw behavior.

The user asked not to investigate these earlier, but they are now part of the next real work.

Partially resolved by Codex on 2026-06-17:

- calibration mode now ignores visitor-mode clue blocking,
- calibration mode keeps exact nav yaw placement instead of nudging arrows away from clues,
- browser check confirmed Quan Net calibration can move forward through later nodes again.

Still needs user calibration pass:

- HTC yaws,
- any remaining QN node 6 yaw entry,
- Extra Class and Essy alley should be checked by the user in the browser after this fix.

### 5. HTC Route Needs A Real Calibration Pass

The last calibration dump had many Ho Thanh Cong yaws as `null`. The current lake route is not final.

After `trang-cong-sau.mp3` exists and the gate clue is correctly playable, HTC should be calibrated again.

### 6. QN Node 6 Needs Follow-up

`qn-06` may need a `QN_YAWS` entry once the `trang-choi-net` blocking clue is placed correctly and navigation can pass it.

Also note: after `a678f0d`, `trang-choi-net` is not anchored, so this has to be resolved before judging the route.

## Recommended Next Order

1. Verify the Thanh Cong back gate clue in the main visitor flow.
2. Let the user recalibrate affected routes now that calibration movement is unblocked.
3. Apply the final clean calibration dump.
4. Recheck HTC yaws and QN node 6.
5. Only then push final website polish.

## Files To Be Careful With

- `src/data/stories.ts`: central story/clue/anchor route data.
- `src/components/PanoramaViewer.tsx`: calibration HUD, clue rendering, navigation anchors, subtitle/audio overlay, historic comparison split view.
- `src/components/MemorySpace.tsx`: passes story/space data into panorama.
- `src/components/MemoryRouteGame.tsx`: controls dossier/explore/ending and diary wiring.
- `public/audio/`: clue audio files live here.
- `public/subtitles/`: full oral-history SRTs live here.

## Do Not Do

- Do not regenerate all subtitles unless the user asks.
- Do not remove Claude’s subtitle fix.
- Do not overwrite local dirty component files without reading them.
- Do not commit raw voice memo files unless the user explicitly asks.
- Do not create new clue ids just because a pasted id typo exists.
