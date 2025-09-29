# M4M: Mathematics for Minecrafters Math Quiz - Project Plan

The title of the page should say M4M: Mathematics for Minecrafters at the top.

## Overview
A single-page, client-side JavaScript + HTML quiz application that teaches multiplication and division using Minecraft crafting recipes.

## Features

### 1. Mode Selection
- Dropdown menu to select quiz mode:
  - **Multiplication Mode**: Given a crafted item quantity, calculate ingredients needed
  - **Division Mode**: Given ingredients quantity, calculate craftable items

### 2. Quiz Question Format

**Multiplication Example:**
- Recipe: 3 Wheat → 1 Bread
- Question: "I have 4 Bread, and 3 Wheat make 1 Bread. How many Wheat did I need to make these 4 Bread? 4 × 3 = ?"
- Answer: 12

**Division Example:**
- Recipe: 3 Wheat → 1 Bread
- Question: "I have 12 Wheat, and 3 Wheat make 1 Bread. How many Bread can I make? 12 ÷ 3 = ?"
- Answer: 4

### 3. Quiz Flow
1. User selects mode from dropdown
2. Start quiz button appears
3. Quiz presents 10 questions (one at a time)
4. For each question:
   - Display question text
   - Show input box for answer
   - Submit button OR Enter key to check answer
   - Show feedback (correct/incorrect + correct answer if wrong)
   - Next question button appears
5. After 10 questions, show results summary
6. If any incorrect, show "Try Again" button

### 4. Question Generation
- Parse `recipes.txt` (format: `X [Material] -> Y [Result]`)
- For multiplication: multiply result quantity by random multiplier (2-10)
- For division: multiply ingredient quantity by random multiplier (2-10)
- Track which recipes used to avoid repeats in same quiz

## Technical Architecture

### Files
- `index.html` - Main structure
- `style.css` - Styling (optional inline styles)
- `app.js` - Quiz logic
- `recipes.txt` - Data source (already exists)

### Key Data Structures
```javascript
// Recipe object
{
  ingredientCount: 3,
  ingredient: "Wheat",
  resultCount: 1,
  result: "Bread"
}

// Quiz state
{
  mode: "multiply" | "divide",
  currentQuestion: 0,
  totalQuestions: 10,
  questions: [],
  answers: [],
  score: 0
}
```

### Core Functions
- `loadRecipes()` - Parse recipes.txt
- `generateQuestion(recipe, mode)` - Create math problem
- `checkAnswer(userAnswer, correctAnswer)` - Validate response
- `nextQuestion()` - Advance quiz
- `showResults()` - Display score summary

## UI Components
1. Mode selector dropdown
2. Start button
3. Question display area
4. Answer input field
5. Submit/Next buttons
6. Feedback message area
7. Results summary screen
8. Try again button

## Implementation Steps
1. Create HTML structure with all UI elements
2. Implement recipe parser
3. Build question generator for both modes
4. Add answer checking logic
5. Implement quiz flow state machine
6. Style the interface
7. Test with all recipes