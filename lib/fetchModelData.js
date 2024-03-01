var Promise = require("Promise");

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
  return new Promise(function(resolve, reject) {
    const xhr = new XMLHttpRequest();
    console.log(url);
    xhr.open("GET", url);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({ data: response });
        } catch (error) {
          reject(new Error({ status: xhr.status, 
            statusText: xhr.statusText }));
        }
      } else {
        reject (new Error({ status: xhr.status,
          
          statusText: xhr.statusText }));
      }
    };

    xhr.onerror = () => {
      reject(new Error({ status: xhr.status, statusText: xhr.statusText }));
    };

    xhr.send();
  });
      
}

export default fetchModel;
