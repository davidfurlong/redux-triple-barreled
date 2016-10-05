# Redux Triple Barreled Actions

## Action Syntax
```javascript
// Action syntax
{
	types: [REQUEST_START_ACTION_TYPE, REQUEST_SUCCESS_ACTION_TYPE, REQUEST_FAIL_ACTION_TYPE],
	promise: api.get('/').then(() => {
		// REQUEST_START_ACTION_TYPE callback from which you can dispatch further actions
	}),
	success: (response, dispatch, getState) => { // success property is OPTIONAL
	  // REQUEST_SUCCESS_ACTION_TYPE callback from which you can dispatch further actions
	},
	failure: (error, dispatch, getState) => { // failure property is OPTIONAL
	  // REQUEST_FAIL_ACTION_TYPE callback from which you can dispatch further actions
	},
	// you can add any additional properties that will be passed to the reducer, except do not use the 'type' property in an action with property 'types'!
}
// Supports simple actions
{
	type: SOME_ACTION_TYPE,
	// you can add any additional properties that will be passed to the reducer
}
```
Example use in a react component
```javascript
someActionCreator(){
	return {
		types: [REQUEST_START_ACTION_TYPE, REQUEST_SUCCESS_ACTION_TYPE, REQUEST_FAIL_ACTION_TYPE],
		promise: api.get('/'),
		success: (response, dispatch, getState) => {
			return dispatch(somethingElse1())
		},
		failure: (error, dispatch, getState) => {
			return dispatch(somethingElse2())
		}
	}
}

dispatch(someActionCreator()).then(f1)
// f1 will be called after somethingElse1 or somethingElse2 has returned depending on whether api.get('/') failed or succeeded, because they are returned in the success and failure functions. If null was returned (or some sync value), f1 would be called as soon as api.get('/') fails or succeeds
```

Examples with real code
```javascript
dispatch(load()).then(() => { //called after getAdministered async request has been reduced, or NO_AUTH has been reduced })

export function load() { // authenticate using client auth token cookie
  const c = react_cookie.load("auth_token");
  if(c !== undefined){
    return {
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      promise: client.get('/users/me'),
      success: (succ, dispatch, getState) => {
        const user = succ.data;
        return dispatch(getAdministered(user.id));
      }
    }
  }
  else {
    return {
      type: NO_AUTH
    }
  }
}
```
## Installation

Must be the first middleware in applyMiddleware (any middleware previous to this will receive triple barreled actions, not standard redux actions, which may break that middleware)

## Inspiration 

https://github.com/erikras/react-redux-universal-hot-example/blob/master/src/redux/middleware/clientMiddleware.js
https://gist.github.com/andrewmclagan/c4e84b0dd76e721cf75db1c06439a19b

## How it works / Redux Middleware

When dispatch is called the first middleware (should usually be this one) is passed a curried function `(dispatch, getState) -> next -> action`. Calling next(action) passes action to the next middleware in the chain. Dispatching from within middleware sends the dispatched action to the start of the middleware chain. The Triple Barreled Actions middleware only lets simple redux actions through using next (ones that have a type property) and dispatches (sending to the start of the chain) some simple actions and some complex actions. Dispatching actions always returns a Promise, so that you can use `dispatch(action).then(do something)` in your code safely, regardless of whether `action` is a triple barreled action, or a simple redux action. 

https://medium.com/@meagle/understanding-87566abcfb7a#.5k7x8hy1f
```javascript
reducer :: state -> action -> state
middleware :: (dispatch, getState) -> next -> action -> retVal
applyMiddleware :: [middleware] -> (createStore -> createStore)
createStore :: reducer -> state -> enhancer -> store
compose :: (a -> b) -> (b -> c) -> (a -> c) // RIGHT TO LEFT
enhancer :: applyMiddleware || DevTools.instrument() || None || ...
dispatch :: action -> retVal
```
