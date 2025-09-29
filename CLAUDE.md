# CLAUDE.md - Project Architecture & Notes

## Project: M4M (Mathematics for Minecrafters)

### Overview
A single-page educational quiz application that teaches multiplication and division using Minecraft crafting recipes as the context.

---

## Architecture

### File Structure
```
/m4m
├── index.html      # Main UI structure with embedded CSS
├── app.js          # Quiz logic and state management
├── recipes.txt     # Minecraft crafting recipes data
├── PLAN.md         # Project specification
└── CLAUDE.md       # This file - architecture notes
```

### Technology Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Dependencies**: None (pure client-side)
- **Data Format**: Plain text file (`recipes.txt`)

---

## Key Components

### 1. Data Layer (`app.js`)

#### Recipe Format
```
X [Material] -> Y [Result] / [Image Src Url]
Example: 3 Wheat -> 1 Bread / craft_bread.png
```

#### Recipe Object Structure
```javascript
{
  ingredientCount: Number,    // Amount of ingredient needed
  ingredient: String,          // Name of ingredient
  resultCount: Number,         // Amount of result produced
  result: String              // Name of crafted item
  imgSrc: String,             // URL of image to show when recipe shown for question
}
```

#### Quiz State Object
```javascript
{
  mode: 'multiply' | 'divide',
  currentQuestion: Number,      // 0-indexed
  totalQuestions: 10,           // Fixed at 10
  questions: Array,             // Generated question objects
  userAnswers: Array,           // User's submitted answers
  correctAnswers: Array,        // Correct answers
  score: Number                 // Count of correct answers
}
```

### 2. Question Generation

#### Multiplication Mode
- **Formula**: `resultQuantity = resultCount × multiplier`
- **Answer**: `ingredientCount × multiplier`
- **Example**: "I have 4 Bread, and 3 Wheat make 1 Bread. How many Wheat did I need?"
  - Given: 4 Bread (result)
  - Recipe: 3 Wheat → 1 Bread
  - Answer: 4 × 3 = 12 Wheat

#### Division Mode
- **Formula**: `ingredientQuantity = ingredientCount × multiplier`
- **Answer**: `resultCount × multiplier`
- **Example**: "I have 12 Wheat, and 3 Wheat make 1 Bread. How many Bread can I make?"
  - Given: 12 Wheat (ingredient)
  - Recipe: 3 Wheat → 1 Bread
  - Answer: 12 ÷ 3 = 4 Bread

#### Multiplier Range
- Random integer between 2-10 (inclusive)
- Ensures variety without making math too difficult

### 3. User Interface

#### Three-Screen Flow
1. **Setup Screen**: Mode selection + Start button
2. **Quiz Screen**: Question display + Answer input + Feedback
3. **Results Screen**: Score + Wrong answers review + Retry button

#### Key UX Features
- Enter key support for answer submission
- Immediate feedback after each answer
- Answer input disabled after submission
- Progress indicator (Question X of 10)
- Wrong answers displayed at end for review

---

## Implementation Details

### Recipe Loading
- Asynchronous fetch from `recipes.txt`
- Regex parsing: `/(\d+)\s+(.+)/` for ingredient and result parts
- Filters out invalid/empty lines
- Error handling with user feedback

### Question Randomization
- Fisher-Yates shuffle (`sort(() => Math.random() - 0.5)`)
- Selects 10 random recipes per quiz
- No duplicate recipes in same quiz session

### Answer Validation
- `parseInt()` conversion with `isNaN()` check
- Strict equality comparison
- Alert for invalid input

### State Management
- Single global `quizState` object
- Screen transitions via CSS class toggling
- Progressive answer collection in arrays

---

## Styling Approach

### Design System
- **Colors**: Purple gradient (`#667eea` to `#764ba2`)
- **Typography**: Arial, sans-serif
- **Layout**: Centered card with box-shadow
- **Responsiveness**: Max-width 600px, fluid scaling

### Feedback Colors
- **Correct**: Green (`#d4edda` / `#155724`)
- **Incorrect**: Red (`#f8d7da` / `#721c24`)

### Interactive Elements
- Hover transform: `translateY(-2px)`
- Focus state for input with border color change
- Button gradient matching app theme

---

## Future Enhancement Ideas

1. **Difficulty Levels**
   - Easy: multipliers 2-5
   - Medium: multipliers 2-10 (current)
   - Hard: multipliers 5-20

2. **Timed Mode**
   - Add countdown timer per question
   - Track completion time

3. **Recipe Categories**
   - Filter by material type (Wood, Iron, Gold, etc.)
   - Progressive difficulty by recipe complexity

4. **Persistence**
   - LocalStorage for high scores
   - Quiz history tracking

5. **Accessibility**
   - ARIA labels
   - Keyboard navigation improvements
   - Screen reader support

6. **Visual Enhancements**
   - Minecraft-themed sprites/icons
   - Animation on correct/incorrect answers
   - Progress bar

---

## Testing Checklist

- [x] Recipe parsing from recipes.txt
- [x] Both multiplication and division modes
- [x] 10 questions per quiz
- [x] Answer validation
- [x] Enter key submission
- [x] Feedback display
- [x] Score calculation
- [x] Wrong answers review
- [x] Retry functionality
- [ ] Cross-browser testing
- [ ] Mobile responsiveness verification

---

## Notes

- Recipe file must be in same directory as HTML for fetch to work
- No backend required - fully client-side
- Can be deployed to any static hosting (GitHub Pages, Netlify, etc.)
- Math operations kept simple for educational target audience
- No external dependencies = fast load time and offline capability (after initial load)