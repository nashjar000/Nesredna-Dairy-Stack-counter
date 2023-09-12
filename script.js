// Get a reference to the form and add a submit event listener
const orderForm = document.getElementById("orderForm");
orderForm.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent the form from submitting

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

  // Create an array to represent the current stack
  const currentStack = [];
  let totalCasesInStack = 0;

  // Create an array to store the planned stacks
  const plannedStacks = [];

  // Loop through the product quantities and plan the stacks
  for (const productName in productQuantities) {
    let quantity = productQuantities[productName];

    while (quantity > 0) {
      // Check if adding this product will exceed the maximum cases per stack
      if (totalCasesInStack + quantity <= 6) {
        currentStack.push({ product: productName, cases: quantity });
        totalCasesInStack += quantity;
        quantity = 0;
      } else {
        // If adding the product exceeds the maximum cases, start a new stack
        const casesToAdd = 6 - totalCasesInStack;
        currentStack.push({ product: productName, cases: casesToAdd });
        plannedStacks.push([...currentStack]);
        currentStack.length = 0;
        totalCasesInStack = 0;
        quantity -= casesToAdd;
      }
    }
  }

  // If there are any remaining products in the current stack, add it to planned stacks
  if (currentStack.length > 0) {
    plannedStacks.push([...currentStack]);
  }

  // Display the results
  const stackCountsElement = document.getElementById("stackCounts");
  const productListElement = document.getElementById("productList");
  const stacksLeftElement = document.getElementById("stacksLeft");
  const totalCasesElement = document.getElementById("totalCases"); // Added

  stackCountsElement.textContent = plannedStacks.length;
  productListElement.innerHTML = "";
  stacksLeftElement.textContent = plannedStacks.length; // Update the total stacks left

  let totalCases = 0; // Initialize the total cases

  plannedStacks.forEach((stack, index) => {
    const stackSummary = stack.map((item) => `${item.product}: ${item.cases} cases`).join(', ');

    // Calculate the total cases for the stack
    const stackTotalCases = stack.reduce((total, item) => total + item.cases, 0);

    totalCases += stackTotalCases; // Add the stack's total cases to the overall total

    // Create a list of products for each stack
    const productUl = document.createElement("ul");
    stack.forEach((item) => {
      const productLi = document.createElement("li");
      productLi.textContent = `${item.product}: ${item.cases} cases`;
      productUl.appendChild(productLi);
    });

    // Add a "Grab" button for each stack
    const grabButton = document.createElement("button");
    grabButton.textContent = "Grab";
    grabButton.addEventListener("click", () => {
      // You can add code here to handle grabbing the stack
      // For example, you can remove the stack from the UI
      productListElement.removeChild(stackLi);
      plannedStacks.splice(index, 1); // Remove the grabbed stack from the array
      stacksLeftElement.textContent = plannedStacks.length; // Update the total stacks left
      totalCases -= stackTotalCases; // Subtract the stack's total cases from the overall total
      totalCasesElement.textContent = totalCases; // Update the total cases
    });

    const stackLi = document.createElement("li");
    stackLi.appendChild(productUl);
    stackLi.appendChild(grabButton);

    productListElement.appendChild(stackLi);
  });

  // Get a reference to the clear button
const clearButton = document.getElementById("clearButton");

// Add a click event listener to the clear button
clearButton.addEventListener("click", function () {
    // Get a reference to the form and reset it
    const orderForm = document.getElementById("orderForm");
    orderForm.reset();
    
    // Clear any generated lists or summaries
    const stackCountsElement = document.getElementById("stackCounts");
    const productListElement = document.getElementById("productList");
    const stacksLeftElement = document.getElementById("stacksLeft");
    const totalCasesElement = document.getElementById("totalCases");
    
    stackCountsElement.textContent = "0";
    productListElement.innerHTML = "";
    stacksLeftElement.textContent = "0";
    totalCasesElement.textContent = "0";
});


  totalCasesElement.textContent = totalCases; // Update the total cases
});
