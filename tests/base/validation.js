import { check, fail } from 'k6';

export function validateResponseCode(response, expectedResponseCode) {
  check(response, {
    'Validate Response Code': (r) => r.status === expectedResponseCode,
  });

  if (response.status !== expectedResponseCode) {
    console.info(`Actual status: ${response.status}, but expected to be ${expectedResponseCode}`);
    console.info(response.body.slice(0, 200));
  }
}

// eslint-disable-next-line consistent-return
export function getDataFromHTMLResponse(response, regex) {
  const match = new RegExp(regex).exec(response.body);

  if (match) {
    return match[1];
  }
  console.info(response.body.slice(0, 200));
  fail(`Data ${regex} can't be retrieved from the response`);
}

export function validateResponseHTMLText(response, expectedText) {
  check(response, {
    'Validate Response HTML Text': (r) => r.body.includes(expectedText),
  });
  if (!response.body.includes(expectedText)) {
    console.info(`Test failed with response status: ${response.status}`);
    console.info(`expected: ${expectedText}, actual response ${response.body.slice(0, 200)}`);
    fail(`HTML body not contain the expected text: ${expectedText}, actual response ${response.body.slice(0, 200)}`);
  }
}

export function validateResponseJsonAttribute(
  response,
  attributePath,
  expectedValue,
) {
  const getRoute = (responseJson, path) => path
    .replace(/[\]]/g, '')
  // eslint-disable-next-line no-useless-escape
    .split(/[.\[]+/)
    .reduce(
      (accumulator, currentValue) => accumulator[currentValue],
      responseJson,
    );

  const responseBody = JSON.parse(response.body); // Parse string JSON menjadi object

  check(responseBody, {
    'Validate Response Json Attribute': (body) => getRoute(body, attributePath) === expectedValue,
  });

  if (!(getRoute(response.json(), attributePath) === expectedValue)) {
    console.info(`expected: ${expectedValue}, actual response ${getRoute(response.json(), attributePath)}, dengan body ${JSON.stringify(responseBody)}`);
  }
}

export function validateResponseJsonNotNull(response, attributePath) {
  const getRoute = (responseJson, path) => path
    .replace(/[\]]/g, '')
  // eslint-disable-next-line no-useless-escape
    .split(/[.\[]+/)
    .reduce(
      (accumulator, currentValue) => accumulator[currentValue],
      responseJson,
    );

  check(response, {
    'Validate Response Json Not Null': (r) => getRoute(r.json(), attributePath) !== null,
  });

  if ((getRoute(response.json(), attributePath) === null)) {
    console.info(`expected: Not Null, actual response ${getRoute(response.json(), attributePath)}`);
  }
}
