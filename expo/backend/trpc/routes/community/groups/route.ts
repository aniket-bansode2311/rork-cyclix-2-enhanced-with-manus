import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../../../create-context";

export const getAll = publicProcedure
  .input(z.object({
    category: z.enum(['general', 'pcos', 'endometriosis', 'ttc', 'pregnancy', 'menopause', 'teens']).optional(),
    search: z.string().optional(),
  }).optional())
  .query(async ({ ctx, input }) => {
    let query = ctx.supabase
      .from('community_groups')
      .select(`
        *,
        community_memberships!inner(count)
      `)
      .eq('is_private', false)
      .order('member_count', { ascending: false });

    if (input?.category) {
      query = query.eq('category', input.category);
    }

    if (input?.search) {
      query = query.ilike('name', `%${input.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch community groups: ${error.message}`);
    }

    return data || [];
  });

export const getById = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .query(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('community_groups')
      .select(`
        *,
        community_memberships!inner(
          user_id,
          role,
          joined_at
        )
      `)
      .eq('id', input.id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch community group: ${error.message}`);
    }

    // Check if user is a member
    const isMember = data.community_memberships.some(
      (membership: any) => membership.user_id === ctx.user.id
    );

    if (data.is_private && !isMember) {
      throw new Error('Access denied to private group');
    }

    return data;
  });

export const create = protectedProcedure
  .input(z.object({
    name: z.string().min(3).max(100),
    description: z.string().min(10).max(500),
    category: z.enum(['general', 'pcos', 'endometriosis', 'ttc', 'pregnancy', 'menopause', 'teens']),
    is_private: z.boolean().default(false),
    rules: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { data: group, error: groupError } = await ctx.supabase
      .from('community_groups')
      .insert({
        name: input.name,
        description: input.description,
        category: input.category,
        is_private: input.is_private,
        rules: input.rules,
        created_by: ctx.user.id,
        moderator_ids: [ctx.user.id],
        member_count: 1,
      })
      .select()
      .single();

    if (groupError) {
      throw new Error(`Failed to create community group: ${groupError.message}`);
    }

    // Add creator as admin member
    const { error: membershipError } = await ctx.supabase
      .from('community_memberships')
      .insert({
        user_id: ctx.user.id,
        group_id: group.id,
        role: 'admin',
      });

    if (membershipError) {
      throw new Error(`Failed to create membership: ${membershipError.message}`);
    }

    return group;
  });

export const join = protectedProcedure
  .input(z.object({
    groupId: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Check if group exists and is not private
    const { data: group, error: groupError } = await ctx.supabase
      .from('community_groups')
      .select('id, is_private, member_count')
      .eq('id', input.groupId)
      .single();

    if (groupError) {
      throw new Error(`Group not found: ${groupError.message}`);
    }

    if (group.is_private) {
      throw new Error('Cannot join private group without invitation');
    }

    // Check if already a member
    const { data: existingMembership } = await ctx.supabase
      .from('community_memberships')
      .select('id')
      .eq('user_id', ctx.user.id)
      .eq('group_id', input.groupId)
      .single();

    if (existingMembership) {
      throw new Error('Already a member of this group');
    }

    // Add membership
    const { data, error } = await ctx.supabase
      .from('community_memberships')
      .insert({
        user_id: ctx.user.id,
        group_id: input.groupId,
        role: 'member',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to join group: ${error.message}`);
    }

    // Update member count
    await ctx.supabase
      .from('community_groups')
      .update({ member_count: group.member_count + 1 })
      .eq('id', input.groupId);

    return data;
  });

export const leave = protectedProcedure
  .input(z.object({
    groupId: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Get membership info
    const { data: membership, error: membershipError } = await ctx.supabase
      .from('community_memberships')
      .select('id, role')
      .eq('user_id', ctx.user.id)
      .eq('group_id', input.groupId)
      .single();

    if (membershipError) {
      throw new Error('Not a member of this group');
    }

    // Don't allow group creator/admin to leave if they're the only admin
    if (membership.role === 'admin') {
      const { data: adminCount } = await ctx.supabase
        .from('community_memberships')
        .select('id')
        .eq('group_id', input.groupId)
        .eq('role', 'admin');

      if (adminCount && adminCount.length === 1) {
        throw new Error('Cannot leave group as the only admin. Transfer ownership first.');
      }
    }

    // Remove membership
    const { error } = await ctx.supabase
      .from('community_memberships')
      .delete()
      .eq('id', membership.id);

    if (error) {
      throw new Error(`Failed to leave group: ${error.message}`);
    }

    // Update member count
    const { data: group } = await ctx.supabase
      .from('community_groups')
      .select('member_count')
      .eq('id', input.groupId)
      .single();

    if (group) {
      await ctx.supabase
        .from('community_groups')
        .update({ member_count: Math.max(0, group.member_count - 1) })
        .eq('id', input.groupId);
    }

    return { success: true };
  });

export const getUserGroups = protectedProcedure
  .query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('community_memberships')
      .select(`
        role,
        joined_at,
        community_groups (
          id,
          name,
          description,
          category,
          member_count,
          created_at
        )
      `)
      .eq('user_id', ctx.user.id)
      .order('joined_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user groups: ${error.message}`);
    }

    return data || [];
  });