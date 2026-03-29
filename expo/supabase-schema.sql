-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT,
    average_cycle_length INTEGER DEFAULT 28 NOT NULL,
    average_period_length INTEGER DEFAULT 5 NOT NULL,
    last_period_start DATE,
    is_pregnancy_mode BOOLEAN DEFAULT false NOT NULL,
    birth_control_method TEXT,
    pregnancy_due_date DATE,
    pregnancy_start_date DATE,
    current_week INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id)
);

-- Create cycles table
CREATE TABLE IF NOT EXISTS public.cycles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    length INTEGER,
    period_length INTEGER,
    predicted_ovulation_date DATE,
    predicted_fertile_window_start DATE,
    predicted_fertile_window_end DATE,
    cycle_quality_score DECIMAL(3,2), -- 0.00 to 1.00 quality score
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create period_logs table
CREATE TABLE IF NOT EXISTS public.period_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    flow TEXT CHECK (flow IN ('light', 'medium', 'heavy', 'spotting')) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, date)
);

-- Create symptom_logs table
CREATE TABLE IF NOT EXISTS public.symptom_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    symptom_id TEXT NOT NULL,
    intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5),
    custom_value TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create health_data table for external integrations
CREATE TABLE IF NOT EXISTS public.health_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    data_type TEXT NOT NULL, -- 'bbt', 'weight', 'sleep', 'steps', 'heart_rate'
    value DECIMAL(10,2) NOT NULL,
    unit TEXT, -- 'celsius', 'fahrenheit', 'kg', 'lbs', 'hours', 'steps', 'bpm'
    source TEXT, -- 'apple_health', 'google_fit', 'manual'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create cycle_predictions table
CREATE TABLE IF NOT EXISTS public.cycle_predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    prediction_date DATE NOT NULL,
    predicted_period_start DATE NOT NULL,
    predicted_period_end DATE NOT NULL,
    predicted_ovulation_date DATE,
    predicted_fertile_window_start DATE,
    predicted_fertile_window_end DATE,
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00 confidence
    algorithm_version TEXT DEFAULT '1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.period_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_predictions ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for cycles
CREATE POLICY "Users can view own cycles" ON public.cycles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cycles" ON public.cycles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycles" ON public.cycles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cycles" ON public.cycles
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for period_logs
CREATE POLICY "Users can view own period logs" ON public.period_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own period logs" ON public.period_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own period logs" ON public.period_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own period logs" ON public.period_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for symptom_logs
CREATE POLICY "Users can view own symptom logs" ON public.symptom_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptom logs" ON public.symptom_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own symptom logs" ON public.symptom_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own symptom logs" ON public.symptom_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for health_data
CREATE POLICY "Users can view own health data" ON public.health_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health data" ON public.health_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health data" ON public.health_data
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health data" ON public.health_data
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for cycle_predictions
CREATE POLICY "Users can view own cycle predictions" ON public.cycle_predictions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cycle predictions" ON public.cycle_predictions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycle predictions" ON public.cycle_predictions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cycle predictions" ON public.cycle_predictions
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS cycles_user_id_idx ON public.cycles(user_id);
CREATE INDEX IF NOT EXISTS cycles_start_date_idx ON public.cycles(start_date);
CREATE INDEX IF NOT EXISTS period_logs_user_id_idx ON public.period_logs(user_id);
CREATE INDEX IF NOT EXISTS period_logs_date_idx ON public.period_logs(date);
CREATE INDEX IF NOT EXISTS symptom_logs_user_id_idx ON public.symptom_logs(user_id);
CREATE INDEX IF NOT EXISTS symptom_logs_date_idx ON public.symptom_logs(date);
CREATE INDEX IF NOT EXISTS symptom_logs_symptom_id_idx ON public.symptom_logs(symptom_id);
CREATE INDEX IF NOT EXISTS health_data_user_id_idx ON public.health_data(user_id);
CREATE INDEX IF NOT EXISTS health_data_date_idx ON public.health_data(date);
CREATE INDEX IF NOT EXISTS health_data_type_idx ON public.health_data(data_type);
CREATE INDEX IF NOT EXISTS cycle_predictions_user_id_idx ON public.cycle_predictions(user_id);
CREATE INDEX IF NOT EXISTS cycle_predictions_date_idx ON public.cycle_predictions(prediction_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_cycles_updated_at
    BEFORE UPDATE ON public.cycles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_period_logs_updated_at
    BEFORE UPDATE ON public.period_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_symptom_logs_updated_at
    BEFORE UPDATE ON public.symptom_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_health_data_updated_at
    BEFORE UPDATE ON public.health_data
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_cycle_predictions_updated_at
    BEFORE UPDATE ON public.cycle_predictions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create pregnancy_milestones table
CREATE TABLE IF NOT EXISTS public.pregnancy_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    week INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    due_date DATE,
    category TEXT CHECK (category IN ('appointment', 'test', 'development', 'preparation')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create personalized_recommendations table
CREATE TABLE IF NOT EXISTS public.personalized_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('nutrition', 'exercise', 'stress', 'sleep', 'symptom_management')) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    action_items JSONB NOT NULL DEFAULT '[]',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    based_on JSONB NOT NULL DEFAULT '[]',
    valid_until DATE,
    dismissed BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create health_alerts table
CREATE TABLE IF NOT EXISTS public.health_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('predictive', 'reminder', 'warning')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
    predicted_date DATE,
    based_on JSONB NOT NULL DEFAULT '[]',
    dismissed BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security for new tables
ALTER TABLE public.pregnancy_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for pregnancy_milestones
CREATE POLICY "Users can view own pregnancy milestones" ON public.pregnancy_milestones
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pregnancy milestones" ON public.pregnancy_milestones
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pregnancy milestones" ON public.pregnancy_milestones
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pregnancy milestones" ON public.pregnancy_milestones
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for personalized_recommendations
CREATE POLICY "Users can view own recommendations" ON public.personalized_recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations" ON public.personalized_recommendations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations" ON public.personalized_recommendations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recommendations" ON public.personalized_recommendations
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for health_alerts
CREATE POLICY "Users can view own health alerts" ON public.health_alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health alerts" ON public.health_alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health alerts" ON public.health_alerts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health alerts" ON public.health_alerts
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS pregnancy_milestones_user_id_idx ON public.pregnancy_milestones(user_id);
CREATE INDEX IF NOT EXISTS pregnancy_milestones_week_idx ON public.pregnancy_milestones(week);
CREATE INDEX IF NOT EXISTS personalized_recommendations_user_id_idx ON public.personalized_recommendations(user_id);
CREATE INDEX IF NOT EXISTS personalized_recommendations_type_idx ON public.personalized_recommendations(type);
CREATE INDEX IF NOT EXISTS health_alerts_user_id_idx ON public.health_alerts(user_id);
CREATE INDEX IF NOT EXISTS health_alerts_type_idx ON public.health_alerts(type);

-- Create triggers for updated_at on new tables
CREATE TRIGGER handle_pregnancy_milestones_updated_at
    BEFORE UPDATE ON public.pregnancy_milestones
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_personalized_recommendations_updated_at
    BEFORE UPDATE ON public.personalized_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_health_alerts_updated_at
    BEFORE UPDATE ON public.health_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Community Features Tables

-- Create community_groups table
CREATE TABLE IF NOT EXISTS public.community_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT CHECK (category IN ('general', 'pcos', 'endometriosis', 'ttc', 'pregnancy', 'menopause', 'teens')) NOT NULL,
    is_private BOOLEAN DEFAULT false NOT NULL,
    member_count INTEGER DEFAULT 0 NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    moderator_ids UUID[] DEFAULT '{}',
    rules TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create community_memberships table
CREATE TABLE IF NOT EXISTS public.community_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('member', 'moderator', 'admin')) DEFAULT 'member' NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, group_id)
);

-- Create community_posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type TEXT CHECK (post_type IN ('discussion', 'question', 'support', 'celebration')) DEFAULT 'discussion',
    is_anonymous BOOLEAN DEFAULT false NOT NULL,
    is_pinned BOOLEAN DEFAULT false NOT NULL,
    is_locked BOOLEAN DEFAULT false NOT NULL,
    upvotes INTEGER DEFAULT 0 NOT NULL,
    downvotes INTEGER DEFAULT 0 NOT NULL,
    comment_count INTEGER DEFAULT 0 NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create community_comments table
CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    parent_comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false NOT NULL,
    upvotes INTEGER DEFAULT 0 NOT NULL,
    downvotes INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create expert_qa_sessions table
CREATE TABLE IF NOT EXISTS public.expert_qa_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    expert_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    specialty TEXT NOT NULL, -- 'gynecology', 'nutrition', 'mental_health', etc.
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60 NOT NULL,
    max_participants INTEGER DEFAULT 100 NOT NULL,
    current_participants INTEGER DEFAULT 0 NOT NULL,
    status TEXT CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')) DEFAULT 'scheduled',
    recording_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create expert_qa_questions table
CREATE TABLE IF NOT EXISTS public.expert_qa_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.expert_qa_sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    is_anonymous BOOLEAN DEFAULT false NOT NULL,
    is_answered BOOLEAN DEFAULT false NOT NULL,
    upvotes INTEGER DEFAULT 0 NOT NULL,
    answered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Privacy and Data Control Tables

-- Create user_privacy_settings table
CREATE TABLE IF NOT EXISTS public.user_privacy_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    anonymous_mode BOOLEAN DEFAULT false NOT NULL,
    data_sharing_research BOOLEAN DEFAULT true NOT NULL,
    data_sharing_insights BOOLEAN DEFAULT true NOT NULL,
    data_sharing_third_party BOOLEAN DEFAULT false NOT NULL,
    marketing_communications BOOLEAN DEFAULT true NOT NULL,
    community_profile_visible BOOLEAN DEFAULT true NOT NULL,
    allow_friend_requests BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id)
);

-- Create data_export_requests table
CREATE TABLE IF NOT EXISTS public.data_export_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    request_type TEXT CHECK (request_type IN ('full_export', 'cycle_data', 'symptom_data', 'health_data')) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    file_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create account_deletion_requests table
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reason TEXT,
    scheduled_deletion_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'cancelled', 'completed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Monetization Tables

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2) NOT NULL,
    features JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
    platform TEXT CHECK (platform IN ('ios', 'android', 'web')) NOT NULL,
    platform_subscription_id TEXT NOT NULL,
    status TEXT CHECK (status IN ('active', 'cancelled', 'expired', 'pending')) NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false NOT NULL,
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id)
);

-- Create push_notification_tokens table
CREATE TABLE IF NOT EXISTS public.push_notification_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    token TEXT NOT NULL,
    platform TEXT CHECK (platform IN ('ios', 'android', 'web')) NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, token)
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    period_reminders BOOLEAN DEFAULT true NOT NULL,
    fertility_alerts BOOLEAN DEFAULT true NOT NULL,
    symptom_reminders BOOLEAN DEFAULT true NOT NULL,
    health_insights BOOLEAN DEFAULT true NOT NULL,
    community_updates BOOLEAN DEFAULT true NOT NULL,
    expert_qa_notifications BOOLEAN DEFAULT true NOT NULL,
    marketing_notifications BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id)
);

-- Enable Row Level Security for community tables
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_qa_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_qa_questions ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security for privacy tables
ALTER TABLE public.user_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security for monetization tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Community Policies
CREATE POLICY "Anyone can view public groups" ON public.community_groups
    FOR SELECT USING (NOT is_private OR id IN (
        SELECT group_id FROM public.community_memberships WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can view their memberships" ON public.community_memberships
    FOR SELECT USING (user_id = auth.uid() OR group_id IN (
        SELECT group_id FROM public.community_memberships WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can join groups" ON public.community_memberships
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave groups" ON public.community_memberships
    FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Members can view group posts" ON public.community_posts
    FOR SELECT USING (group_id IN (
        SELECT group_id FROM public.community_memberships WHERE user_id = auth.uid()
    ));

CREATE POLICY "Members can create posts" ON public.community_posts
    FOR INSERT WITH CHECK (author_id = auth.uid() AND group_id IN (
        SELECT group_id FROM public.community_memberships WHERE user_id = auth.uid()
    ));

CREATE POLICY "Authors can update their posts" ON public.community_posts
    FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Members can view comments" ON public.community_comments
    FOR SELECT USING (post_id IN (
        SELECT id FROM public.community_posts WHERE group_id IN (
            SELECT group_id FROM public.community_memberships WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Members can create comments" ON public.community_comments
    FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "Anyone can view expert sessions" ON public.expert_qa_sessions
    FOR SELECT USING (true);

CREATE POLICY "Users can submit questions" ON public.expert_qa_questions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view questions" ON public.expert_qa_questions
    FOR SELECT USING (true);

-- Privacy Policies
CREATE POLICY "Users can view own privacy settings" ON public.user_privacy_settings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own privacy settings" ON public.user_privacy_settings
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own export requests" ON public.data_export_requests
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create export requests" ON public.data_export_requests
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own deletion requests" ON public.account_deletion_requests
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create deletion requests" ON public.account_deletion_requests
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Monetization Policies
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own subscription" ON public.user_subscriptions
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage own push tokens" ON public.push_notification_tokens
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage own notification preferences" ON public.notification_preferences
    FOR ALL USING (user_id = auth.uid());

-- Create indexes for community tables
CREATE INDEX IF NOT EXISTS community_groups_category_idx ON public.community_groups(category);
CREATE INDEX IF NOT EXISTS community_memberships_user_id_idx ON public.community_memberships(user_id);
CREATE INDEX IF NOT EXISTS community_memberships_group_id_idx ON public.community_memberships(group_id);
CREATE INDEX IF NOT EXISTS community_posts_group_id_idx ON public.community_posts(group_id);
CREATE INDEX IF NOT EXISTS community_posts_author_id_idx ON public.community_posts(author_id);
CREATE INDEX IF NOT EXISTS community_comments_post_id_idx ON public.community_comments(post_id);
CREATE INDEX IF NOT EXISTS expert_qa_sessions_scheduled_at_idx ON public.expert_qa_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS expert_qa_questions_session_id_idx ON public.expert_qa_questions(session_id);

-- Create indexes for privacy and monetization tables
CREATE INDEX IF NOT EXISTS user_privacy_settings_user_id_idx ON public.user_privacy_settings(user_id);
CREATE INDEX IF NOT EXISTS data_export_requests_user_id_idx ON public.data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS user_subscriptions_user_id_idx ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS push_notification_tokens_user_id_idx ON public.push_notification_tokens(user_id);

-- Create triggers for updated_at on new tables
CREATE TRIGGER handle_community_groups_updated_at
    BEFORE UPDATE ON public.community_groups
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_community_posts_updated_at
    BEFORE UPDATE ON public.community_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_community_comments_updated_at
    BEFORE UPDATE ON public.community_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_expert_qa_sessions_updated_at
    BEFORE UPDATE ON public.expert_qa_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_expert_qa_questions_updated_at
    BEFORE UPDATE ON public.expert_qa_questions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_user_privacy_settings_updated_at
    BEFORE UPDATE ON public.user_privacy_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_data_export_requests_updated_at
    BEFORE UPDATE ON public.data_export_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_account_deletion_requests_updated_at
    BEFORE UPDATE ON public.account_deletion_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_subscription_plans_updated_at
    BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_push_notification_tokens_updated_at
    BEFORE UPDATE ON public.push_notification_tokens
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, features) VALUES
('Free', 'Basic cycle tracking and insights', 0.00, 0.00, '["Basic cycle tracking", "Period logging", "Basic insights", "Educational content"]'),
('Premium', 'Advanced insights and personalized guidance', 9.99, 99.99, '["All Free features", "Advanced cycle predictions", "Personalized health guidance", "Symptom pattern analysis", "Health data integration", "Priority support", "Export data", "Community access"]'),
('Premium Plus', 'Complete health companion with expert access', 19.99, 199.99, '["All Premium features", "Expert Q&A sessions", "1-on-1 consultations", "Advanced pregnancy tracking", "Fertility optimization", "Custom meal plans", "Workout recommendations"]')
ON CONFLICT DO NOTHING;