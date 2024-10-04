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

// Counters for the total stacks and cases
let totalStacks = 0;
let totalCases = 0;

// Array to store planned stacks
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

  // Style the message
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

  // **Removed sorting to keep products together as much as possible**
  // If you still want to sort, consider sorting by name or another criterion
  // productsArray.sort((a, b) => b[1] - a[1]);

  // Create an array to represent the current stack
  let currentStack = [];
  let totalCasesInStack = 0;

  // Loop through the products and plan the stacks
  productsArray.forEach(([productName, quantity]) => {
    while (quantity > 0) {
      const remainingSpace = 6 - totalCasesInStack;

      if (quantity <= remainingSpace) {
        // If the entire quantity fits into the current stack
        currentStack.push({ product: productName, cases: quantity });
        totalCasesInStack += quantity;
        quantity = 0;
      } else {
        // If only part of the quantity fits, split the product
        if (remainingSpace > 0) {
          currentStack.push({ product: productName, cases: remainingSpace });
          quantity -= remainingSpace;
          totalCasesInStack += remainingSpace;
        }

        // Push the current stack to plannedStacks
        plannedStacks.push([...currentStack]);
        totalStacks += 1;
        totalCases += plannedStacks[plannedStacks.length - 1].reduce((sum, item) => sum + item.cases, 0);

        // Reset current stack and cases count for the new stack
        currentStack = [];
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

  // **Do not reset the form to keep the data visible**
  // orderForm.reset(); // Commented out to retain form data for verification
});

// Function to render the planned stacks in the UI
function renderPlannedStacks() {
  // Clear the existing product list to avoid duplicates
  productListElement.innerHTML = "";

  // Iterate over plannedStacks and create DOM elements
  plannedStacks.forEach((stack, index) => {
    const stackLi = document.createElement("li");
    stackLi.classList.add("stack");
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

// Add a click event listener to the "Clear All" button
clearButton.addEventListener("click", function () {
  // Display a confirmation dialog
  const isConfirmed = confirm("Are you sure you want to clear the form and stacks?");
  
  // Check if the user confirmed
  if (isConfirmed) {
    clearFormAndStacks();
  }
});

// Function to clear only the planned stacks
function clearStacks() {
  plannedStacks = [];
  totalStacks = 0;
  totalCases = 0;
  productListElement.innerHTML = "";
  updateDisplay();
}

// Add a click event listener to the "Clear Stacks" button
clearStacksButton.addEventListener("click", function () {
  // Display a confirmation dialog
  const isConfirmed = confirm("Are you sure you want to clear the planned stacks?");
  
  // Check if the user confirmed
  if (isConfirmed) {
    clearStacks();
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

// =====================
// Autofill with Delay
// =====================

// Function to delay the focus shift for double digits
function focusNextInputWithDelay(inputElement, delay = 300) {
  let timer;

  // Add event listener for input
  inputElement.addEventListener('input', function (e) {
    const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
    const index = inputs.indexOf(e.target);

    // Clear any existing timer to avoid multiple focus shifts
    clearTimeout(timer);

    // Only proceed if the current input is valid and part of the inputs array
    if (index > -1 && index < inputs.length - 1) {
      // Set a delay before moving focus
      timer = setTimeout(() => {
        // Check if the user has typed more digits than a single one before moving
        if (
          e.target.value.length >= 2 ||
          e.target.valueAsNumber >= 10 ||
          e.target.value === ''
        ) {
          inputs[index + 1].focus();
        }
      }, delay);
    }
  });
}

// Apply focusNextInputWithDelay to all input fields on the page
document.querySelectorAll('input[type="number"]').forEach((input) => {
  focusNextInputWithDelay(input);
});