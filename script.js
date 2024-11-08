document.addEventListener("DOMContentLoaded", () => {
  function checkPalletOrder(orderNumber) {
    const palletOrderNumbers = ["102", "106", "143", "163", "169"];
    return palletOrderNumbers.includes(orderNumber);
  }

  const orderForm = document.getElementById("orderForm");
  const palletizingMessage = document.getElementById("palletizingMessage");
  const productListElement = document.getElementById("productList");
  const clearButton = document.getElementById("clearButton");
  const clearStacksButton = document.getElementById("clearStacksButton");
  const stacksLeftElement = document.getElementById("stacksLeft");
  const totalCasesElement = document.getElementById("totalCases");
  const stackHeightInput = document.getElementById("stackHeight");
  const undoButton = document.getElementById("undoButton");
  const redoButton = document.getElementById("redoButton");

  let totalStacks = 0;
  let totalCases = 0;
  let plannedStacks = [];
  let undoStack = [];
  let redoStack = [];

  class Memento {
    constructor(state) {
      this.state = JSON.parse(JSON.stringify(state));
    }
  }

  function saveState() {
    undoStack.push(new Memento(plannedStacks));
    redoStack = [];  // Clear redoStack when a new action occurs
  }

  function saveState() {
    undoStack.push(new Memento(plannedStacks));
    redoStack = []; // Clear redo stack on new action
  }

  function restoreState(memento) {
    plannedStacks = memento.getState();
    totalStacks = plannedStacks.length;
    totalCases = plannedStacks.reduce((sum, stack) => sum + stack.reduce((s, item) => s + item.cases, 0), 0);
    renderPlannedStacks();
    updateDisplay();
  }

  function undo() {
    if (undoStack.length > 1) {
      redoStack.push(undoStack.pop()); // Move last state to redoStack
      const prevMemento = undoStack[undoStack.length - 1];
      plannedStacks = JSON.parse(JSON.stringify(prevMemento.state));
      renderPlannedStacks();
      updateDisplay();
    }
  }

  function redo() {
    if (redoStack.length > 0) {
      undoStack.push(new Memento(plannedStacks));
      const nextState = redoStack.pop();
      restoreState(nextState);
    }
  }

  orderForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const orderNumberInput = document.getElementById("orderNumber");
    const orderNumber = orderNumberInput.value.trim();
    const requiresPalletizing = checkPalletOrder(orderNumber);

    palletizingMessage.textContent = requiresPalletizing
      ? "This order NEEDS palletizing."
      : "This order does NOT require palletizing.";
    palletizingMessage.style.color = requiresPalletizing ? "red" : "#333";
    if (requiresPalletizing) alert("This load needs palletizing!");

    const stackHeight = parseInt(stackHeightInput.value, 10) || 6;
    const productQuantities = {};

    const inputs = orderForm.querySelectorAll("input[type='number']");
    inputs.forEach((input) => {
      const productName = input.name;
      const quantity = parseInt(input.value, 10);
      if (!isNaN(quantity) && quantity > 0) productQuantities[productName] = quantity;
    });

    let productsArray = Object.entries(productQuantities);
    productsArray.sort((a, b) => {
      const aFullStacks = Math.floor(a[1] / stackHeight);
      const bFullStacks = Math.floor(b[1] / stackHeight);
      return bFullStacks - aFullStacks || b[1] - a[1];
    });

    plannedStacks = [];
    totalStacks = 0;
    totalCases = 0;

    productsArray.forEach(([productName, quantity]) => {
      while (quantity > 0) {
        let bestFitIndex = -1;
        let minRemainingSpace = Infinity;

        plannedStacks.forEach((stack, index) => {
          const stackTotal = stack.reduce((sum, item) => sum + item.cases, 0);
          const remainingSpace = stackHeight - stackTotal;
          if (remainingSpace > 0 && remainingSpace < minRemainingSpace) {
            bestFitIndex = index;
            minRemainingSpace = remainingSpace;
          }
        });

        if (bestFitIndex !== -1) {
          const casesToAdd = Math.min(quantity, minRemainingSpace);
          plannedStacks[bestFitIndex].push({ product: productName, cases: casesToAdd });
          totalCases += casesToAdd;
          quantity -= casesToAdd;
        } else {
          const casesForNewStack = Math.min(quantity, stackHeight);
          plannedStacks.push([{ product: productName, cases: casesForNewStack }]);
          totalCases += casesForNewStack;
          totalStacks = plannedStacks.length;
          quantity -= casesForNewStack;
        }
      }
    });

    saveState(); // Save the initial state for undo
    renderPlannedStacks();
    updateDisplay();
  });

  function renderPlannedStacks() {
    productListElement.innerHTML = "";
    plannedStacks.forEach((stack, index) => {
      const stackLi = document.createElement("li");
      stackLi.classList.add("stack");
      stackLi.setAttribute("data-index", index);

      const productUl = document.createElement("ul");
      stack.forEach((item) => {
        const productLi = document.createElement("li");
        productLi.textContent = `${item.product}: ${item.cases} case${item.cases === 1 ? "" : "s"}`;
        productUl.appendChild(productLi);
      });

      const grabButton = document.createElement("button");
      grabButton.textContent = "Grab";
      grabButton.classList.add("grab-button");
      grabButton.setAttribute("data-index", index);

      stackLi.appendChild(productUl);
      stackLi.appendChild(grabButton);
      productListElement.appendChild(stackLi);
    });

    attachGrabButtonListeners();
  }

  function attachGrabButtonListeners() {
    document.querySelectorAll(".grab-button").forEach((button) => {
      button.addEventListener("click", (event) => {
        const index = parseInt(event.target.getAttribute("data-index"));
        saveState(); // Save the state before grabbing
        plannedStacks.splice(index, 1);
        totalStacks = plannedStacks.length;
        renderPlannedStacks();
        updateDisplay();
      });
    });
  }

  function updateDisplay() {
    stacksLeftElement.textContent = totalStacks;
    totalCasesElement.textContent = totalCases;
  }

  clearButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the form and stacks?")) {
      plannedStacks = [];
      undoStack = [];
      redoStack = [];
      renderPlannedStacks();
      updateDisplay();
    }
  });

  clearStacksButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the planned stacks?")) {
      plannedStacks = [];
      renderPlannedStacks();
      updateDisplay();
    }
  });

  undoButton.addEventListener("click", undo);
  redoButton.addEventListener("click", redo);
});

// Assuming totalCases is already calculated and available from your existing logic
// Replace the hardcoded totalCases variable with a reference to your existing totalCases variable
function calculateBlockOrLine() {
  const totalCases = parseInt(document.getElementById("totalCases").innerText, 10);
  const totalCarts = parseInt(document.getElementById("totalCarts").value, 10);
  const minCasesHeight = parseInt(document.getElementById("minHeight").value, 10);

  if (isNaN(totalCarts) || totalCarts < 1) {
    document.getElementById("results").innerText = "Please enter a valid number of carts.";
    return;
  }

  // Calculate cases per block and line based on the minimum height
  const casesPerBlock = minCasesHeight === 4 ? 16 : 20;
  const casesPerLine = minCasesHeight === 4 ? 24 : 30;

  // Calculate how many complete blocks and lines can be made
  const blockCount = Math.floor(totalCases / casesPerBlock);
  const lineCount = Math.floor(totalCases / casesPerLine);
  const cartsAsBlocks = Math.floor(totalCarts / 3);

  // Determine if there are any remaining cases that do not fit into a block or line
  const remainingCasesAfterBlocks = totalCases % casesPerBlock;
  const remainingCasesAfterLines = totalCases % casesPerLine;

  // Calculate excess cases only when they don't form complete blocks or lines
  const excessCases = Math.min(remainingCasesAfterBlocks, remainingCasesAfterLines);

  // Construct results text
  let resultsText = `You can make:\n`;

  if (blockCount > 0) {
    resultsText += `- ${blockCount} block${blockCount > 1 ? 's' : ''} without extra cases.\n`;
  } else {
    resultsText += `- No complete blocks can be made.\n`;
  }

  if (lineCount > 0) {
    resultsText += `- ${lineCount} line${lineCount > 1 ? 's' : ''} without extra cases.\n`;
  } else {
    resultsText += `- No complete lines can be made.\n`;
  }

  resultsText += `\nAdditional cases needed for next constructions:\n`;

  if (remainingCasesAfterBlocks !== 0 && remainingCasesAfterBlocks < casesPerBlock) {
    resultsText += `- To make 1 more block: ${casesPerBlock - remainingCasesAfterBlocks} extra case${casesPerBlock - remainingCasesAfterBlocks > 1 ? 's' : ''}.\n`;
  }

  if (remainingCasesAfterLines !== 0 && remainingCasesAfterLines < casesPerLine) {
    resultsText += `- To make 1 more line: ${casesPerLine - remainingCasesAfterLines} extra case${casesPerLine - remainingCasesAfterLines > 1 ? 's' : ''}.\n`;
  }

  resultsText += `\nCart substitutes:\n`;
  resultsText += `- You can use ${cartsAsBlocks} cart${cartsAsBlocks > 1 ? 's' : ''} as block substitutes.\n`;

  // Display the correct message for excess cases
  if (excessCases === 0) {
    resultsText += `- You do not need to move any cases to the back of the truck.\n`;
  } else {
    resultsText += `- Move ${excessCases} excess case${excessCases > 1 ? 's' : ''} to the back of the truck.\n`;
  }

  document.getElementById("results").innerText = resultsText;
}
