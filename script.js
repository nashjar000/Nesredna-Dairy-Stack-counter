// Function to check if the order number requires palletizing
function checkPalletOrder(orderNumber) {
  const palletOrderNumbers = ["102", "106", "143", "163", "169"];
  return palletOrderNumbers.includes(orderNumber);
}

// Get references to DOM elements
const orderForm = document.getElementById("orderForm");
const palletizingMessage = document.getElementById("palletizingMessage");
const productListElement = document.getElementById("productList");
const clearButton = document.getElementById("clearButton");
const clearStacksButton = document.getElementById("clearStacksButton");
const applyMissingCasesButton = document.getElementById("applyMissingCasesButton");
const missingCasesInput = document.getElementById("missingCases");

// Create counters for the total stacks and cases
let totalStacks = 0;
let totalCases = 0;

// Create an array to store planned stacks
let plannedStacks = [];

// Add a submit event listener to the form
orderForm.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent the form from submitting

  // Get the order number from the input field
  const orderNumberInput = document.getElementById("orderNumber");
  const orderNumber = orderNumberInput.value.trim();

  // Check if the order requires palletizing
  const requiresPalletizing = checkPalletOrder(orderNumber);

  // Display palletizing message
  palletizingMessage.textContent = requiresPalletizing
    ? "This order NEEDS palletizing."
    : "This order does NOT require palletizing.";

  // Add style
  palletizingMessage.style.color = requiresPalletizing ? "red" : "black";

  // Show alert if palletizing is needed
  if (requiresPalletizing) {
    alert("This load needs palletizing!");
  }

  // Define an object to store product names and their quantities
  const productQuantities = {};

  // Loop through each input field in the form and store the quantity in the object
  const inputs = orderForm.querySelectorAll("input[type='number']");
  inputs.forEach((input) => {
    const productName = input.name;
    const quantity = parseInt(input.value, 10);
    if (!isNaN(quantity) && quantity > 0) {
      productQuantities[productName] = quantity;
    }
  });

  // Convert productQuantities to an array of [productName, quantity] pairs
  let productsArray = Object.entries(productQuantities);

  // Sort the productsArray in descending order based on quantity
  productsArray.sort((a, b) => b[1] - a[1]);

  // Create an array to represent the current stack
  const currentStack = [];
  let totalCasesInStack = 0;

  // Loop through the sorted product quantities and plan the stacks
  productsArray.forEach(([productName, quantity]) => {
    while (quantity > 0) {
      // Check if adding this product will exceed the maximum cases per stack
      if (totalCasesInStack + quantity <= 6) {
        currentStack.push({ product: productName, cases: quantity });
        totalCasesInStack += quantity;
        quantity = 0;
      } else {
        // If adding the product exceeds the maximum cases, start a new stack
        const casesToAdd = 6 - totalCasesInStack;
        if (casesToAdd > 0) {
          currentStack.push({ product: productName, cases: casesToAdd });
          quantity -= casesToAdd;
          totalCasesInStack += casesToAdd;
        }

        // Push the current stack to plannedStacks
        plannedStacks.push([...currentStack]);
        totalStacks += 1;
        totalCases += plannedStacks[plannedStacks.length - 1].reduce((sum, item) => sum + item.cases, 0);

        // Reset current stack and cases count for the new stack
        currentStack.length = 0;
        totalCasesInStack = 0;
      }
    }
  });

  // If there are any remaining products in the current stack, add it to planned stacks
  if (currentStack.length > 0) {
    plannedStacks.push([...currentStack]);
    totalStacks += 1;
    totalCases += plannedStacks[plannedStacks.length - 1].reduce((sum, item) => sum + item.cases, 0);
  }

  // Display the planned stacks and "Grab" button for each stack
  renderPlannedStacks();

  // Update the display of total cases and stacks
  updateDisplay();

  // Optionally, reset the form after submission
  orderForm.reset();
});

// Function to render the planned stacks in the UI
function renderPlannedStacks() {
  // Clear the existing product list to avoid duplicates
  productListElement.innerHTML = "";

  // Iterate over plannedStacks and create DOM elements
  plannedStacks.forEach((stack, index) => {
    const stackLi = document.createElement("li");
    stackLi.setAttribute("data-index", index); // Set data attribute for reference

    // Create a list of products for each stack
    const productUl = document.createElement("ul");
    stack.forEach((item) => {
      const productLi = document.createElement("li");
      productLi.textContent = `${item.product}: ${item.cases} cases`;
      productUl.appendChild(productLi);
    });

    // Create a "Grab" button for each stack
    const grabButton = document.createElement("button");
    grabButton.textContent = "Grab";
    grabButton.classList.add("grab-button");
    grabButton.setAttribute("data-index", index); // Set data attribute for reference

    // Append the product list and grab button to the stack list item
    stackLi.appendChild(productUl);
    stackLi.appendChild(grabButton);

    // Append the stack list item to the product list
    productListElement.appendChild(stackLi);
  });

  // Attach event listeners to all grab buttons
  attachGrabButtonListeners();
}

// Function to attach event listeners to grab buttons
function attachGrabButtonListeners() {
  const grabButtons = document.querySelectorAll(".grab-button");
  grabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"), 10);
      if (!isNaN(index) && index >= 0 && index < plannedStacks.length) {
        // Remove the stack from plannedStacks
        const removedStack = plannedStacks.splice(index, 1)[0];
        totalStacks -= 1;
        totalCases -= removedStack.reduce((sum, item) => sum + item.cases, 0);

        // Update the display
        updateDisplay();

        // Re-render the stacks to update indices
        renderPlannedStacks();
      }
    });
  });
}

// Function to update the display of total cases and stacks
function updateDisplay() {
  const totalStacksElement = document.getElementById("stacksLeft");
  totalStacksElement.textContent = totalStacks;

  const totalCasesElement = document.getElementById("totalCases");
  totalCasesElement.textContent = totalCases;
}

// Function to clear the form and stacks
function clearFormAndStacks() {
  // Reset the form
  orderForm.reset();

  // Clear the planned stacks
  plannedStacks = [];

  // Clear the productList element
  productListElement.innerHTML = "";

  // Reset total stacks and total cases
  totalStacks = 0;
  totalCases = 0;

  // Update the display
  updateDisplay();
}

// Add a click event listener to the clear button
clearButton.addEventListener("click", function () {
  // Display a confirmation dialog
  const isConfirmed = confirm("Are you sure you want to clear the form and stacks?");
  
  // Check if the user confirmed
  if (isConfirmed) {
    clearFormAndStacks();
  }
});

// Add a click event listener to the clear stacks button
clearStacksButton.addEventListener("click", function () {
  // Display a confirmation dialog
  const isConfirmed = confirm("Are you sure you want to clear the planned stacks?");
  
  // Check if the user confirmed
  if (isConfirmed) {
    // Clear the planned stacks
    plannedStacks.length = 0;

    // Clear the productList element
    productListElement.innerHTML = "";

    // Reset total stacks and total cases
    totalStacks = 0;
    totalCases = 0;

    // Update the display
    updateDisplay();
  }
});

// Function for autofill to go down the list 
document.addEventListener('input', function (e) {
  if (e.target.tagName.toLowerCase() === 'input' && e.target.type === 'number') {
    var inputs = Array.from(document.querySelectorAll('input[type="number"]'));
    var index = inputs.indexOf(e.target);
    if (index > -1 && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  }
});

// =====================
// Missing Cases Feature
// =====================

// Add a click event listener to the "Apply Missing Cases" button
applyMissingCasesButton.addEventListener("click", function () {
  const missingCasesValue = parseInt(missingCasesInput.value, 10);

  if (isNaN(missingCasesValue) || missingCasesValue <= 0) {
    alert("Please enter a valid number of missing cases.");
    return;
  }

  if (missingCasesValue > totalCases) {
    alert("Missing cases exceed the total number of cases.");
    return;
  }

  let casesToSubtract = missingCasesValue;

  // Iterate through the plannedStacks in reverse order to subtract cases from the last stacks first
  for (let i = plannedStacks.length - 1; i >= 0 && casesToSubtract > 0; i--) {
    const stack = plannedStacks[i];
    for (let j = stack.length - 1; j >= 0 && casesToSubtract > 0; j--) {
      const product = stack[j];
      if (product.cases <= casesToSubtract) {
        casesToSubtract -= product.cases;
        // Remove the product from the stack
        stack.splice(j, 1);
      } else {
        // Subtract the remaining cases from this product
        product.cases -= casesToSubtract;
        casesToSubtract = 0;
      }
    }

    // If the stack is empty after subtraction, remove it from plannedStacks
    if (stack.length === 0) {
      plannedStacks.splice(i, 1);
      totalStacks -= 1;
    }
  }

  // Update the total cases
  totalCases -= missingCasesValue;

  // Update the display
  updateDisplay();

  // Re-render the stacks to reflect changes
  renderPlannedStacks();

  // Reset the missing cases input
  missingCasesInput.value = 0;

  alert(`Successfully subtracted ${missingCasesValue} missing cases from the remaining stacks.`);
});
