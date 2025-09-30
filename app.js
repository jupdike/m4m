// M4M: Mathematics for Minecrafters Quiz Application

// Global state
let recipes = [];
let addRecipes = [];
let quizState = {
    mode: 'multiply',
    currentQuestion: 0,
    totalQuestions: 10,
    questions: [],
    userAnswers: [],
    correctAnswers: [],
    score: 0
};

function textBlockToRecipesArray(text) {
    return text.split('\n')
        .filter(line => line.trim() && line.includes('->'))
        .map(line => {
            // Parse format: "3 Wheat -> 1 Bread"
            const extraParts = line.split('/').map(x => x.trim());
            const lhs = extraParts[0];
            const imgsrc = extraParts[1];
            const parts = lhs.split('->');
            let ingredientPart = parts[0].trim();
            if (ingredientPart.endsWith('s')) {
                ingredientPart = ingredientPart.slice(0, -1);
            }
            const resultPart = parts[1].trim();

            const ingredientMatch = ingredientPart.match(/(\d+)\s+(.+)/);
            const resultMatch = resultPart.match(/(\d+)\s+(.+)/);

            if (ingredientMatch && resultMatch) {
                return {
                    ingredientCount: parseInt(ingredientMatch[1]),
                    ingredient: ingredientMatch[2],
                    imgsrc: imgsrc,
                    resultCount: parseInt(resultMatch[1]),
                    result: resultMatch[2]
                };
            }
            return null;
        })
        .filter(recipe => recipe !== null);
}

// Load recipes from recipes.txt
async function loadRecipes() {
    try {
        // cf. https://www.minecraftcrafting.info/
        const response = await fetch('recipes.txt');
        const text = await response.text();
        recipes = textBlockToRecipesArray(text);
        console.log(`Loaded ${recipes.length} recipes`);

        const response2 = await fetch('add-recipes.txt');
        const text2 = await response2.text();
        addRecipes = textBlockToRecipesArray(text2);
        console.log(`Loaded ${addRecipes.length} addition/substraction recipes`);
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
            text: `I have ${resultQuantity} ${recipe.result}s, and ${recipe.ingredientCount} ${recipe.ingredient}s make ${recipe.resultCount} ${recipe.result}. How many ${recipe.ingredient}s did I need? ${resultQuantity} × ${recipe.ingredientCount} = ?`,
            correctAnswer: correctAnswer,
            recipe: recipe
        };
    } else if (mode == 'divide') {
        // Division: Given ingredients, calculate craftable items
        const ingredientQuantity = recipe.ingredientCount * multiplier;
        const correctAnswer = recipe.resultCount * multiplier;

        return {
            text: `I have ${ingredientQuantity} ${recipe.ingredient}s, and ${recipe.ingredientCount} ${recipe.ingredient}s make ${recipe.resultCount} ${recipe.result}. How many ${recipe.result}s can I make? ${ingredientQuantity} ÷ ${recipe.ingredientCount} = ?`,
            correctAnswer: correctAnswer,
            recipe: recipe
        };
    }
}

// Function to extend Array prototype for random choice
Array.prototype.chooseOneRandom = function() {
    return this[Math.floor(Math.random() * this.length)];
};

// Generate addition and subtraction questions
function getAddSubQuestions(mode, totalQuestions) {
    const questions = [];
    for (let i = 0; i < totalQuestions; i++) {
        questions.push(getAddSubQuestion(mode));
    }
    return questions;
}
function getResultText(recipe) {
    if (recipe.resultCount > 1) {
        return `some ${recipe.result}`.replace(/ss and/g, 's and').replace(/ss./g, 's.');
    }
    if ('aeiou'.includes(recipe.result[0].toLowerCase())) {
        return `an ${recipe.result}`;
    }
    return `a ${recipe.result}`;
}

function getAddSubQuestion(mode) {
    const isAddition = mode.startsWith('add');
    if (mode === 'add10' || mode === 'add20') {
        // Addition question
        let numberLeft, numberRight, leftRecipe, rightRecipe, numberTotal, correctAnswer;
        const maxNumber = mode.endsWith('20') ? 18 : 10; // technically up to 18 for addition to stay within 20
        do {
            numberTotal = Math.floor(Math.random() * (maxNumber - 1)) + 2; // Random 2 to maxNumber
            console.log("numberTotal:", numberTotal);
            numberLeft = Math.floor(Math.random() * (numberTotal - 1)) + 1; // Random 1 to numberTotal-1
            console.log("numberLeft:", numberLeft);
            numberRight = numberTotal - numberLeft;
            console.log("numberRight:", numberRight);
            correctAnswer = isAddition ? numberTotal : numberLeft; // TODO fix this for subtraction
            leftRecipe = addRecipes.filter(r => r.ingredientCount === numberLeft).chooseOneRandom();
            console.log("leftRecipe:", leftRecipe);
            rightRecipe = addRecipes.filter(r => r.ingredientCount === numberRight).chooseOneRandom();
        } while (!leftRecipe || !rightRecipe || leftRecipe === rightRecipe);
        console.log("rightRecipe:", rightRecipe);
        let leftResult = getResultText(leftRecipe);
        let rightResult = getResultText(rightRecipe);
        return {
            text: `I want to make ${leftResult} and ${rightResult}. I need ${leftRecipe.ingredientCount} ${leftRecipe.ingredient}s and ${rightRecipe.ingredientCount} ${rightRecipe.ingredient}s. How many total ${leftRecipe.ingredient}s do I need? ${numberLeft} + ${numberRight} = ?`.replace(/1 Iron Ingots/g, '1 Iron Ingot'),
            correctAnswer: correctAnswer,
            recipe: leftRecipe,
            recipe2: rightRecipe
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

    if (mode === 'multiply' || mode === 'divide') {
        // Select random recipes for the quiz
        const shuffledRecipes = [...recipes].sort(() => Math.random() - 0.5);
        const selectedRecipes = shuffledRecipes.slice(0, quizState.totalQuestions);

        // Generate questions
        quizState.questions = selectedRecipes.map(recipe => generateQuestion(recipe, mode));
        quizState.correctAnswers = quizState.questions.map(q => q.correctAnswer);
    }
    else if (mode === 'add10' || mode === 'add20' || mode === 'sub10' || mode === 'sub20') {
        quizState.questions = getAddSubQuestions(mode, quizState.totalQuestions);
        quizState.correctAnswers = quizState.questions.map(q => q.correctAnswer);
    }
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
    let imgHtml = `<img src="./assets/${question.recipe.imgsrc}" />`;
    if (question.recipe2) {
        imgHtml += `<img src="./assets/${question.recipe2.imgsrc}" />`;
    }
    document.getElementById('question-image').innerHTML = imgHtml;
    document.getElementById('question-text').innerHTML = question.text.replace(/[?][ ]/g, '?<br/>');
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
}

// Move to next question or show results
function nextQuestion() {
    quizState.currentQuestion++;

    if (quizState.currentQuestion < quizState.totalQuestions) {
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
    document.getElementById('header').style.display = "none";
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
    document.getElementById('header').style.display = "block";
    showScreen('setup-screen');
});

// Load recipes on page load
loadRecipes();
