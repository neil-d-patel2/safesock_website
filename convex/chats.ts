import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const chats = await ctx.db.query("chats").order("desc").collect();
    return chats.filter((c) => c.deletedAt === undefined);
  },
});

export const get = query({
  args: { id: v.id("chats") },
  handler: async (ctx, { id }) => {
    const chat = await ctx.db.get(id);
    if (!chat || chat.deletedAt !== undefined) {
      return null;
    }
    return chat;
  },
});

export const create = mutation({
  args: { name: v.string(), description: v.optional(v.string()) },
  handler: async (ctx, { name, description }) => {
    return await ctx.db.insert("chats", { name, description });
  },
});

export const remove = mutation({
  args: { id: v.id("chats") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { deletedAt: Date.now() });
  },
});
