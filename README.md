# conversation-messages-inbound-example

This application allows you to receive inbound messages from Facebook users to your Facebook Page and persists the events in a conversation named `my_conversation`.

## Capabilities 

Adds Messages capability to your nexmo application and configures the `Inbound URL` and `Status URL` webhooks (`messagesInbound` and `messagesStatus` in `index.js`).

## Linking a Facebook page

Currently the `conversation-api-function` cli tool doesn't support linking a facebook page to your nexmo applications, so this step has to be done manually via the vonage dashboard.

To link a FB page to your application:
* Link your FB page to your vonage account https://dashboard.nexmo.com/messages/social-channels/facebook-connect
* Go to your application (Application information can be found by running `conversation-api-function config`)
* Click `Link social channels` tab and link your FB page

## To run the server

`npm start | bunyan`

## Endpoints

The application exposes two endpoints:
* GET `/conversations`: Lists all the conversations associated with your nexmo application
* GET `/conversationEvents`: Lists all the events of the conversation name `my_conversation`