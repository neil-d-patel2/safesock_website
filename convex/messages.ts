import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const list = query({
  args: { chatId: v.id("chats"), paginationOpts: paginationOptsValidator },
  handler: async (ctx, { chatId, paginationOpts }) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", chatId))
      .order("desc")
      .paginate(paginationOpts);
  },
});

export const search = query({
  args: { chatId: v.id("chats"), query: v.string() },
  handler: async (ctx, { chatId, query }) => {
    return await ctx.db
      .query("messages")
      .withSearchIndex("search_body", (q) =>
        q.search("body", query).eq("chatId", chatId),
      )
      .collect();
  },
});

export const send = mutation({
  args: {
    chatId: v.id("chats"),
    username: v.string(),
    body: v.string(),
  },
  handler: async (ctx, { chatId, username, body }) => {
    await ctx.db.insert("messages", { chatId, username, body });
  },
});
