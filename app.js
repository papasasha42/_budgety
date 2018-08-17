// Data operations
var model = (function () {
  // factory functions
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calculatePercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () { return this.percentage; };

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
        newItem = new Expense(ID, description, value);
      } else if (type === 'income') {
        newItem = new Income(ID, description, value);
      }

      // add new item to DB
      arr.push(newItem);

      // retern newly created item
      return newItem;
    },

    deleteItem: function (type, id) {
      var dbPointer = data.allItems[type];

      // take ids of all items to separate array
      var ids = dbPointer.map(function (el) {
        return el.id;
      });

      // find index of item to delete
      var index = ids.indexOf(id);

      // delete item if found
      if (index !== -1) {
        dbPointer.splice(index, 1);
      }
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

    calculatePercentages: function () {
      data.allItems.expense.forEach(function (el) {
        el.calculatePercentage(data.totals.income);
      });
    },

    getPercentages: function () {
      var allPercentages = data.allItems.expense.map(function (el) {
        return el.getPercentage();
      });
      return allPercentages;
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
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercentageLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  // +/- before, round to 2 decimal, separate thousands with comma
  var formatNumber = function (num, type) {
    num = num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    if (type === 'income') {
      num = '+ ' + num;
    } else if (type === 'expense') {
      num = '- ' + num;
    }

    return num;
  };

  // public interface
  return {
    // return form field's values
    getInput: function () {
      return {
        type: document.querySelector(domStrings.inputType).value,
        description: document.querySelector(domStrings.inputDescription).value,
        value: parseFloat(document.querySelector(domStrings.inputValue).value)
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

        html = '<div class="item clearfix" id="expense-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // replace placeholders with user input data
      var newHTML = html.replace('%id%', obj.id);
      newHTML = newHTML.replace('%description%', obj.description);
      newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

      // insert HTML into the DOM
      document.querySelector(container).insertAdjacentHTML('beforeend', newHTML);
    },

    deleteListItem: function (id) {
      var el = document.getElementById(id);
      el.parentNode.removeChild(el);
    },

    // clear input fields
    clearFields: function () {
      document.querySelector(domStrings.inputDescription).value = '';
      document.querySelector(domStrings.inputValue).value = '';
      document.querySelector(domStrings.inputType).focus();
    },

    displayBudget: function (obj) {
      var type;
      obj.budget > 0 ? type = 'income' : type = 'expence';

      document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(domStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'income');
      document.querySelector(domStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'expense');

      if (obj.percentage > 0) {
        document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(domStrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: function (percentages) {
      var nodeList = document.querySelectorAll(domStrings.expensesPercentageLabel);
      console.log(nodeList[0]);

      // Modern JS has forEach in NodeList prototype, but I decided it will be good for training to follow instructor and code own implementation of such method

      var nlForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i, list);
        }
      };

      nlForEach(nodeList, function (el, index) {
        if (percentages[index] > 0) {
          el.textContent = percentages[index] + '%';
        } else {
          el.textContent = '---';
        }
      });
    },

    displayDate: function () {
      var now = new Date();
      var year = now.getFullYear();

      var months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
      var month = months[now.getMonth()];
      document.querySelector(domStrings.dateLabel).textContent = month + ' ' + year;
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

    // add listeners to item delete buttons which is delegated to parent
    document.querySelector(domStrings.container).addEventListener('click', deleteItem);
  };

  var updateBudget = function () {
    // 1. Calculate the budget
    model.calculateBudget();

    // 2. Return the budget
    var budget = model.getBudget();

    // 3. Display the budget on the UI
    view.displayBudget(budget);
  };

  var updatePercentages = function () {
    // Calculate percentages
    model.calculatePercentages();

    // Read from model
    var percentages = model.getPercentages();

    // Update model with the updated percentages
    view.displayPercentages(percentages);
  };

  var addItem = function () {
    // 1. Get input fields
    var input = view.getInput();

    // Validate input form
    if (input.description && !isNaN(input.value) && input.value > 0) {
      // 2. Add item to model
      var newItem = model.addItem(input.type, input.description, input.value);

      // 3. Add item to view
      view.addListItem(newItem, input.type);
      view.clearFields();

      // 4. Calculate updated budget and display it
      updateBudget();

      // 5. Calculate and display percentages
      updatePercentages();
    }
  };

  var deleteItem = function (event) {
    // as target is button, find parent which contains item ID
    var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    var splitID, type, id;

    // if ID exists delete it
    if (itemID) {
      // HTML id is formatted as type-ID (income-0), so need to parse it
      splitID = itemID.split('-');
      type = splitID[0];
      id = parseInt(splitID[1]);

      // Delete item from DB
      model.deleteItem(type, id);

      // Delete item from view
      view.deleteListItem(itemID);

      // Update and display budget
      updateBudget();

      // Calculate and display percentages
      updatePercentages();
    }
  };

  // public interface, actually there is only initializer
  return {
    init: function () {
      console.log('Application started');
      view.displayDate();
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
