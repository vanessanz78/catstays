import { createBrowserRouter } from "react-router";

// Marketing pages
import { MarketingHome } from "./pages/marketing/Home";
import { MarketingFeatures } from "./pages/marketing/Features";
import { MarketingPricing } from "./pages/marketing/Pricing";
import { MarketingDemo } from "./pages/marketing/Demo";
import { Signup } from "./pages/marketing/Signup";
import { Login } from "./pages/marketing/Login";

// Onboarding
import { OnboardingWizard } from "./pages/onboarding/OnboardingWizard";
import { ConfirmEmail } from "./pages/onboarding/ConfirmEmail";
import { OnboardingDemo } from "./pages/onboarding/OnboardingDemo";
import { PublishSuccessScreen } from "./pages/onboarding/PublishSuccessScreen";
import { UpsellScreen } from "./pages/onboarding/UpsellScreen";
import { SubscriptionPreviewStep } from "./pages/onboarding/SubscriptionPreviewStep";

// Admin Dashboard
import { AdminDashboard } from "./pages/admin/Dashboard";
import { ModernDashboard } from "./pages/admin/ModernDashboard";
import { DashboardPreviewMock } from "./pages/onboarding/DashboardPreviewMock";
import { AdminCalendar } from "./pages/admin/Calendar";
import { BookingCalendar } from "./pages/admin/BookingCalendar";
import { AdminRoomPlanner } from "./pages/admin/RoomPlanner";
import { AdminBookings } from "./pages/admin/Bookings";
import { AdminCustomers } from "./pages/admin/Customers";
import { AdminSettings } from "./pages/admin/Settings";
import { SettingsDataImport } from "./pages/tenant/SettingsDataImport";
import { AdminAccounting } from "./pages/admin/Accounting";
import { AdminMessages } from "./pages/admin/Messages";
import { AdminPromotions } from "./pages/admin/Promotions";
import { AdminSocial } from "./pages/admin/Social";
import { CatUpdateGenerator } from "./pages/admin/CatUpdateGenerator";
import { AdminInsights } from "./pages/admin/Insights";
import { PhotoUpdates } from "./pages/admin/PhotoUpdates";
import { BookingConfirmationDemo } from "./pages/admin/BookingConfirmationDemo";
import { SmartImport } from "./pages/admin/SmartImport";
import { SmartDataImport } from "./pages/admin/SmartDataImport";
import { SubscriptionDemo, SubscriptionLockedDemo } from "./pages/admin/SubscriptionDemo";
import { PaymentPausedScreen } from "./pages/subscription/PaymentPausedScreen";
import { PaymentPausedDemo } from "./pages/subscription/PaymentPausedDemo";
import { PaymentPausedComparison } from "./pages/subscription/PaymentPausedComparison";

// New Dashboard Components
import { DashboardWebsiteEditor } from "./pages/admin/WebsiteEditor";
import { BookingSetup } from "./pages/admin/BookingSetup";
import { MarketingKit } from "./pages/admin/MarketingKit";
import { Subscription } from "./pages/admin/Subscription";
import { PaymentIntegration } from "./pages/admin/PaymentIntegration";
import { DomainSettings } from "./pages/admin/DomainSettings";

// Room Planner
import { RoomPlannerDashboard } from "./pages/rooms/RoomPlannerDashboard";
import { RoomManagement } from "./pages/rooms/RoomManagement";

// Public pages
import { UpdatePage } from "./pages/public/UpdatePage";

// Tenant Website
import { TenantHome } from "./pages/tenant/Home";
import { TenantAbout } from "./pages/tenant/About";
import { TenantRooms } from "./pages/tenant/Rooms";
import { TenantBooking } from "./pages/tenant/Booking";
import { BookingFlow } from "./pages/tenant/BookingFlow";
import { TenantContact } from "./pages/tenant/Contact";
import { TenantBlog } from "./pages/tenant/Blog";
import { TenantLogin } from "./pages/tenant/Login";

// Customer Portal
import { CustomerDashboard } from "./pages/customer/Dashboard";
import { CustomerBookings } from "./pages/customer/Bookings";
import { CustomerProfile } from "./pages/customer/Profile";
import { ClientPortalEntry } from "./pages/customer/ClientPortalEntry";

// Error handling
import { RootErrorBoundary } from "./components/RootErrorBoundary";
import { NotFound } from "./pages/NotFound";

// Website Builder & Platform Admin
import { WebsiteEditor } from "./pages/builder/WebsiteEditor";
import { WebsiteBuilderStudio } from "./pages/WebsiteBuilderStudio";
import { PlatformDashboard } from "./pages/platform/PlatformDashboard";
import { AdminLogin } from "./pages/platform/AdminLogin";
import { StaffDashboard } from "./pages/staff/StaffDashboard";

// Demo pages
import { AuthFlowDemo } from "./pages/demo/AuthFlowDemo";
import { RoomsPricingDemo } from "./pages/demo/RoomsPricingDemo";
import { DeloraineDemo, DeloraineDemoClientPortal, DeloraineDemoDashboard } from "./pages/demo/DeloraineDemo";
import BookingSystemDemo from "./pages/BookingSystemDemo";

export const router = createBrowserRouter([
  // Marketing website (catstays.app)
  {
    path: "/",
    Component: MarketingHome,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/home",
    Component: MarketingHome,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/marketing",
    Component: MarketingHome,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/features",
    Component: MarketingFeatures,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/pricing",
    Component: MarketingPricing,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/demo",
    Component: MarketingDemo,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/signup",
    Component: Signup,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/login",
    Component: Login,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/onboarding",
    Component: OnboardingWizard,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/confirm-email",
    Component: ConfirmEmail,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/onboarding-demo",
    Component: OnboardingDemo,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/publish-success",
    Component: PublishSuccessScreen,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/upsell",
    Component: UpsellScreen,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/subscription-preview",
    Component: SubscriptionPreviewStep,
    ErrorBoundary: RootErrorBoundary,
  },

  // Platform owner admin
  {
    path: "/admin",
    Component: PlatformDashboard,
    ErrorBoundary: RootErrorBoundary,
  },

  // Cattery staff dashboard
  {
    path: "/staff-dashboard",
    Component: StaffDashboard,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/bookings",
    Component: AdminBookings,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/customers",
    Component: AdminCustomers,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/calendar",
    Component: AdminCalendar,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/room-planner",
    Component: RoomPlannerDashboard,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/smart-import",
    Component: SmartImport,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/smart-data-import",
    Component: SmartDataImport,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/accounting",
    Component: AdminAccounting,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/messages",
    Component: AdminMessages,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/promotions",
    Component: AdminPromotions,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/social",
    Component: AdminSocial,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/cat-update-generator",
    Component: CatUpdateGenerator,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/insights",
    Component: AdminInsights,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/settings",
    Component: AdminSettings,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/booking-setup",
    Component: BookingSetup,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/payment",
    Component: PaymentIntegration,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/website-editor",
    Component: DashboardWebsiteEditor,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/marketing",
    Component: MarketingKit,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/subscription",
    Component: Subscription,
    ErrorBoundary: RootErrorBoundary,
  },

  // Legacy cattery dashboard routes
  {
    path: "/admin/overview",
    Component: AdminDashboard,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/modern-dashboard",
    Component: ModernDashboard,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/dashboard-preview-mock",
    Component: DashboardPreviewMock,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/calendar",
    Component: AdminCalendar,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/booking-calendar",
    Component: BookingCalendar,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/room-planner",
    Component: RoomPlannerDashboard,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/bookings",
    Component: AdminBookings,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/customers",
    Component: AdminCustomers,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/settings",
    Component: AdminSettings,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/settings/data",
    Component: SettingsDataImport,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/accounting",
    Component: AdminAccounting,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/messages",
    Component: AdminMessages,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/promotions",
    Component: AdminPromotions,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/social",
    Component: AdminSocial,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/cat-update-generator",
    Component: CatUpdateGenerator,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/insights",
    Component: AdminInsights,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/photo-updates",
    Component: PhotoUpdates,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/booking-confirmation-demo",
    Component: BookingConfirmationDemo,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/smart-import",
    Component: SmartImport,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/smart-data-import",
    Component: SmartDataImport,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/subscription-demo",
    Component: SubscriptionDemo,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/subscription-locked-demo",
    Component: SubscriptionLockedDemo,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/subscription/payment-paused",
    Component: PaymentPausedScreen,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/subscription/payment-paused-demo",
    Component: PaymentPausedDemo,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/subscription/payment-paused-comparison",
    Component: PaymentPausedComparison,
    ErrorBoundary: RootErrorBoundary,
  },

  // New Dashboard Components
  {
    path: "/admin/website-editor",
    Component: DashboardWebsiteEditor,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/booking-setup",
    Component: BookingSetup,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/marketing-kit",
    Component: MarketingKit,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/subscription",
    Component: Subscription,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/payment-integration",
    Component: PaymentIntegration,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/domain-settings",
    Component: DomainSettings,
    ErrorBoundary: RootErrorBoundary,
  },

  // Dashboard routes (alternative paths)
  {
    path: "/dashboard/website-editor",
    Component: DashboardWebsiteEditor,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/dashboard/booking-setup",
    Component: BookingSetup,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/dashboard/marketing",
    Component: MarketingKit,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/dashboard/subscription",
    Component: Subscription,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/dashboard/payment",
    Component: PaymentIntegration,
    ErrorBoundary: RootErrorBoundary,
  },

  // Room Planner
  {
    path: "/rooms/room-planner-dashboard",
    Component: RoomPlannerDashboard,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/rooms/room-management",
    Component: RoomManagement,
    ErrorBoundary: RootErrorBoundary,
  },

  // Public pages
  {
    path: "/update",
    Component: UpdatePage,
    ErrorBoundary: RootErrorBoundary,
  },

  // Tenant website (businessname.catstays.app)
  {
    path: "/site",
    Component: TenantHome,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/site/about",
    Component: TenantAbout,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/site/rooms",
    Component: TenantRooms,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/site/booking",
    Component: TenantBooking,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/site/booking-flow",
    Component: BookingFlow,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/site/contact",
    Component: TenantContact,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/site/blog",
    Component: TenantBlog,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/site/login",
    Component: TenantLogin,
    ErrorBoundary: RootErrorBoundary,
  },

  // Tenant website with dynamic tenant ID
  {
    path: "/tenant/:tenantId",
    Component: TenantHome,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/tenant/:tenantId/about",
    Component: TenantAbout,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/tenant/:tenantId/rooms",
    Component: TenantRooms,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/tenant/:tenantId/booking",
    Component: TenantBooking,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/tenant/:tenantId/booking-flow",
    Component: BookingFlow,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/tenant/:tenantId/contact",
    Component: TenantContact,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/tenant/:tenantId/blog",
    Component: TenantBlog,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/tenant/:tenantId/login",
    Component: TenantLogin,
    ErrorBoundary: RootErrorBoundary,
  },

  // Customer portal
  {
    path: "/client-portal",
    Component: ClientPortalEntry,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/client-portal/bookings",
    Component: ClientPortalEntry,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/client-portal/profile",
    Component: ClientPortalEntry,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/customer",
    Component: CustomerDashboard,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/customer/bookings",
    Component: CustomerBookings,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/customer/profile",
    Component: CustomerProfile,
    ErrorBoundary: RootErrorBoundary,
  },

  // Website Builder & Platform Admin
  {
    path: "/builder/website-editor",
    Component: WebsiteEditor,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/builder/website-studio",
    Component: WebsiteBuilderStudio,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/platform/dashboard",
    Component: PlatformDashboard,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/platform/admin-login",
    Component: AdminLogin,
    ErrorBoundary: RootErrorBoundary,
  },

  // Demo pages
  {
    path: "/demo/auth-flow",
    Component: AuthFlowDemo,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/demo/rooms-pricing",
    Component: RoomsPricingDemo,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/demo/booking-system",
    Component: BookingSystemDemo,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/demo/deloraine",
    Component: DeloraineDemo,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/demo/deloraine-dashboard",
    Component: DeloraineDemoDashboard,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/demo/deloraine-client",
    Component: DeloraineDemoClientPortal,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/demo/:demoSlug",
    Component: DeloraineDemo,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/demo/:demoSlug/dashboard",
    Component: DeloraineDemoDashboard,
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/demo/:demoSlug/client",
    Component: DeloraineDemoClientPortal,
    ErrorBoundary: RootErrorBoundary,
  },

  // Not found
  {
    path: "*",
    Component: NotFound,
    ErrorBoundary: RootErrorBoundary,
  },
]);
