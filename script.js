document.addEventListener("DOMContentLoaded", () => {
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
  const stackHeightInput = document.getElementById("stackHeight");

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
    palletizingMessage.style.color = requiresPalletizing ? "red" : "#333";

    // Show alert if palletizing is needed
    if (requiresPalletizing) {
      alert("This load needs palletizing!");
    }

    // Get the desired stack height from the input
    const stackHeight = parseInt(stackHeightInput.value, 10) || 6; // Default to 6 if invalid

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

    // Sort the productsArray to prioritize larger quantities and full stacks first
    productsArray.sort((a, b) => {
      const aFullStacks = Math.floor(a[1] / stackHeight);
      const bFullStacks = Math.floor(b[1] / stackHeight);
      // First, sort by full stacks (descending), then by remaining cases (descending)
      return bFullStacks - aFullStacks || b[1] - a[1];
    });

    // Reset planned stacks and counters
    plannedStacks = [];
    totalStacks = 0;
    totalCases = 0;

    // Implement Best Fit Decreasing (BFD) algorithm
    productsArray.forEach(([productName, quantity]) => {
      while (quantity > 0) {
        // Find the stack with the least remaining space that can still fit part of this product
        let bestFitIndex = -1;
        let minRemainingSpace = Infinity;
    
        plannedStacks.forEach((stack, index) => {
          const stackTotal = stack.reduce((sum, item) => sum + item.cases, 0);
          const remainingSpace = stackHeight - stackTotal;
    
          // Look for the best stack that can fit at least part of the quantity
          if (remainingSpace > 0 && remainingSpace < minRemainingSpace) {
            bestFitIndex = index;
            minRemainingSpace = remainingSpace;
          }
        });
    
        if (bestFitIndex !== -1) {
          // Determine the number of cases we can add to this best-fit stack
          const casesToAdd = Math.min(quantity, minRemainingSpace);
          plannedStacks[bestFitIndex].push({ product: productName, cases: casesToAdd });
          totalCases += casesToAdd;
          quantity -= casesToAdd; // Reduce remaining quantity
    
        } else {
          // If no suitable stack found, create a new stack
          const casesForNewStack = Math.min(quantity, stackHeight);
          plannedStacks.push([{ product: productName, cases: casesForNewStack }]);
          totalCases += casesForNewStack;
          totalStacks = plannedStacks.length;
          quantity -= casesForNewStack;
        }
      }
    });    

    // Display the planned stacks and "Grab" button for each stack
    renderPlannedStacks();

    // Update the display of total cases and stacks
    updateDisplay();
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
        productLi.textContent = `${item.product}: ${item.cases} case${item.cases === 1 ? '' : 's'}`;
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
      button.addEventListener("click", (event) => {
        const index = parseInt(event.target.getAttribute("data-index"));
        // Remove the grabbed stack
        plannedStacks.splice(index, 1);

        // Update total stacks
        totalStacks = plannedStacks.length;

        // Render the updated stacks
        renderPlannedStacks();
        updateDisplay();
      });
    });
  }

  // Function to update the display of total cases and stacks left
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

});  