const fetch = require('node-fetch')

exports.handler = async (event, context, lambdaCallback) => {
  try {
    const url = exports.queryUrl(event)
    const result = await exports.queryResult(url)
    const response = await exports.createLambdaResponse(result)

    lambdaCallback(null, response)
  } catch (e) {
    console.error(e)
  }
}

exports.queryUrl = (event) => {
  const query = event.path + "?" + encodeURIComponent(Object.keys(event.queryStringParameters).map(key => key + '=' + event.queryStringParameters[key]).join('&'))
  return process.env.PASSTHROUGH_URL + query
}

exports.queryResult = async (url) => {
  const requestHeaders = {
      method: "get",
      headers: { "Authorization": "apikey " + process.env.PRIMO_API_KEY }
  }

  return fetch(url, requestHeaders)
}

exports.createLambdaResponse = async (result) => {
  const body = await result.text()

  return response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": result.headers.get("Content-type"),
    },
    body: body
  }
}

// node -e "require('./index').test()"
exports.test = () => {
  exports.handler(
    {
      path: "/primo/v1/pnxs",
      queryStringParameters: { inst: "NDU", search_scope: "spec_coll", q: "any,contains,book" },
    },
    {},
    (err, data) => {
      if (err) {
        console.log("ERROR:")
        console.log(JSON.stringify(JSON.parse(err), null, 2))
      } else {
        console.log(JSON.stringify(JSON.parse(data.body), null, 2))
      }
    }
  )
}
