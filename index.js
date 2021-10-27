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

const DATACENTER = `https://api.nexmo.com`;

const conversation_name = "my_conversation";

const rtcEvent = async (event, { logger, csClient }) => {};

const messagesInbound = (req, res) => {
  console.log("---- INBOUND MESSAGE ----");
  console.log(req.body);

  const { body } = req;
  const channel_type = body?.from?.type ?? body?.channel;

  let user;
  if (channel_type === "sms") user = `tomSmsUser1`;
  else if (channel_type === "mms") user = "tomMmsUser1";
  else if (channel_type === "whatsapp") user = "tomWhatsappUser1";
  else if (channel_type === "viber") user = "tomViberUser1";
  else if (channel_type === "messenger")
    user = `tomMessengerUser_${body.from.id}`;
  res.json([
    {
      action: "message",
      conversation_name: conversation_name,
      user: user,
      geo: "us-1",
    },
  ]);
};

const messagesStatus = () => {};

/**
 *
 * @param {object} app - this is an express app
 * you can register and handler same way you would do in express.
 * the only difference is that in every req, you will have a req.nexmo variable containning a nexmo context
 *
 */
const route = (app) => {
  app.get("/conversations", async (req, res) => {
    const { logger, csClient } = req.nexmo;

    const conversation = await csClient({
      url: "https://api.nexmo.com/v0.3//conversations",
    });
    logger.info(`Hello Request HTTP `);

    res.json(conversation.data);
  });
  app.get("/conversationEvents", async (req, res) => {
    const { logger, csClient } = req.nexmo;

    const conversation = await csClient({
      url: `https://api.nexmo.com/v0.3//conversations?name=${conversation_name}`,
    });
    logger.info(conversation.data, `Conversation is `);

    const conversation_id = conversation.data._embedded.conversations[0].id;
    const events = await csClient({
      url: `https://api.nexmo.com/v0.3//conversations/${conversation_id}/events`,
    });
    res.json(events.data);
  });

  app.get("/members", async (req, res) => {
    const { logger, csClient } = req.nexmo;
    const conversation = await csClient({
      url: `https://api.nexmo.com/v0.3//conversations?name=${conversation_name}`,
    });
    logger.info(conversation.data, `Conversation is `);

    const conversation_id = conversation.data._embedded.conversations[0].id;

    const members = await csClient({
      url: `https://api.nexmo.com/v0.3//conversations/${conversation_id}/members`,
    });
    res.json(members.data);
  });

  app.post("/sendMessage", async (req, res) => {
    const { body, nexmo } = req;
    const { logger, csClient } = nexmo;
    const { text, user_name } = body;

    const conversation = await csClient({
      url: `https://api.nexmo.com/v0.3//conversations?name=${conversation_name}`,
    });
    logger.info(conversation.data, `Conversation is `);

    const conversation_id = conversation.data._embedded.conversations[0].id;

    const user = await csClient({
      url: `https://api.nexmo.com/v0.3//users?name=${user_name}`,
    });
    logger.info(user.data, `User is `);
    let user_id;
    if (user.data._embedded.users.length == 0) {
      const new_user = await csClient({
        url: `https://api.nexmo.com/v0.3//users`,
        method: "POST",
        data: {
          name: user_name,
        },
      });
      user_id = new_user.data.id;
    } else {
      user_id = user.data._embedded.users[0].id;
    }
    let member_id;
    try {
      const new_member = await csClient({
        url: `https://api.nexmo.com/v0.3//conversations/${conversation_id}/members`,
        method: "POST",
        data: {
          user: {
            name: user_name,
          },
          state: "joined",
          channel: {
            type: "app",
          },
        },
      });
      member_id = new_member.data.id;
    } catch (err) {
      const members = await csClient({
        url: `https://api.nexmo.com/v0.3//conversations/${conversation_id}/members`,
      });
      member_id = members.data._embedded.members.filter(
        (member) => member._embedded.user.name === "andra"
      )[0].id;
    //   res.json(member_id);
      logger.error(err, `Error `);
    }

    const send_event = await csClient({
      url: `https://api.nexmo.com/v0.3//conversations/${conversation_id}/events`,
      method: "POST",
      data: {
        type: "message",
        from: member_id,
        body: {
          message_type: "text",
          text: text,
        },
      },
    });

    res.json(send_event.data);
  });
};

module.exports = {
  rtcEvent,
  route,
  messagesInbound,
  messagesStatus,
};
