exports = function (changeEvent) {
  const AWS = require('aws-sdk');

  const region = context.values.get("AWS_REGION");
  const topic = context.values.get("AWS_TOPIC_ARN");
  const accessKeyId = context.values.get("AWS_ACCESS_KEY_ID");
  const secretAccessKey = context.values.get("AWS_SECRET_ACCESS_KEY");

  AWS.config = new AWS.Config(({
    "accessKeyId": accessKeyId,
    "secretAccessKey": secretAccessKey,
    "region": region
  }));

  let msg = `unknown`
  if (changeEvent.fullDocument.msg) {
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
};
