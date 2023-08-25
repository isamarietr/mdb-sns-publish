require('dotenv').config()

const { MongoClient } = require('mongodb');
const AWS = require('aws-sdk');

async function main() {

  const uri = process.env.MDB_URI
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    const db = client.db("sample_events")
    const collection = db.collection("events")

    console.log(`Waiting for changes...`);
    const changeStream = collection.watch([], { fullDocument: "whenAvailable" })
    // For pre-image, enable changeStreamPreAndPostImages 
    // @see https://www.mongodb.com/docs/manual/reference/method/db.collection.watch/#change-streams-with-document-pre--and-post-images
    // const changeStream = collection.watch([], { fullDocumentBeforeChange: "whenAvailable",  fullDocument: "whenAvailable"})
    changeStream.on("change", sendNotification)
    ////

  } finally {
    // Close the connection to the MongoDB cluster
    //await client.close();
  }
}

main().catch(console.error);

/**
 * Show changes in console
 */
async function showChanges(event) {
  // process any change event
  console.log("Received a change to the collection: \t", JSON.stringify(event, null, 2));
  console.log(`Waiting for more changes...`);
}
/**
 * Show changes in console
 */
async function sendNotification(changeEvent) {

  const region = process.env.AWS_REGION;
  const topic = process.env.AWS_TOPIC_ARN;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  AWS.config = new AWS.Config(({
    "accessKeyId": accessKeyId,
    "secretAccessKey": secretAccessKey,
    "region": region
  }));

  let msg = `unknown`
  if (changeEvent.fullDocument?.msg) {
    msg = changeEvent.fullDocument.msg;
  }
  else {
    msg = `This is a test message! ID: ${Math.floor(Math.random() * 100)}`
  }
  // Create publish parameters
  const params = {
    Message: msg, /* required */
    TopicArn: topic
  };

  // Create promise and SNS service object
  const publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();

  // Handle promise's fulfilled/rejected states
  publishTextPromise.then(
    function (data) {
      console.log(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
      console.log("MessageID is " + data.MessageId);
    }).catch(
      function (err) {
        console.error(err, err.stack);
      });

  return 'done!';
}