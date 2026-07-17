import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  chats: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    deletedAt: v.optional(v.number()),
  }),
  messages: defineTable({
    body: v.string(),
    username: v.string(),
    chatId: v.id("chats"),
  })
    .index("by_chat", ["chatId"])
    .searchIndex("search_body", {
      searchField: "body",
      filterFields: ["chatId"],
    }),
});
