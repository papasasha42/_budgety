// Data operations
var model = (function () {
  // factory functions
  var Expence = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // helper function for budget calculation
  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (el) {
      sum += el.value;
    });
    data.totals[type] = sum;
  };

  // kind of DB
  var data = {
    allItems: {
      expense: [],
      income: []
    },
    totals: {
      expense: 0,
      income: 0
    },
    budget: 0,
    percentage: -1
  };

  // public interface
  return {
    addItem: function (type, description, value) {
      // pointer to array of selected type in DB
      var arr = data.allItems[type];

      // create ID which is +1 from ID of last existing element
      var ID = 0;
      if (arr.length > 0) {
        var ID = arr[arr.length - 1].id + 1;
      }

      // choose constructor according to selected type
      var newItem;
      if (type === 'expense') {
        newItem = new Expence(ID, description, value);
      } else if (type === 'income') {
        newItem = new Income(ID, description, value);
      }

      // add new item to DB
      arr.push(newItem);

      // retern newly created item
      return newItem;
    },

    calculateBudget: function () {
      // calculate total income and expenses
      calculateTotal('expense');
      calculateTotal('income');

      // calculate budget (income - expenses)
      data.budget = data.totals.income - data.totals.expense;

      // calculate the percentage of income that we spent
      if (data.totals.income > 0) {
        data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
      } else {
        data.percentage = -1;
      }
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.income,
        totalExp: data.totals.expense,
        percentage: data.percentage
      };
    },

    // debug
    testDB: function () {
      console.table(data.allItems.income);
      console.table(data.allItems.expense);
      console.table(data.totals);
      console.log(data.budget);
      console.log(data.percentage);
      console.log(data.totals.expense / data.totals.income);
    }
  };
})();

// UI operations
var view = (function () {
  // DOM selectors all in one place
  var domStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    addBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage'
  };

  // public interface
  return {
    // return form field's values
    getInput: function () {
      return {
        type: document.querySelector(domStrings.inputType).value,
        description: document.querySelector(domStrings.inputDescription).value,
        value: Math.floor(parseFloat(document.querySelector(domStrings.inputValue).value) * 100) / 100
      };
    },

    // return DOM selectors to public
    getDOMstrings: function () {
      return domStrings;
    },

    // add item to DOM
    addListItem: function (obj, type) {
      // create HTML string with placeholders
      var html;
      var container;
      if (type === 'income') {
        container = domStrings.incomeContainer;

        html = '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'expense') {
        container = domStrings.expensesContainer;

        html = '<div class="item clearfix" id="expense-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // replace placeholders with user input data
      var newHTML = html.replace('%id%', obj.id);
      newHTML = newHTML.replace('%description%', obj.description);
      newHTML = newHTML.replace('%value%', obj.value);

      // insert HTML into the DOM
      document.querySelector(container).insertAdjacentHTML('beforeend', newHTML);
    },

    // clear input fields
    clearFields: function () {
      document.querySelector(domStrings.inputDescription).value = '';
      document.querySelector(domStrings.inputValue).value = '';
      document.querySelector(domStrings.inputType).focus();
    },

    displayBudget: function (obj) {
      document.querySelector(domStrings.budgetLabel).textContent = obj.budget;
      document.querySelector(domStrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(domStrings.expensesLabel).textContent = obj.totalExp;

      if (obj.percentage > 0) {
        document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(domStrings.percentageLabel).textContent = '---';
      }
    }
  };
})();

// Connection between UI and DB, logic of app
var controller = (function (model, view) {
  // private initializer
  var setupEventListeners = function () {
    // copy DOM definitions from view
    var domStrings = view.getDOMstrings();

    // listen for checkmark click
    document.querySelector(domStrings.addBtn).addEventListener('click', addItem);

    // listen for Enter keypress
    document.addEventListener('keypress', function (event) {
      if (event.keyCode === 13 || event.which === 13) addItem();
    });
  };

  var updateBudget = function () {
    // 1. Calculate the budget
    model.calculateBudget();

    // 2. Return the budget
    var budget = model.getBudget();

    // 3. Display the budget on the UI
    view.displayBudget(budget);
  };

  var addItem = function () {
    // 1. Get input fields
    var input = view.getInput();

    if (input.description && !isNaN(input.value) && input.value > 0) {
      // 2. Add item to model
      var newItem = model.addItem(input.type, input.description, input.value);

      // 3. Add item to view
      view.addListItem(newItem, input.type);
      view.clearFields();

      // 4. Calculate updated budget and display it
      updateBudget();

      // debug
      console.log(`New ${input.type} created: ${input.value} - ${input.description}`);
    } else {
      // debug
      console.log('Input didnt pass checks!');
    }
  };

  // public interface, actually there is only initializer
  return {
    init: function () {
      console.log('Application started');
      view.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: '---'
      });
      setupEventListeners();
    }
  };
})(model, view);

// start the application
controller.init();
