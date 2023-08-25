# mdb-sns-publish

## Setup

1. Install dependencies 

```
npm install
```

2. Create a copy of `sample.env` and name it `.env`. This is where you'll add your environment variables to run the script.
  ```
     cp sample.env .env
  ```
3. Update the environment variables

## Start the changestream locally

```
node changestream.js
```

Alternatively, you can use the code in `trigger.js` to configure your Atlas Trigger. You'll need to add `aws-sdk` as a dependency to your function in Atlas.
