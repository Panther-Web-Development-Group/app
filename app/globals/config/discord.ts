/**
 * Discord server ID for the official widget API
 * (`GET https://discord.com/api/guilds/{id}/widget.json`).
 * The server must have the widget enabled in Server Settings → Widget.
 */
export const DISCORD_GUILD_ID: string =
  process.env.NEXT_PUBLIC_DISCORD_GUILD_ID ?? ""
