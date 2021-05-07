/**
nexmo context: 
you can find this as the second parameter of rtcEvent funciton or as part or the request in req.nexmo in every request received by the handler 
you specify in the route function.

it contains the following: 
const {
        generateBEToken,
        generateUserToken,
        logger,
        csClient,
        storageClient
} = nexmo;

- generateBEToken, generateUserToken,// those methods can generate a valid token for application
- csClient: this is just a wrapper on https://github.com/axios/axios who is already authenticated as a nexmo application and 
    is gonna already log any request/response you do on conversation api. 
    Here is the api spec: https://jurgob.github.io/conversation-service-docs/#/openapiuiv3
- logger: this is an integrated logger, basically a bunyan instance
- storageClient: this is a simple key/value inmemory-storage client based on redis

*/



/** 
 * 
 * This function is meant to handle all the asyncronus event you are gonna receive from conversation api 
 * 
 * it has 2 parameters, event and nexmo context
 * @param {object} event - this is a conversation api event. Find the list of the event here: https://jurgob.github.io/conversation-service-docs/#/customv3
 * @param {object} nexmo - see the context section above
 * */

const DATACENTER = `https://api.nexmo.com` 

const conversation_name = "my_conversation"

const rtcEvent = async (event, { logger, csClient }) => {
    
}

const messagesInbound = (req, res) => {
    res.json([{ "action": "message", "conversation_name": conversation_name, "user": "Username", "geo": "region-code" }])
}

const messagesStatus = () => {

}

/**
 * 
 * @param {object} app - this is an express app
 * you can register and handler same way you would do in express. 
 * the only difference is that in every req, you will have a req.nexmo variable containning a nexmo context
 * 
 */
const route =  (app) => {
    app.get('/conversations', async (req, res) => {

        const {
            logger,
            csClient
        } = req.nexmo;

        const conversation = await csClient({url: "https://api.nexmo.com/v0.3//conversations"})
        logger.info(`Hello Request HTTP `)

        res.json(conversation.data)
    })
    app.get('/conversationEvents', async (req, res) => {
        const {
            logger,
            csClient
        } = req.nexmo;

        const conversation = await csClient({url: `https://api.nexmo.com/v0.3//conversations?name=${conversation_name}`  })
        logger.info(conversation.data, `Conversation is `)

        const conversation_id = conversation.data._embedded.conversations[0].id
        const events = await csClient({url: `https://api.nexmo.com/v0.3//conversations/${conversation_id}/events`  })
        res.json(events.data)
    })
}



module.exports = {
    rtcEvent,
    route,
    messagesInbound,
    messagesStatus
}