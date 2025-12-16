# Planning Guide

A mobile-first interactive game where players press and hold a capybara to watch their money grow, then watch it drain when they let go - creating a suspenseful balance between greed and caution.

**Experience Qualities**: 
1. **Playful** - The game should feel lighthearted and fun with animated feedback that delights users
2. **Tense** - The rapid money drain creates excitement and risk/reward decision making
3. **Visceral** - Immediate tactile feedback with smooth animations makes interactions feel satisfying

**Complexity Level**: Light Application (multiple features with basic state)
This is a single-screen game with touch interactions, animated score display, particle effects, and persistent high score tracking.

## Essential Features

### Money Counter with Pinball Animation
- **Functionality**: Displays current money amount with animated digit transitions
- **Purpose**: Creates visual excitement and makes score changes feel impactful
- **Trigger**: Money value changes (increase or decrease)
- **Progression**: Value changes → Digits animate with inertia/easing → Smooth transition to new value
- **Success criteria**: Numbers should animate smoothly with slight overshoot/bounce, mimicking mechanical pinball counters

### Press and Hold Money Generation
- **Functionality**: Money increases while user touches/holds the capybara
- **Purpose**: Core game mechanic - rewards sustained interaction
- **Trigger**: User presses down on capybara (touch or mouse)
- **Progression**: Press down → Capybara switches to happy image → Money starts increasing → Particle effects spawn → Release → Stop increasing
- **Success criteria**: Immediate visual feedback, smooth money increment, responsive to both touch and mouse events

### Rapid Money Drain
- **Functionality**: Money decreases quickly when not holding capybara
- **Purpose**: Creates tension and risk/reward gameplay
- **Trigger**: User releases the capybara
- **Progression**: Release → Capybara switches to unhappy image → Particles stop → Money rapidly decreases → Game over at $0
- **Success criteria**: Drain rate should be significantly faster than gain rate to create urgency

### Power-Up System
- **Functionality**: Collectible power-ups spawn randomly on screen, providing temporary boosts when collected
- **Purpose**: Adds strategic depth, excitement, and variety to gameplay
- **Trigger**: Power-ups spawn automatically every 8 seconds during gameplay
- **Progression**: Power-up spawns → Floats and glows on screen → User clicks/taps to collect → Temporary boost applied → Effect expires after duration
- **Success criteria**: 
  - Four power-up types: 2x Multiplier (common), 3x Turbo (uncommon), Shield (rare - stops drain), 5x Mega (very rare)
  - Power-ups despawn after 6 seconds if not collected
  - Multiple power-ups can stack multiplicatively
  - Visual indicators show active power-ups with countdown timers
  - Toast notifications confirm collection

### Particle Effect System
- **Functionality**: Money sign particles emit from capybara during interaction
- **Purpose**: Provides satisfying visual feedback for successful money generation
- **Trigger**: While user is pressing the capybara
- **Progression**: Press → Particles spawn continuously → Float upward with random spread → Fade out
- **Success criteria**: Smooth particle animation, good performance on mobile

### High Score Persistence
- **Functionality**: Tracks and displays the highest money amount achieved
- **Purpose**: Gives players a goal to beat across sessions
- **Trigger**: When current money exceeds previous high score
- **Progression**: Money increases → Exceeds high score → New high score saves → Persists between sessions
- **Success criteria**: High score should persist using useKV hook

## Edge Case Handling
- **Game Over State**: When money reaches $0, display restart option with encouraging message
- **Touch vs Mouse**: Support both touch events (mobile) and mouse events (desktop) seamlessly
- **Rapid Tapping**: Prevent exploit by ensuring money always drains when not held continuously
- **Tab Switching**: Pause money drain when tab loses focus to prevent unfair losses
- **Starting Amount**: Always start at $1,000,000 for new sessions
- **Power-Up Stacking**: Multiple power-ups of same or different types can be active simultaneously with multiplicative effects
- **Power-Up During Game Over**: All power-ups cleared and spawning stopped when game ends
- **Shield Power-Up**: Prevents money drain completely while active, allowing strategic rest periods

## Design Direction
The design should evoke a playful arcade aesthetic with a retro-futuristic twist - think neon colors, bold typography, and smooth animations that feel premium and polished. The capybara is the star, so the design should frame it prominently while making the money counter feel like a dramatic scoreboard.

## Color Selection
A vibrant, energetic palette that feels like a modern arcade game with high contrast for mobile readability.

- **Primary Color**: Electric Blue (oklch(0.65 0.19 240)) - Represents money/wealth, conveys digital energy
- **Secondary Colors**: Deep Purple (oklch(0.35 0.15 285)) for background depth, Bright Cyan (oklch(0.8 0.15 195)) for accents
- **Accent Color**: Neon Green (oklch(0.85 0.2 135)) - Money/success indicators, particle effects, attention-grabbing for gain states
- **Destructive**: Hot Pink (oklch(0.65 0.25 350)) - Used for money drain states and warnings
- **Foreground/Background Pairings**: 
  - Background Deep Purple (oklch(0.35 0.15 285)): White text (oklch(0.98 0 0)) - Ratio 8.2:1 ✓
  - Primary Electric Blue (oklch(0.65 0.19 240)): White text (oklch(0.98 0 0)) - Ratio 5.1:1 ✓
  - Accent Neon Green (oklch(0.85 0.2 135)): Dark Purple (oklch(0.25 0.1 285)) - Ratio 9.5:1 ✓

## Font Selection
Bold, impactful typography that feels game-like and reads clearly on mobile screens.

- **Primary Font**: "Russo One" - Bold, futuristic display font perfect for the money counter and game title
- **Secondary Font**: "Space Grotesk" - Clean, technical sans-serif for secondary text and UI elements

**Typographic Hierarchy**: 
- H1 (Money Counter): Russo One Bold/56px/tight letter-spacing (-0.02em)
- H2 (High Score): Russo One Regular/24px/normal
- Body (Instructions): Space Grotesk Medium/16px/relaxed (1.5 line-height)
- Small (Game Over): Space Grotesk Regular/14px/normal

## Animations
Animations should feel snappy and arcade-like with exaggerated easing for a playful, game-like quality.

- **Money Counter**: Use spring physics with slight overshoot for digit changes, stagger individual digit animations for rolling effect
- **Capybara Press**: Scale down 95% on press with elastic ease-out, scale back up with bounce on release (150ms)
- **Particles**: Float upward with random horizontal drift, fade opacity from 1 to 0 over 1.2s, slight rotation
- **Game Over**: Fade in overlay with scale animation (starts at 90%, scales to 100%)
- **Page Load**: Capybara bounces in with elastic ease, counter slides down from top

## Component Selection
- **Components**: 
  - Button (Shadcn) - For restart/reset actions with custom neon styling
  - Card (Shadcn) - For high score display, active power-ups, and game over modal with glass morphism effect
  - No complex forms needed - this is gesture-driven gameplay
  
- **Customizations**: 
  - Custom AnimatedCounter component using framer-motion for pinball-style number rolling
  - Custom ParticleSystem component with canvas or CSS transforms for money particles
  - Custom CapybaraButton component handling touch/mouse states with image switching
  - Custom PowerUp component for collectible power-ups with floating animations and glow effects
  - Custom ActivePowerUps component displaying current active boosts with countdown timers
  
- **States**: 
  - Capybara: Default (not_happy.png), Pressed (happy.png) with scale transform
  - Money Counter: Idle, Increasing (green tint), Decreasing (pink tint), GameOver
  - Buttons: Default, Hover (glow effect), Active (scale down), Disabled (reduced opacity)
  - Power-Ups: Spawning (scale in with rotation), Idle (floating bob animation), Collecting (scale out), Despawning (fade out)
  - Active Power-Ups: Indicator cards with icon, label, and progress bar showing remaining time
  
- **Icon Selection**: 
  - Trophy icon for high score display
  - Play/Restart icon for game reset
  - Sparkles icon for particle effects indication
  - Lightning icon for 2x multiplier power-up
  - Rocket icon for 3x turbo power-up
  - Sparkle icon for shield power-up
  - Fire icon for 5x mega power-up
  
- **Spacing**: 
  - Container padding: p-6 on mobile, p-8 on tablet+
  - Element gaps: gap-4 for compact grouping, gap-8 for section separation
  - Capybara margin: my-8 for breathing room
  - Counter to capybara: gap-12 for clear hierarchy
  - Power-up indicators: gap-2 in vertical stack, top-20 below high score
  
- **Mobile**: 
  - Stack layout (flex-col) throughout
  - Large touch target for capybara (min 200px on small screens, scales up to 400px on larger)
  - Large touch targets for power-ups (min 64px) with extra padding
  - Fixed positioning for high score in top-right corner
  - Fixed positioning for active power-ups below high score
  - Full-width buttons at bottom for easy thumb reach
  - Prevent text selection and touch callouts for game-like feel
  - Lock viewport zoom to prevent accidental zooming during gameplay
  - Power-ups positioned in safe zones avoiding UI overlap
