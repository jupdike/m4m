// M4M: Mathematics for Minecrafters Quiz Application

// Global state
let recipes = [];
let quizState = {
    mode: 'multiply',
    currentQuestion: 0,
    totalQuestions: 10,
    questions: [],
    userAnswers: [],
    correctAnswers: [],
    score: 0
};

// Load recipes from recipes.txt
async function loadRecipes() {
    try {
        const response = await fetch('recipes.txt');
        const text = await response.text();

        recipes = text.split('\n')
            .filter(line => line.trim() && line.includes('->'))
            .map(line => {
                // Parse format: "3 Wheat -> 1 Bread"
                const parts = line.split('->');
                const ingredientPart = parts[0].trim();
                const resultPart = parts[1].trim();

                const ingredientMatch = ingredientPart.match(/(\d+)\s+(.+)/);
                const resultMatch = resultPart.match(/(\d+)\s+(.+)/);

                if (ingredientMatch && resultMatch) {
                    return {
                        ingredientCount: parseInt(ingredientMatch[1]),
                        ingredient: ingredientMatch[2],
                        resultCount: parseInt(resultMatch[1]),
                        result: resultMatch[2]
                    };
                }
                return null;
            })
            .filter(recipe => recipe !== null);

        console.log(`Loaded ${recipes.length} recipes`);
    } catch (error) {
        console.error('Error loading recipes:', error);
        alert('Failed to load recipes. Please ensure recipes.txt is in the same directory.');
    }
}

// Generate a quiz question based on recipe and mode
function generateQuestion(recipe, mode) {
    const multiplier = Math.floor(Math.random() * 9) + 2; // Random 2-10

    if (mode === 'multiply') {
        // Multiplication: Given result items, calculate ingredients needed
        const resultQuantity = recipe.resultCount * multiplier;
        const correctAnswer = recipe.ingredientCount * multiplier;

        return {
            text: `I have ${resultQuantity} ${recipe.result}, and ${recipe.ingredientCount} ${recipe.ingredient} make ${recipe.resultCount} ${recipe.result}. How many ${recipe.ingredient} did I need to make these ${resultQuantity} ${recipe.result}? ${resultQuantity} × ${recipe.ingredientCount} ÷ ${recipe.resultCount} = ?`,
            correctAnswer: correctAnswer,
            recipe: recipe
        };
    } else {
        // Division: Given ingredients, calculate craftable items
        const ingredientQuantity = recipe.ingredientCount * multiplier;
        const correctAnswer = recipe.resultCount * multiplier;

        return {
            text: `I have ${ingredientQuantity} ${recipe.ingredient}, and ${recipe.ingredientCount} ${recipe.ingredient} make ${recipe.resultCount} ${recipe.result}. How many ${recipe.result} can I make? ${ingredientQuantity} ÷ ${recipe.ingredientCount} = ?`,
            correctAnswer: correctAnswer,
            recipe: recipe
        };
    }
}

// Initialize quiz with random questions
function initializeQuiz(mode) {
    quizState.mode = mode;
    quizState.currentQuestion = 0;
    quizState.score = 0;
    quizState.questions = [];
    quizState.userAnswers = [];
    quizState.correctAnswers = [];

    // Select random recipes for the quiz
    const shuffledRecipes = [...recipes].sort(() => Math.random() - 0.5);
    const selectedRecipes = shuffledRecipes.slice(0, quizState.totalQuestions);

    // Generate questions
    quizState.questions = selectedRecipes.map(recipe => generateQuestion(recipe, mode));
    quizState.correctAnswers = quizState.questions.map(q => q.correctAnswer);
}

// Show specific screen
function showScreen(screenName) {
    document.querySelectorAll('.setup-screen, .quiz-screen, .results-screen').forEach(screen => {
        screen.classList.remove('active');
    });

    document.querySelector(`.${screenName}`).classList.add('active');
}

// Display current question
function displayQuestion() {
    const question = quizState.questions[quizState.currentQuestion];

    document.getElementById('question-number').textContent =
        `Question ${quizState.currentQuestion + 1} of ${quizState.totalQuestions}`;
    document.getElementById('question-text').textContent = question.text;
    document.getElementById('answer-input').value = '';
    document.getElementById('answer-input').focus();

    // Hide feedback and next button
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('submit-btn').classList.remove('hidden');
}

// Check user's answer
function checkAnswer() {
    const userAnswer = parseInt(document.getElementById('answer-input').value);
    const correctAnswer = quizState.questions[quizState.currentQuestion].correctAnswer;

    if (isNaN(userAnswer)) {
        alert('Please enter a valid number');
        return;
    }

    quizState.userAnswers.push(userAnswer);

    const feedbackEl = document.getElementById('feedback');
    feedbackEl.classList.remove('hidden');

    if (userAnswer === correctAnswer) {
        feedbackEl.textContent = 'Correct! ✓';
        feedbackEl.className = 'feedback correct';
        quizState.score++;
    } else {
        feedbackEl.textContent = `Incorrect. The correct answer is ${correctAnswer}.`;
        feedbackEl.className = 'feedback incorrect';
    }

    // Hide submit button, show next button
    document.getElementById('submit-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
    document.getElementById('answer-input').disabled = true;
}

// Move to next question or show results
function nextQuestion() {
    quizState.currentQuestion++;

    if (quizState.currentQuestion < quizState.totalQuestions) {
        document.getElementById('answer-input').disabled = false;
        displayQuestion();
    } else {
        showResults();
    }
}

// Display final results
function showResults() {
    showScreen('results-screen');

    const percentage = Math.round((quizState.score / quizState.totalQuestions) * 100);
    document.getElementById('final-score').textContent =
        `${quizState.score} / ${quizState.totalQuestions} (${percentage}%)`;

    // Show wrong answers if any
    const wrongAnswersSection = document.getElementById('wrong-answers-section');
    const wrongQuestions = [];

    quizState.questions.forEach((question, index) => {
        if (quizState.userAnswers[index] !== question.correctAnswer) {
            wrongQuestions.push({
                question: question.text,
                userAnswer: quizState.userAnswers[index],
                correctAnswer: question.correctAnswer
            });
        }
    });

    if (wrongQuestions.length > 0) {
        wrongAnswersSection.classList.remove('hidden');
        wrongAnswersSection.innerHTML = '<h3 style="margin-bottom: 15px;">Questions to Review:</h3>';

        wrongQuestions.forEach(item => {
            const div = document.createElement('div');
            div.className = 'wrong-answer-item';
            div.innerHTML = `
                <div style="margin-bottom: 8px;">${item.question}</div>
                <div style="color: #721c24;">Your answer: ${item.userAnswer}</div>
                <div style="color: #155724; font-weight: bold;">Correct answer: ${item.correctAnswer}</div>
            `;
            wrongAnswersSection.appendChild(div);
        });
    } else {
        wrongAnswersSection.classList.add('hidden');
    }
}

// Event listeners
document.getElementById('start-btn').addEventListener('click', async () => {
    if (recipes.length === 0) {
        await loadRecipes();
    }

    if (recipes.length === 0) {
        alert('No recipes available. Cannot start quiz.');
        return;
    }

    const mode = document.getElementById('mode-select').value;
    initializeQuiz(mode);
    showScreen('quiz-screen');
    displayQuestion();
});

document.getElementById('submit-btn').addEventListener('click', checkAnswer);

document.getElementById('answer-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (!document.getElementById('submit-btn').classList.contains('hidden')) {
            checkAnswer();
        } else if (!document.getElementById('next-btn').classList.contains('hidden')) {
            nextQuestion();
        }
    }
});

document.getElementById('next-btn').addEventListener('click', nextQuestion);

document.getElementById('retry-btn').addEventListener('click', () => {
    showScreen('setup-screen');
});

// Load recipes on page load
loadRecipes();