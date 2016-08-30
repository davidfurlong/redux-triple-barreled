export default function createTripleBarreledMiddleware(){
  return ({ dispatch, getState }) => next => action => {
    // if(!action) // Catches undefined actions being dispatched
    //   return Promise.resolve(next({type: "ID"})) // should hit reducer default and be an identity action

    // Uncomment to Enable traditional redux-thunks
    // if (typeof action === 'function') {
    //   return Promise.resolve(action(dispatch, getState));
    // }

    var { promise, success, types, failure, ...rest } = action;

    if (!promise) // Dispatch sync actions
      return Promise.resolve(next(action)); // return a promise to be able to chain sync actions
      // if we don't know whether an action creator will dispatch a sync or async action this is useful, so we can chain with 'then' outside of a dispatch call


    /* TRIPLE BARRELED ACTIONS */

    const [REQUEST, SUCCESS, FAILURE] = types;

    next({ ...rest, type: REQUEST }); // Dispatch the request action

    // Execute the async api call and get returned promise
    return new Promise((resolve, reject) => 
      promise
        .then((response) => {
          const s = next({ ...rest, ...response, type: SUCCESS }); // Dispatch the success action with response
          // Call after and pass along promise, allowing to execute "after" side effects
          if(typeof success === 'function')
            resolve(success(response, dispatch, getState))
          else 
            resolve(s);
        },
        (error) => {
          const f = next({ ...rest, error, type: FAILURE }) // async req fails
          if(typeof failure === 'function')
            resolve(failure(error, dispatch, getState))
          else 
            resolve(f)
        })
        .catch((error) => {
          // Dispatch the error action with response
          const f = next({ ...rest, error, type: FAILURE });
          // Call after and pass along promise, allowing to execute "after" side effects
          if(typeof failure === 'function')
            resolve(failure(error, dispatch, getState))
          else
            resolve(f)
        })
    )
  }
}