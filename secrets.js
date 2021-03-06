// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://aws.amazon.com/developers/getting-started/nodejs/

// Load the AWS SDK
const AWS = require('aws-sdk');

let secret;
let decodedBinarySecret;
const region = 'us-west-2';
const secretName = 'recipease_dev';

// Create a Secrets Manager client
const client = new AWS.SecretsManager({
  region,
});

// In this sample we only handle the specific exceptions for the 'GetSecretValue' API.
// See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
// We rethrow the exception by default.

module.exports = {
  // this doesn't need to be an async function since we manually return a promise, allowing it to be called with async/await
  getSecret: () => {
    const promisifiedSecrets = new Promise((resolve, reject) => {
      client.getSecretValue({ SecretId: secretName }, (err, data) => {
        if (err) {
          switch (err.code) {
            case 'DecryptionFailureException':
              // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
              // TODO: add actual error handling here
              reject(err);
              break;
            case 'InternalServiceErrorException':
              // An error occurred on the server side.
              // TODO: add actual error handling here
              reject(err);
              break;
            case 'InvalidParameterException':
              // You provided an invalid value for a parameter.
              // TODO: add actual error handling here
              reject(err);
              break;
            case 'InvalidRequestException':
              // You provided a parameter value that is not valid for the current state of the resource.
              // TODO: add actual error handling here
              reject(err);
              break;
            case 'ResourceNotFoundException':
              // We can't find the resource that you asked for.
              // TODO: add actual error handling here
              reject(err);
              break;
            default:
              reject(err);
              break;
          }
        } else {
          // Decrypts secret using the associated KMS CMK.
          // Depending on whether the secret is a string or binary, one of these fields will be populated.
          // eslint-disable-next-line no-lonely-if
          if ('SecretString' in data) {
            secret = data.SecretString;
          } else {
            const buff = Buffer.from(data.SecretBinary, 'base64');
            decodedBinarySecret = buff.toString('ascii');
          }
        }
        resolve(decodedBinarySecret ? JSON.parse(decodedBinarySecret) : JSON.parse(secret));
      });
    });
    return promisifiedSecrets;
  },
};
