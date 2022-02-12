# README

hyper cache adapter using AWS DynamoDB as service

## About

This adapter uses single table design. All data for this adapter is stored in a single DynamoDB table with a partition key named "pk" and a sort key named "sk".
The DynamoDB Table Name is defined as an environment variable, DynamoDbTable
The store name passed from hyper to this adapter becomes the "pk"
The key passed from hyper to this adapter becomes the "sk"
Everything else is stored in normal document format.

## Testing

TODO
