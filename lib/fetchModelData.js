var Promise = require("Promise");
const axios = require("axios");
/**
  * FetchModel - Fetch a model from the web server.
  *     url - string - The URL to issue the GET request.
  * Returns: a Promise that should be filled
  * with the response of the GET request parsed
  * as a JSON object and returned in the property
  * named "data" of an object.
  * If the requests has an error the promise should be
  * rejected with an object contain the properties:
  *    status:  The HTTP response status
  *    statusText:  The statusText from the xhr request
  *
*/


function fetchModel(url) {
  return axios.get(url)
    .then(response => { //if response is valid, send the data as a response to get request
      return { data: response.data };
    })
    .catch(error => {
      if (error.response) { //if error
        throw new Error({ status: error.response.status, statusText: error.response.statusText });
      } else if (error.request) { //nod response 
        throw new Error({ status: 0, statusText: 'No response from server' });
      } else { //server is likely broken
        throw new Error({ status: -1, statusText: 'Request setup error' });
      }
    });
}

export default fetchModel;