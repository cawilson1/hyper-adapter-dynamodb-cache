# README

hyper cache adapter using AWS DynamoDB as service

## About

This adapter uses single table design. All data for this adapter is stored in a single DynamoDB table with a partition key named "pk" and a sort key named "sk".
The DynamoDB Table Name is defined as an environment variable, DynamoDbTable
The store name passed from hyper to this adapter becomes the "pk"
The key passed from hyper to this adapter becomes the "sk"
Everything else is stored in normal document format.

There is an optional DO_BATCH_IN_PARALLEL env variable flag. If it is set to true, then the adapter will do parallel writes. By default, batch processing waits for a response from the current request before starting a new request. DO_BATCH_IN_PARALLEL set to true is probably best for situations where it is highly unlikely to be throttled by DynamoDB, such as using on-demand mode, or having a provisioned WCU rate high enough to handle large delete spikes. If the WCU rate is low enough that a large bulk delete may be throttled, it is best to leave the flag.

## Testing

TODO
