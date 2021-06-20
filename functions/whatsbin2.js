// To make POST request to Pastebin API
// https://www.npmjs.com/package/axios
const axios = require("axios").default;

// To convert incoming URLencoded data to readable format
// https://www.npmjs.com/package/qs
const qs = require("qs");

// Keys and Tokens stored in Enviornment Variables

// Twilio Credentials
const twilioAccountSID = process.env.TWILIO_ACCOUNT_SID; // Available on your Twilio Dashboard
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN; // Available on your Twilio Dashboard
const twilioNumber = process.env.TWILIO_NUMBER; // WhatsApp Sandbox Contact Number
const clientNumber = process.env.CLIENT_NUMBER; // Your registred WhatsApp Number with Twilio

// Pastebin Credentials
const pbDevKey = process.env.PASTEBIN_DEV_KEY;
const pbUserKey = process.env.PASTEBIN_USER_KEY;
const pbFolderKey = process.env.PASTEBIN_FOLDER_ID;

// Client to send messages
// https://www.npmjs.com/package/twilio
const twilioClient = require("twilio")(twilioAccountSID, twilioAuthToken);

// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
exports.handler = async (event, context) => {
  try {
    let dataMap = qs.parse(event.body.toString()); // Payload recieved from Twilio webhook
    const content = dataMap.Body; // Message
    var pasteTitle = content.slice(0, 50) + "..."; // Title of Paste

    // Uploading message recieved from Twilio to Pastebin
    const res = await axios({
      method: "post",
      url: "https://pastebin.com/api/api_post.php",
      data: qs.stringify({
        api_dev_key: pbDevKey,
        api_option: "paste",
        api_user_key: pbUserKey,
        api_paste_code: content,
        api_paste_name: pasteTitle,
        api_paste_private: 0,
        api_folder_key: pbFolderKey,
      }),
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    // On sucessfull POST request
    var successString = `Pasted Succesfully! at ${res.data}`;
    console.log(successString);

    await replyBack(successString); // Calling Reply Function at Success

    return {
      statusCode: 204,
    };
  } catch (err) {
    // On Failed POST request
    var errorString = "There was error => " + err.toString();
    console.log(errorString);

    await replyBack(errorString); // Calling Reply Function at Failure

    return { statusCode: 500, body: err.toString() };
  }
};

// Replies to user on WhatsApp with ackowledgement of paste on Pastebin
async function replyBack(msg) {
  try {
    const a = await twilioClient.messages.create({
      from: "whatsapp:" + twilioNumber,
      body: msg,
      to: "whatsapp:" + clientNumber,
    });
    console.log(`Reply sent succesfully`);
    return 0;
  } catch (err) {
    console.log("There was error while replying back.. => " + err.toString());
    return -1;
  }
}
