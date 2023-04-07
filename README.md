# Puzzle Answer Check
This is designed to be an AWS Lambda that sits behind my site API Gateway, and handles answer submission responses for the puzzles aspect of my site.

It interacts with the [Puzzle Stats](https://github.com/spencer-carver/puzzle-stats) Lambda function to record details about puzzle engagement.

The `npm run export` script zips up required files to be imported into the desired lambda function from the AWS Console.
