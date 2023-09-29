
const request = require('request');


/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const fetchMyIP = function(callback) {

  const url = "https://api.ipify.org?format=json";

  request(url, (error, response, body) => {
    if (error) {
      return callback(error, null);
      }

    if (response.statusCode !== 200) {
      callback(Error(`unknown status code: ${response.statusCode}`), null);
      return;
    }
    const ipAddress = JSON.parse(body).ip;
    callback(null, ipAddress);

   
  });
};




    // callback(null, ipAddress);


  


    const fetchCoordsByIP = function(ip, callback) {
      request(`http://ipwho.is/${ip}`, (error, response, body) => {
    
        if (error) {
          callback(error, null);
          return;
        }
    
        const parsedBody = JSON.parse(body);
    
        if (!parsedBody.success) {
          const message = `Success status was ${parsedBody.success}. Server message says: ${parsedBody.message} when fetching for IP ${parsedBody.ip}`;
          callback(Error(message), null);
          return;
        } 
    
        const { latitude, longitude } = parsedBody;
    
        callback(null, {latitude, longitude});
      });
    };


// use request to fetch IP address from JSON API

// const fetchISSFlyOverTimes = function(coords, callback) {
//   // ...
// };


const fetchISSFlyOverTimes = function(coords, callback) {
  const url = `https://iss-flyover.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`;

  request(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    }

    const passes = JSON.parse(body).response;
    callback(null, passes);
  });
};

const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};


module.exports = { nextISSTimesForMyLocation };
