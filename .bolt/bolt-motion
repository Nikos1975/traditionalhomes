Implement the motion system using ONLY CSS + IntersectionObserver (NO GSAP, NO React).

Non-negotiable:
- Existing project is Astro + Tailwind + TypeScript. Do NOT convert frameworks. No React deps.
- Animate only transform and opacity.
- Respect prefers-reduced-motion: if reduced, reveal instantly and disable parallax/loops.

Deliverables:
1) Create src/utils/motion.ts exporting:
   - prefersReducedMotion(): boolean (matchMedia)
   - constants:
     ARRIVAL_TOTAL_MS=1500, STAGGER_MS=140, REVEAL_RISE_PX=10, REVEAL_DURATION_MS=900,
     HOVER_SCALE=1.02, PARALLAX_MAX_PCT=8, MOBILE_MULTIPLIER=0.7
   - helpers:
     staggerDelay(i:number): string, isMobile(): boolean, scaled(value:number): number

2) Create src/components/SectionReveal.astro:
   - Props: as?:string='section', once?:boolean=true, risePx?:number, threshold?:number
   - Output wrapper element with class "reveal" and data attributes
   - Inline <script> that attaches IntersectionObserver to this element only and toggles "is-visible"
   - Cleanup on unmount

3) Update src/styles/global.css:
   - Add .reveal and .reveal.is-visible with calm timing/easing
   - Add .arrival and .arrival.is-ready for hero staged reveal using transition-delay via CSS var
   - Add @media (prefers-reduced-motion: reduce) overrides to disable transitions and set opacity/transform to final

4) Apply it:
   - Home hero: add class "arrival" to hero container and set CSS vars (--d) on items for stagger
   - Collection cards: wrap grid section or cards with <SectionReveal> or add reveal class per card

Output:
- Provide file paths and full contents for new/changed files.
- Keep diffs minimal.
- Include a short tuning guide (durations, rise distance, threshold, stagger).