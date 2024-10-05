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
const stacksLeftElement = document.getElementById("stacksLeft");
const totalCasesElement = document.getElementById("totalCases");

// Counters for the total stacks and cases
let totalStacks = 0;
let totalCases = 0;

// Array to store planned stacks
let plannedStacks = [];

// Add a submit event listener to the form
orderForm.addEventListener("submit", function(event) {
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
  palletizingMessage.style.color = requiresPalletizing ? "red" : "#333";

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

  // Sort the productsArray in descending order based on quantity to prioritize larger quantities
  productsArray.sort((a, b) => b[1] - a[1]);

  // Implement Best Fit Decreasing (BFD) algorithm
  productsArray.forEach(([productName, quantity]) => {
      while (quantity > 0) {
          // Find the stack with the least remaining space that can accommodate the product
          let bestFitIndex = -1;
          let minRemainingSpace = Infinity;

          plannedStacks.forEach((stack, index) => {
              // Calculate the total cases in the current stack
              const stackTotal = stack.reduce((sum, item) => sum + item.cases, 0);
              const remainingSpace = 6 - stackTotal;

              // Check if the stack can accommodate the product without exceeding the limit
              if (remainingSpace >= quantity && remainingSpace < minRemainingSpace) {
                  bestFitIndex = index;
                  minRemainingSpace = remainingSpace;
              }
          });

          if (bestFitIndex !== -1) {
              // Place the product in the best fit stack
              plannedStacks[bestFitIndex].push({ product: productName, cases: quantity });
              totalCases += quantity;
              totalStacks = plannedStacks.length;
              quantity = 0; // All cases allocated
          } else {
              if (quantity >= 6) {
                  // Allocate a full stack for this product
                  plannedStacks.push([{ product: productName, cases: 6 }]);
                  totalCases += 6;
                  totalStacks = plannedStacks.length;
                  quantity -= 6;
              } else {
                  // Try to place as much as possible in an existing stack
                  let placed = false;
                  plannedStacks.forEach((stack) => {
                      const stackTotal = stack.reduce((sum, item) => sum + item.cases, 0);
                      const remainingSpace = 6 - stackTotal;

                      if (remainingSpace > 0 && remainingSpace >= quantity) {
                          stack.push({ product: productName, cases: quantity });
                          totalCases += quantity;
                          totalStacks = plannedStacks.length;
                          quantity = 0;
                          placed = true;
                      }
                  });

                  if (!placed) {
                      // Create a new stack for the remaining cases
                      plannedStacks.push([{ product: productName, cases: quantity }]);
                      totalCases += quantity;
                      totalStacks = plannedStacks.length;
                      quantity = 0;
                  }
              }
          }
      }
  });

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
          productLi.textContent = `${item.product}: ${item.cases} case(s)`;
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
      button.addEventListener("click", function() {
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
  stacksLeftElement.textContent = totalStacks;
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
clearButton.addEventListener("click", function() {
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
clearStacksButton.addEventListener("click", function() {
  // Display a confirmation dialog
  const isConfirmed = confirm("Are you sure you want to clear the planned stacks?");

  // Check if the user confirmed
  if (isConfirmed) {
      clearStacks();
  }
});

// =====================
// Autofill with Delay
// =====================

// Function to delay the focus shift for double digits
function focusNextInputWithDelay(inputElement, delay = 300) {
  let timer;

  // Add event listener for input
  inputElement.addEventListener('input', function(e) {
      const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
      const index = inputs.indexOf(e.target);

      // Clear any existing timer to avoid multiple focus shifts
      clearTimeout(timer);

      // Only proceed if the current input is valid and part of the range
      if (e.target.value.length === 2 && index !== -1 && index < inputs.length - 1) {
          timer = setTimeout(() => {
              // Focus on the next input field
              inputs[index + 1].focus();
          }, delay);
      }
  });
}

// Add autofill listeners to each number input field
const numberInputs = document.querySelectorAll('input[type="number"]');
numberInputs.forEach((input) => focusNextInputWithDelay(input));

// =====================
// Mouse Over Stack
// =====================

const stacks = document.querySelectorAll('.stack');

stacks.forEach((stack) => {
    stack.addEventListener('mouseover', function() {
        this.style.backgroundColor = 'lightgray'; // Change background color on hover
    });

    stack.addEventListener('mouseout', function() {
        this.style.backgroundColor = ''; // Reset background color when not hovering
    });
});
