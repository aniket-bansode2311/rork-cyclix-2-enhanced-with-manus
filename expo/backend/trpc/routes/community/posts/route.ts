import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export const getByGroup = protectedProcedure
  .input(z.object({
    groupId: z.string(),
    limit: z.number().min(1).max(50).default(20),
    offset: z.number().min(0).default(0),
    sortBy: z.enum(['recent', 'popular', 'pinned']).default('recent'),
  }))
  .query(async ({ ctx, input }) => {
    // Verify user is a member of the group
    const { data: membership } = await ctx.supabase
      .from('community_memberships')
      .select('id')
      .eq('user_id', ctx.user.id)
      .eq('group_id', input.groupId)
      .single();

    if (!membership) {
      throw new Error('Access denied. You must be a member to view posts.');
    }

    let orderBy: { column: string; ascending: boolean };
    switch (input.sortBy) {
      case 'popular':
        orderBy = { column: 'upvotes', ascending: false };
        break;
      case 'pinned':
        orderBy = { column: 'is_pinned', ascending: false };
        break;
      default:
        orderBy = { column: 'created_at', ascending: false };
    }

    const { data, error } = await ctx.supabase
      .from('community_posts')
      .select(`
        *,
        author:author_id (
          id,
          email
        )
      `)
      .eq('group_id', input.groupId)
      .order(orderBy.column, { ascending: orderBy.ascending })
      .range(input.offset, input.offset + input.limit - 1);

    if (error) {
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }

    return data || [];
  });

export const getById = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .query(async ({ ctx, input }) => {
    const { data: post, error } = await ctx.supabase
      .from('community_posts')
      .select(`
        *,
        author:author_id (
          id,
          email
        ),
        community_groups (
          id,
          name
        )
      `)
      .eq('id', input.id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch post: ${error.message}`);
    }

    // Verify user is a member of the group
    const { data: membership } = await ctx.supabase
      .from('community_memberships')
      .select('id')
      .eq('user_id', ctx.user.id)
      .eq('group_id', post.group_id)
      .single();

    if (!membership) {
      throw new Error('Access denied. You must be a member to view this post.');
    }

    return post;
  });

export const create = protectedProcedure
  .input(z.object({
    groupId: z.string(),
    title: z.string().min(5).max(200),
    content: z.string().min(10).max(5000),
    post_type: z.enum(['discussion', 'question', 'support', 'celebration']).default('discussion'),
    is_anonymous: z.boolean().default(false),
    tags: z.array(z.string()).max(5).default([]),
  }))
  .mutation(async ({ ctx, input }) => {
    // Verify user is a member of the group
    const { data: membership } = await ctx.supabase
      .from('community_memberships')
      .select('id')
      .eq('user_id', ctx.user.id)
      .eq('group_id', input.groupId)
      .single();

    if (!membership) {
      throw new Error('Access denied. You must be a member to create posts.');
    }

    const { data, error } = await ctx.supabase
      .from('community_posts')
      .insert({
        group_id: input.groupId,
        author_id: ctx.user.id,
        title: input.title,
        content: input.content,
        post_type: input.post_type,
        is_anonymous: input.is_anonymous,
        tags: input.tags,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }

    return data;
  });

export const update = protectedProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().min(5).max(200).optional(),
    content: z.string().min(10).max(5000).optional(),
    tags: z.array(z.string()).max(5).optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { id, ...updates } = input;

    // Verify user is the author
    const { data: post, error: postError } = await ctx.supabase
      .from('community_posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (postError || post.author_id !== ctx.user.id) {
      throw new Error('Access denied. You can only edit your own posts.');
    }

    const { data, error } = await ctx.supabase
      .from('community_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update post: ${error.message}`);
    }

    return data;
  });

export const remove = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Verify user is the author or a moderator
    const { data: post, error: postError } = await ctx.supabase
      .from('community_posts')
      .select('author_id, group_id')
      .eq('id', input.id)
      .single();

    if (postError) {
      throw new Error('Post not found');
    }

    let canDelete = post.author_id === ctx.user.id;

    if (!canDelete) {
      // Check if user is a moderator/admin of the group
      const { data: membership } = await ctx.supabase
        .from('community_memberships')
        .select('role')
        .eq('user_id', ctx.user.id)
        .eq('group_id', post.group_id)
        .single();

      canDelete = membership && ['moderator', 'admin'].includes(membership.role);
    }

    if (!canDelete) {
      throw new Error('Access denied. You can only delete your own posts or moderate as admin/moderator.');
    }

    const { error } = await ctx.supabase
      .from('community_posts')
      .delete()
      .eq('id', input.id);

    if (error) {
      throw new Error(`Failed to delete post: ${error.message}`);
    }

    return { success: true };
  });

export const vote = protectedProcedure
  .input(z.object({
    postId: z.string(),
    voteType: z.enum(['upvote', 'downvote', 'remove']),
  }))
  .mutation(async ({ ctx, input }) => {
    // Get current post data
    const { data: post, error: postError } = await ctx.supabase
      .from('community_posts')
      .select('upvotes, downvotes, group_id')
      .eq('id', input.postId)
      .single();

    if (postError) {
      throw new Error('Post not found');
    }

    // Verify user is a member of the group
    const { data: membership } = await ctx.supabase
      .from('community_memberships')
      .select('id')
      .eq('user_id', ctx.user.id)
      .eq('group_id', post.group_id)
      .single();

    if (!membership) {
      throw new Error('Access denied. You must be a member to vote.');
    }

    // For simplicity, we'll just update the vote counts
    // In a production app, you'd want to track individual votes to prevent duplicate voting
    let updates: { upvotes?: number; downvotes?: number } = {};

    switch (input.voteType) {
      case 'upvote':
        updates.upvotes = post.upvotes + 1;
        break;
      case 'downvote':
        updates.downvotes = post.downvotes + 1;
        break;
      case 'remove':
        // This would require tracking individual votes to implement properly
        break;
    }

    if (Object.keys(updates).length > 0) {
      const { data, error } = await ctx.supabase
        .from('community_posts')
        .update(updates)
        .eq('id', input.postId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update vote: ${error.message}`);
      }

      return data;
    }

    return post;
  });