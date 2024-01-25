let recipeForm, recipeName, ingredients, steps, imageInput, currentEditingId;

document.addEventListener('DOMContentLoaded', function() {
    recipeForm = document.getElementById('recipe-form');
    recipeName = document.getElementsByClassName('recipe-name')[0];
    ingredients = document.getElementsByClassName('ingredients')[0];
    steps = document.getElementsByClassName('steps')[0];
    imageInput = document.getElementsByClassName('image')[0];
    currentEditingId = null;

    recipeForm.addEventListener('submit', function(event) {
        event.preventDefault();

        let enteredRecipeName = recipeName.value;
        let enteredIngredients = ingredients.value;
        let enteredSteps = steps.value;
        let enteredImage = imageInput.value;

        if (enteredRecipeName.trim() === "" || enteredIngredients.trim() === "" || enteredSteps.trim() === "" || enteredImage.trim() === "") {
            alert("Please fill all fields!");
            return;
        }

        let recipeData = {
            name: enteredRecipeName,
            ingredients: enteredIngredients.split(',').map(ingredient => ingredient.trim()),
            steps: enteredSteps.split('.').map(step => step.trim()),
            img: enteredImage
        };

        if (currentEditingId === null) {
            addRecipe(recipeData);
        } else {
            updateRecipe(currentEditingId, recipeData);
        }
    });

    fetchRecipes();
});

function fetchRecipes() {
    fetch('http://127.0.0.1:8000/recipes')
        .then(response => response.json())
        .then(recipes => {
            const displayArea = document.querySelector('.recipes');
            displayArea.innerHTML = '';
            recipes.forEach(recipe => displayRecipe(recipe));
        })
        .catch(error => console.error('Error:', error));
}

function displayRecipe(recipe) {
    let recipeDiv = document.createElement('div');
    recipeDiv.className = 'recipe';
    recipeDiv.id = `recipe-${recipe.id}`;

    let recipeHeader = document.createElement('h2');
    recipeHeader.textContent = recipe.name;
    recipeDiv.appendChild(recipeHeader);

    let ingredientsList = document.createElement('ul');
    (recipe.ingredients || []).forEach(ingredient => {
        let li = document.createElement('li');
        li.textContent = ingredient;
        ingredientsList.appendChild(li);
    });
    recipeDiv.appendChild(ingredientsList);

    let stepsPara = document.createElement('p');
    stepsPara.textContent = "Steps: " + (recipe.steps || []).join('. ') + '.';
    recipeDiv.appendChild(stepsPara);

    if (recipe.img) {
        let image = document.createElement('img');
        image.src = recipe.img;
        image.alt = 'Recipe Image';
        recipeDiv.appendChild(image);
    }

    let editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.className = 'edit-button';
    editButton.onclick = function() {
        populateFormForEdit(recipe);
    };
    recipeDiv.appendChild(editButton);

    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-button';
    deleteButton.onclick = function() {
        deleteRecipe(recipe.id, recipeDiv);
    };
    recipeDiv.appendChild(deleteButton);

    let displayArea = document.querySelector('.recipes');
    displayArea.appendChild(recipeDiv);
}

function addRecipe(recipeData) {
    fetch('http://127.0.0.1:8000/recipes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData)
    })
    .then(response => response.json())
    .then(data => {
        fetchRecipes();
        resetForm();
    })
    .catch(error => console.error('Error:', error));
}

function updateRecipe(id, recipeData) {
    fetch(`http://127.0.0.1:8000/recipes/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData)
    })
    .then(response => response.json())
    .then(data => {
        fetchRecipes();
        resetForm();
    })
    .catch(error => console.error('Error:', error));
}

function deleteRecipe(recipeId, recipeDiv) {
    fetch(`http://127.0.0.1:8000/recipes/${recipeId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            recipeDiv.remove();
        } else {
            throw new Error('Deletion failed');
        }
    })
    .catch(error => console.error('Error:', error));
}

function populateFormForEdit(recipe) {
    recipeName.value = recipe.name;
    ingredients.value = recipe.ingredients.join(', ');
    steps.value = recipe.steps.join('. ');
    imageInput.value = recipe.img;
    currentEditingId = recipe.id;
}

function resetForm() {
    recipeName.value = '';
    ingredients.value = '';
    steps.value = '';
    imageInput.value = '';
    currentEditingId = null;
}
