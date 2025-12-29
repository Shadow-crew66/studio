# **App Name**: Heart's Persuasion

## Core Features:

- Interactive Proposal: Presents an interactive proposal interface with 'Yes' and 'No' buttons.
- Guilt-Trip No Button: The 'No' button cycles through 5 stages of persuasive text, from 'Are you sure?' to 'Last chance!'.
- Progressive Button Growth: Each 'No' click increases the size of the 'Yes' button by 20% while the 'No' button repositions randomly.
- Disappearing 'No' Trick: After the 5th 'No,' the 'No' button vanishes, leaving a dominant 'Yes' button.
- Confetti Celebration: Clicking 'Yes' triggers a full-screen confetti cannon and changes the text to 'I knew you couldn't say no! ❤️'.
- Pulsing Animation: The screen pulses upon a 'Yes' response to enhance the celebratory effect.
- Emotional Response Tool: Uses AI to adapt button text and animation speeds based on emotional reactions, enhancing user engagement with persuasive visual feedback. The tool analyzes interactions to decide when to intensify visual effects.

## Style Guidelines:

- Primary color: Hot pink (#FF69B4) to represent love and excitement.
- Background color: Very light pink (#FEE9F2), close in hue to the primary, softly desaturated for a subtle backdrop, complimenting the primary color without overwhelming it. Creates a dreamy and inviting atmosphere.
- Accent color: Lavender (#E6E6FA) provides a soft, contrasting highlight that enhances the dreamy quality and supports a light and cheerful user experience.
- Font: 'Belleza' for headlines and short chunks of text; 'Alegreya' for any body text, for a modern and elegant feel.
- Central container using a glassmorphism style (semi-transparent blurred background).
- Utilize Framer Motion (or GSAP) logic for all animations, including the 'Bouncing Heart,' button transitions, and confetti effects.
- Implement a pulse effect for the entire screen upon 'Yes' selection.