var model = (function () {

})();

var view = (function () {
  // DOM selectors all in one place
  var domStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    addBtn: '.add__btn'
  };

  // public interface
  return {
    // return form field's values
    getInput: function () {
      return {
        type: document.querySelector(domStrings.inputType).value,
        description: document.querySelector(domStrings.inputDescription).value,
        value: document.querySelector(domStrings.inputValue).value
      };
    },

    // return DOM selectors to public
    getDOMstrings: function () {
      return domStrings;
    }
  };
})();

var controller = (function (model, view) {
  // private initializer
  var setupEventListeners = function () {
    // copy DOM definitions from view
    var domStrings = view.getDOMstrings();

    document.querySelector(domStrings.addBtn).addEventListener('click', addItem);

    document.addEventListener('keypress', function (event) {
      if (event.keyCode === 13 || event.which === 13) addItem();
    });
  };

  var addItem = function () {
    // 1. Get input fields
    var input = view.getInput();
    console.log(input);
    // 2. Add item to model

    // 3. Add item to view

    // 4. Calculate updated budget

    // 5. Update budget section
  };

  return {
    init: function () {
      console.log('Application started');
      setupEventListeners();
    }
  };
})(model, view);

controller.init();
