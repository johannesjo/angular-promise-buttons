[![Stories in Ready](https://badge.waffle.io/johannesjo/angular-promise-buttons.svg?label=ready&title=Ready)](http://waffle.io/johannesjo/angular-promise-buttons)
[![Stories in progress](https://badge.waffle.io/johannesjo/angular-promise-buttons.svg?label=in%20progress&title=In%20Progress)](http://waffle.io/johannesjo/angular-promise-buttons)
[![Build Status](https://travis-ci.org/johannesjo/angular-promise-buttons.svg)](https://travis-ci.org/johannesjo/angular-promise-buttons?branch=master)
[![Coverage Status](https://coveralls.io/repos/johannesjo/angular-promise-buttons/badge.svg?branch=master)](https://coveralls.io/r/johannesjo/angular-promise-buttons?branch=master)

angular-promise-buttons
===========

*Chilled Buttons for AngularJS*

There are cool loading buttons out there for angular. Only thing which annoys me, is that you (most of the times) have to manually trigger their loading state via a boolean which leads to a bit of repetition, declaring those again and again. ```angular-promise-buttons``` exists to take away some of that, by handling the loading state directly by passing the promise. Saves you at least two lines of code every time. Check out the [DEMO](http://johannesjo.github.io/angular-promise-buttons/#demo)!

Also you can play with the code on [Plnkr](http://plnkr.co/edit/yKrlohXVL15fRjTjZHBJ?p=preview).


[Bug-reports or feature request](https://github.com/johannesjo/angular-promise-buttons/issues) as well as any other kind of **feedback is highly welcome!**

## getting started

Install it via bower
```
bower install angular-promise-buttons -S
```
and add `angularPromiseButtons` as dependency in your main module:
```
angular.module('yourApp',[
  'angularPromiseButtons'
]);
```

Using the buttons is easy. Just return the promise in question in your service caller and you're good to go:
You can also directly return the promise via the function passed to `ng-click`:
```html
<button ng-click="yourServiceCaller()"
        promise-btn>Click me to spin!</button>
```

```javascript
// inside some controller
$scope.yourServiceCaller = function ()
{
  return fakeFactory.method().then(...);
};
```
### using it for forms
For using the promise buttons with `ng-submit` you need to apply them to the form directive and add `type="submit" to the buttons you want to show a loader for:
```html
<form ng-submit="yourServiceCaller()"
      promise-btn>
  <button type="submit">MyBtn</button>
</form>
```

```javascript
// inside some controller
$scope.yourServiceCaller = function ()
{
  return fakeFactory.method().then(...);
};
```

### alternative syntax
There is also an alternative syntax, which allows you to share promises between buttons (and possibly other directives):
```html
<button ng-click="yourServiceCaller()"
        promise-btn="yourPromise">MyBtn</button>
```
Now you just have to assign a promise to ```yourPromise```:
```javascript
// inside some controller
$scope.yourServiceCaller = function ()
{
  $scope.yourPromise = fakeFactory.method().then(...);
};
```



## styling the button
The base-styles might not be overwhelmingly sexy, but it is easy to fix that! There are lots of free css-spinners out there. Just find one of your liking and add the css.

**Ressources:**
* http://cssload.net/
* http://projects.lukehaas.me/css-loaders/
* http://tobiasahlin.com/spinkit/


## configuration
There are also some defaults for you to set, if you like. You can do this by using the ```angularPromiseButtonsProvider```:
```javascript
angular.module('exampleApp', [
  'angularPromiseButtons'
])
.config(function (angularPromiseButtonsProvider)
{
  angularPromiseButtonsProvider.extendConfig({
    spinnerTpl: '<span class="btn-spinner"></span>',
    disableBtn: true,
    btnLoadingClass: 'is-loading',
    addClassToCurrentBtnOnly: false,
    disableCurrentBtnOnly: false,
    minDuration: false,
    CLICK_EVENT: 'click',
    CLICK_ATTR: 'ngClick',
    SUBMIT_EVENT: 'submit',
    SUBMIT_ATTR: 'ngSubmit',
    BTN_SELECTOR: 'button'
  });
});
```

## change options via `promise-btn-options`
You can also change all the options (**but not the spinner template**) by specifying the options via `promise-btn-options`:
```html
<button class="btn"
        ng-click="yourServiceCaller()"
        promise-btn-options="options"
        promise-btn="yourPromise">MyBtn <span>Look I'm nested content</span>
</button>
```
Now you just have to assign a promise to ```yourPromise```:
```javascript
// inside some controller
$scope.options = {
  disableBtn: false,
  btnLoadingClass: 'is-spinning'
};
$scope.yourServiceCaller = function ()
{
  $scope.yourPromise = fakeFactory.method().then(...);
};
```

Thats all the logic there is (for now). Adjusting the look and feel of the spinner can be done using your own styles.


## ❤ contribute ❤
I'm happy for any [issue or feature request](https://github.com/johannesjo/angular-promise-buttons/issues), you might encounter or want to have. Even a one liner is better, than no feedback at all. Pull requests are also highly welcome. Just fork the repository, clone it and run `grunt serve` for development. Another important factor is the number of developers using and thus testing `angular-promise-buttons`. Tell your fellow programmers, [say that you use it on ng-modules](http://ngmodules.org/modules/angular-promise-buttons), tweet or even blog about it.

`angular-promise-buttons` is published under the [The GNU Lesser General Public License V2.1](https://github.com/johannesjo/angular-promise-buttons/blob/master/LICENSE).

## (possible) promising future features
* [your feature request](https://github.com/johannesjo/angular-promise-buttons/issues)!
