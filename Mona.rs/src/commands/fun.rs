use serenity::framework::standard::macros::*;
use serenity::framework::standard::*;
use serenity::model::prelude::*;
use serenity::prelude::*;

#[command]
async fn bubble(ctx: &Context, msg: &Message, args: Args) -> CommandResult {
    if let Some(reply) = &msg.referenced_message {
        reply.attachments
    } else {
        msg.channel_id.say(&ctx.http, "Pepega").await?;
        return Ok(())
    }
    Ok(())
}
    

#[group]
#[commands(bubble)]
struct Fun;