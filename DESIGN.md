# SARAS palette wheel prototype

Question: can the existing wheel feel like a SARAS object through proportion, typography, geometry, and two colors, while retaining the centered wheel, side settings, and spin interaction?

The owner's direction is a restrained, tactile refinement. The owner selected composition B, requested the actual SARAS palette, and then explicitly requested custom confetti on landing. Existing wheel structure and functionality stay.

Dial: ENERGY 2 / RHYTHM 1 / MOTION 2.

Critical assessment before implementation:

- The prior six pastel segment colors diluted SARAS's identity and made the wheel read as a pie chart.
- A detached triangle pointer and flat hub did not describe a coherent physical object.
- The settings relied on a repeated outline-input pattern, competing with the wheel.
- Typography treated every wheel label as generic system UI instead of part of a printed face.

Decisions:

- Pink #E983A7 and cream #FFF8F1 are the app's actual sarasRose and sarasCream values, read from saras/Core/DesignSystem/Color+Saras.swift. Accessible rose #9D3E61 is the same file's sarasRoseDeep accessibleLight variant; neutral text #2B2125 is sarasText. These supporting values preserve the app's pink/cream identity without adding a competing accent hue.
- Alternating pink and cream wedges retain a restrained printed face. Neutral SARAS ink labels remain readable on both: cream on the original pink only provides 2.41:1, while ink on pink gives 6.14:1. The serif family echoes the wordmark.
- A thin, double-edged rim and a layered center cap describe the wheel's face, lip, and axle. Their shadows only show physical separation.
- The curved pointer borrows the existing mark's petal silhouette and has a small pivot attachment. It stays fixed while the wheel rotates; short deflections mark segment crossings.
- Radial text sits on each segment bisector, wraps to balanced lines, and is constrained inside the usable annulus. No decorative segment numbering is added.
- The side editor uses aligned underline fields and a quieter type hierarchy. It remains subordinate to the wheel and keeps visible labels.
- Composition B is selected and is the default: a full-width centered wheel and right settings drawer. A/C remain available only as comparison references in this prototype. This changes rendering, not probability, stock deduction, or handover behavior.
- A single push, sustained rotation, and eased deceleration communicate the spin. Pointer feedback stops with the wheel. Reduced motion skips the extended rotation and deflection.
- A custom 3.2-second confetti burst marks a newly landed prize. Rectangular pink, rose, and cream pieces launch from both sides, tumble under gravity, and clear themselves. The canvas sits in the result dialog's top layer with no pointer interception; prize text and controls paint above it. Reopening an existing result does not replay the effect. Closing or handing over stops it; reduced motion skips it entirely.
- Clipping the rotating SVG inside its circular frame prevents the invisible corners of its square bounds from expanding the mobile page after an angled landing.
- The original SARAS vector geometry is retained and recolored into the two approved base colors. The wordmark stays small; no marketing copy is introduced.
- The state inspector and bottom switcher belong to the local prototype reviewer, not the visitor's page. All inventory remains example data in memory.
