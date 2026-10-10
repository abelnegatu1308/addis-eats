# Performance budget and measurement

## Method

Production builds measured with Lighthouse 13.5.0 and Chrome using its
simulated mobile profile (412 x 823 viewport, 1.75 device pixel ratio,
150 ms RTT, 1,638.4 Kbps throughput, 4x CPU slowdown). Each baseline is one
run; after values are the median of three navigation runs against the same
optimized build. The before build used Next.js 16.3.6; the final build uses
16.4.0 and the Neon order adapter, so this is indicative rather than a
controlled one-change comparison. Navigation-only Lighthouse does not
exercise a real interaction, so INP is not reported.

```powershell
npm run build
npm run start -- --port 3038
npx --yes lighthouse@13.5.0 http://localhost:3038/ --only-categories=performance --throttling-method=simulate --chrome-flags="--headless --no-sandbox" --output=json
```

The Day-45 after runs varied: LCP 3.39–4.01 s, TBT 78–662 ms, TTFB 10–33 ms,
and transfer 366,984–367,941 bytes. Comparisons are indicative, not controlled
experiments.

## Day-45 six-row budget

| Metric | Budget | Before | After | Cause/interpretation |
| --- | ---: | ---: | ---: | --- |
| Largest Contentful Paint (LCP) | <= 2.5 s | 3.64 s | 3.46 s | Still over budget; the spread of three after runs is 3.39–4.01 s, so no improvement is demonstrated |
| Interaction to Next Paint (INP) | <= 200 ms | Not reported | Not reported by navigation run | Run a separately documented interaction measurement if a trustworthy INP is needed |
| Cumulative Layout Shift (CLS) | <= 0.10 | 0.000 | 0.000 | Within budget in both measurements |
| Total Blocking Time (TBT) | <= 200 ms | 317 ms | 116 ms | Median is below budget, but one after run was 662 ms; repeat the baseline and investigate the outlier before claiming a stable gain |
| Document TTFB | <= 800 ms | 27 ms | 12 ms | Within budget; after-run spread is 10–33 ms |
| Transferred bytes | <= 400 KiB | 377 KiB | 359 KiB | About 18 KiB lower; removing the unused DM Mono font removes its font request |

## Capstone six-row budget

The capstone's production `dist/` output was served locally on port 3037, using
the same Lighthouse version, simulated profile, and navigation-only
limitation. Its after runs measured LCP 2.93–2.94 s, CLS 0.221, TBT 34.5–62 ms,
TTFB 3–6 ms, and 392,749 transferred bytes.

| Metric | Budget | Before | After | Cause/interpretation |
| --- | ---: | ---: | ---: | --- |
| Largest Contentful Paint (LCP) | <= 2.5 s | 14.64 s | 2.94 s | The hero image was converted to WebP (about 2.33 MB to 108 KB); now much faster but still 0.44 s over budget |
| Interaction to Next Paint (INP) | <= 200 ms | Not reported | Not reported by navigation run | Search/checkout interactions require a separate interaction measurement |
| Cumulative Layout Shift (CLS) | <= 0.10 | 0.004 | 0.221 | Lighthouse reports one 0.221 shift whose trace event is marked `had_recent_input`; a clean fixed-viewport page-load observer recorded no input-independent shift. Treat the Lighthouse budget as failed pending field verification |
| Total Blocking Time (TBT) | <= 200 ms | 750 ms | 48 ms | Both after runs are below budget; WebP/lazy image delivery reduces image work, but a repeated baseline is needed to isolate causality |
| Document TTFB | <= 800 ms | 23 ms | 5 ms | Within budget in both runs |
| Transferred bytes | <= 400 KiB | 2,835 KiB | 383.5 KiB | WebP food imagery and smaller hero/social assets reduce transfer below budget |

Both baselines are single runs and are indicative, not statistical evidence.
The capstone's LCP and Lighthouse-reported CLS still miss their budgets; INP
was not measured by these navigation-only runs.
