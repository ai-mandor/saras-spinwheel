# SARAS showcase spinwheel

Brand source: the existing SARAS iOS app, `Core/DesignSystem/Color+Saras.swift`, and the existing SARAS vector logo in `Desktop/DESAIN/Saras Logo.svg`.

Audience: showcase visitors sharing a supervised booth device, with a separate staff dialog for remaining inventory.

Dial: ENERGY 2 / RHYTHM 2 / MOTION 2.

- Pink and cream preserve SARAS's existing identity. Deep rose is used for text and the primary action to meet contrast requirements.
- A fixed light theme matches the existing SARAS reference and keeps a supervised event screen legible in a bright venue.
- Georgia's rounded serif forms complement the existing maternal brand; system sans keeps instructions and controls readable without network font requests.
- The wheel occupies the main visual area because spinning is the visitor's task. On phones, the introduction, wheel, and prize list stack in that order.
- Cream and blush segments make each outcome readable. Dark ink is used on every segment. Exhausted outcomes are grey and explicitly labelled.
- Shadow is limited to the physical wheel and its hub to separate the rotating face from the fixed pointer.
- Wheel rotation communicates selection. Confetti only accompanies a completed draw. Reduced motion replaces rotation with a short transition and suppresses confetti.
- The native dialogs provide keyboard focus containment and Escape handling. Closing the result preserves the draw until staff confirms handover.
- All initial merchandise and quantities are example data, labelled as such. They do not represent confirmed event inventory.
