# webliero_stat_recorder
Browser script for recording scores in webliero games

Currently exists in two forms: recorder.js (the script) and bookmarklet (a URI-escaped single-line version of the script that can be run as a bookmarklet in browser or simply pasted into the url field of your browser).

I don't yet have a script written to dynamically generate the bookmarklet, unfortunately- I'm using the generator at https://mrcoles.com/bookmarklet/ at this time. Until that's complete, the bookmarklet isn't functional.

To use the script, replace the "https://example.foo/bar" in send_slack_message() with whatever endpoint you want JSON sent to (see next section), then paste the whole thing into your browser console when playing. Future functionality will have javascript bookmarklets for easier usage.

TARGET URL:
Slack: Use the "Incoming Webhook" integration URL for the channel you want it pasted in. If your slack doesn't have an Incoming Webhook integration for this, https://api.slack.com/messaging/webhooks is a handy guide to setting one up, whereas if someone else has set up an integration on your slack for this and you just want to be able to send to it as well, you can access it via Customize Slack -> Menu -> Configure Apps. 

Discord: Use your discord server's webhook urL. If you want to configure a webhook for your discord, https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks . NOTE: As-is, the reporter's messages are configured based on slack's text formatting, so there might be some slight weirdness on discord (missing emoji, etc).
