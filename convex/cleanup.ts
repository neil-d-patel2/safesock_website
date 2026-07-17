import { internalMutation } from "./_generated/server";

const BATCH_SIZE = 100;

export const cleanupDeletedChats = internalMutation({
  args: {},
  handler: async (ctx) => {
    const deletedChats = await ctx.db
      .query("chats")
      .filter((q) => q.neq(q.field("deletedAt"), undefined))
      .collect();

    for (const chat of deletedChats) {
      let messages = await ctx.db
        .query("messages")
        .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
        .take(BATCH_SIZE);

      while (messages.length > 0) {
        for (const msg of messages) {
          await ctx.db.delete(msg._id);
        }
        if (messages.length < BATCH_SIZE) break;
        messages = await ctx.db
          .query("messages")
          .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
          .take(BATCH_SIZE);
      }

      await ctx.db.delete(chat._id);
    }
  },
});
