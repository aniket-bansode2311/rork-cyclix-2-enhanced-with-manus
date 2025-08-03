import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { getProfile, updateProfile } from "./routes/auth/profile/route";
import { getPeriodLogs, addPeriodLog, removePeriodLog } from "./routes/cycles/period-logs/route";
import { getSymptomLogs, addSymptomLog, removeSymptomLog } from "./routes/cycles/symptom-logs/route";
import { get as getCycles, update as updateCycles, getAnalytics, generatePredictions } from "./routes/cycles/cycles/route";
import { get as getHealthData, add as addHealthData, addBatch as addHealthDataBatch, remove as removeHealthData, getInsights as getHealthInsights } from "./routes/health/data/route";
import * as pregnancyMilestonesRoutes from "./routes/cycles/pregnancy-milestones/route";
import * as recommendationsRoutes from "./routes/guidance/recommendations/route";
import * as alertsRoutes from "./routes/guidance/alerts/route";

// Community routes
import * as communityGroupsRoutes from "./routes/community/groups/route";
import * as communityPostsRoutes from "./routes/community/posts/route";

// Privacy routes
import * as privacySettingsRoutes from "./routes/privacy/settings/route";

// Subscription routes
import * as subscriptionPlansRoutes from "./routes/subscription/plans/route";

// Notification routes
import * as notificationPreferencesRoutes from "./routes/notifications/preferences/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    profile: createTRPCRouter({
      get: getProfile,
      update: updateProfile,
    }),
  }),
  cycles: createTRPCRouter({
    periodLogs: createTRPCRouter({
      get: getPeriodLogs,
      add: addPeriodLog,
      remove: removePeriodLog,
    }),
    symptomLogs: createTRPCRouter({
      get: getSymptomLogs,
      add: addSymptomLog,
      remove: removeSymptomLog,
    }),
    cycles: createTRPCRouter({
      get: getCycles,
      update: updateCycles,
      getAnalytics: getAnalytics,
      generatePredictions: generatePredictions,
    }),
    pregnancyMilestones: createTRPCRouter({
      get: pregnancyMilestonesRoutes.get,
      add: pregnancyMilestonesRoutes.add,
      update: pregnancyMilestonesRoutes.update,
      remove: pregnancyMilestonesRoutes.remove,
      generateDefaultMilestones: pregnancyMilestonesRoutes.generateDefaultMilestones,
    }),
  }),
  health: createTRPCRouter({
    data: createTRPCRouter({
      get: getHealthData,
      add: addHealthData,
      addBatch: addHealthDataBatch,
      remove: removeHealthData,
      getInsights: getHealthInsights,
    }),
  }),
  guidance: createTRPCRouter({
    recommendations: createTRPCRouter({
      get: recommendationsRoutes.get,
      add: recommendationsRoutes.add,
      update: recommendationsRoutes.update,
      remove: recommendationsRoutes.remove,
      generatePersonalizedRecommendations: recommendationsRoutes.generatePersonalizedRecommendations,
    }),
    alerts: createTRPCRouter({
      get: alertsRoutes.get,
      add: alertsRoutes.add,
      update: alertsRoutes.update,
      remove: alertsRoutes.remove,
      generatePredictiveAlerts: alertsRoutes.generatePredictiveAlerts,
    }),
  }),
  community: createTRPCRouter({
    groups: createTRPCRouter({
      getAll: communityGroupsRoutes.getAll,
      getById: communityGroupsRoutes.getById,
      create: communityGroupsRoutes.create,
      join: communityGroupsRoutes.join,
      leave: communityGroupsRoutes.leave,
      getUserGroups: communityGroupsRoutes.getUserGroups,
    }),
    posts: createTRPCRouter({
      getByGroup: communityPostsRoutes.getByGroup,
      getById: communityPostsRoutes.getById,
      create: communityPostsRoutes.create,
      update: communityPostsRoutes.update,
      remove: communityPostsRoutes.remove,
      vote: communityPostsRoutes.vote,
    }),
  }),
  privacy: createTRPCRouter({
    settings: createTRPCRouter({
      get: privacySettingsRoutes.get,
      update: privacySettingsRoutes.update,
      requestDataExport: privacySettingsRoutes.requestDataExport,
      getExportRequests: privacySettingsRoutes.getExportRequests,
      requestAccountDeletion: privacySettingsRoutes.requestAccountDeletion,
      cancelAccountDeletion: privacySettingsRoutes.cancelAccountDeletion,
      getDeletionRequest: privacySettingsRoutes.getDeletionRequest,
    }),
  }),
  subscription: createTRPCRouter({
    plans: createTRPCRouter({
      getAll: subscriptionPlansRoutes.getAll,
      getUserSubscription: subscriptionPlansRoutes.getUserSubscription,
      createSubscription: subscriptionPlansRoutes.createSubscription,
      updateSubscription: subscriptionPlansRoutes.updateSubscription,
      cancelSubscription: subscriptionPlansRoutes.cancelSubscription,
      validateReceipt: subscriptionPlansRoutes.validateReceipt,
      getFeatureAccess: subscriptionPlansRoutes.getFeatureAccess,
    }),
  }),
  notifications: createTRPCRouter({
    preferences: createTRPCRouter({
      get: notificationPreferencesRoutes.get,
      update: notificationPreferencesRoutes.update,
      registerPushToken: notificationPreferencesRoutes.registerPushToken,
      unregisterPushToken: notificationPreferencesRoutes.unregisterPushToken,
      sendNotification: notificationPreferencesRoutes.sendNotification,
    }),
  }),
});

export type AppRouter = typeof appRouter;