const express = require('express');
const axios = require('axios');
const redis = require('redis');

const app = express();

const port = 3000;

// make a connection to the local instance of redis
const client = redis.createClient(6379);
console.log("client" , client)
client.on("error", (error) => {
  console.error(error);
});

app.get('/recipe/:fooditem', (req, res) => {
  try {
    const email = req.params.fooditem;

    // Check the redis store for the data first
    client.get(email, async (err, recipe) => {
      if (recipe) {
        return res.status(200).send({
          error: false,
          message: `Recipe for ${email} from the cache`,
          data: JSON.parse(recipe)
        })
      } else { // When the data is not found in the cache then we can make request to the server
          // const MOCK_API = "https://jsonplaceholder.typicode.com/users/"
          // let p = await axios.get(`${MOCK_API}?email=${email}`);
          const response = await axios.get(`https://jsonplaceholder.typicode.com/users/?email=${email}`);
          const user = response.data;
          // save the record in the cache for subsequent request
          await client.setex(email, 6000, JSON.stringify(user));

          // return the result to the client
          return res.status(200).send({
            error: false,
            message: `Recipe for ${email} from the server`,
            data: user
          });
      }
    })  
  } catch (error) {
      console.log(error)
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
