use serenity::framework::standard::macros::*;
use serenity::framework::standard::*;
use serenity::model::prelude::*;
use serenity::async_trait;
use serenity::prelude::*;

macro_rules! try_return {
    ($try: expr, $kind: ident, $ret: expr) => {
        if let $kind(v) = $try { v } else { return $ret }
    };

    ($try: expr, $kind: ident) => {
        try_return!($try, $kind, ())
    };

    ($try: expr) => {
        try_return!($try, Some, ())
    };
}

struct Handler;

#[async_trait]
impl EventHandler for Handler {
    async fn ready(&self, _: Context, ready: Ready) {
        println!("{} is connected!", ready.user.name);
    }

    async fn guild_member_addition(&self, ctx: Context, member: Member) {
        const PIPE_BOMB: &str = "https://media.tenor.com/4WvbjPe0B_wAAAAC/heres-pipe.gif";
        let guild = try_return!(ctx.http.get_guild(member.guild_id.0).await, Ok);
        // if guild.system_channel_flags.contains(SystemChannelFlags::SUPPRESS_JOIN_NOTIFICATIONS) { return }
        if let Some(welcome_channel) = guild.system_channel_id {
            welcome_channel.send_message(&ctx.http, |msg|
                msg.content(member.mention()).embed(|emb| emb.image(PIPE_BOMB))
            ).await.ok();
        }
    }

    async fn reaction_add(&self, ctx: Context, reaction: Reaction) {
        const STAR_CHANNEL: u64 = 1050924693626036334;
        const THRESHOLD: u64 = 5;

        if !reaction.emoji.unicode_eq("⭐") { return };
        let starred = try_return!(reaction.message(&ctx.http).await, Ok);
        let rea = try_return!(starred.reactions.into_iter().find(|msg| msg.reaction_type == reaction.emoji));
        if rea.count < THRESHOLD { return };
        ChannelId(STAR_CHANNEL).send_message(&ctx.http, |msg| msg.embed(
            |emb| { emb
                .author(|author| {
                    author.name(&starred.author.name);
                    let avatar = try_return!(starred.author.avatar_url(), Some, author);
                    author.icon_url(avatar)
                })
            })).await.ok();
    }
}

#[command]
async fn bubble(ctx: &Context, msg: &Message, args: Args) -> CommandResult {
    msg.channel_id.say(&ctx.http, "Pepega").await?;
    Ok(())
}

#[group]
#[commands(bubble)]
struct General;

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok(); // Charger les variables environement à partir du .env
    let token = std::env::var("DISCORD_TOKEN").expect("DISCORD_TOKEN missing from env");

    let framework = StandardFramework::new()
        .configure(|c| c.prefix("!"))
        // The `#[group]` (and similarly, `#[command]`) macro generates static instances
        // containing any options you gave it. For instance, the group `name` and its `commands`.
        // Their identifiers, names you can use to refer to these instances in code, are an
        // all-uppercased version of the `name` with a `_GROUP` suffix appended at the end.
        .group(&GENERAL_GROUP);

    let mut client = Client::builder(token, GatewayIntents::all())
        .event_handler(Handler)
        .framework(framework)
        .await
        .expect("Error creating client");

    client.start().await.unwrap();
}