# Krypton Specification: Dynamic Solar Theming (SPEC-004)

## Objective
Implement zero-latency solar color morphing between sunset and sunrise in Twominal Code.

## Architecture
- **Provider:** Integrated into Twominal UI Shell & GPUI palette shaders.
- **Trigger:** System geocoding / local clock interpolation.
- **States:**
  1. *Morning Glow:* (06:00 - 08:30) Warm amber light accents.
  2. *Solar Noon:* (08:30 - 17:30) Ultra-crisp high contrast light theme.
  3. *Golden Sunset:* (17:30 - 19:30) Low-blue spectrum dusk palette.
  4. *Deep Midnight:* (19:30 - 06:00) Obsidian zinc & neon luminescence.

## Acceptance Criteria
- [x] Zero frame-drop during smooth palette morphing.
- [x] Full font ligature preservation during shader swaps.
- [x] ACP agent state persists uninterrupted across theme switches.
