import type { ComponentType } from "react";
import { createBrowserRouter } from "react-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { RootErrorBoundary } from "./components/RootErrorBoundary";

type RouteComponent = ComponentType<Record<string, never>>;
type LazyRouteLoader = () => Promise<unknown>;

function withAuthProvider(Component: ComponentType) {
  function AuthenticatedRoute() {
    return (
      <AuthProvider>
        <Component />
      </AuthProvider>
    );
  }

  AuthenticatedRoute.displayName = `AuthenticatedRoute(${Component.displayName || Component.name || "Component"})`;
  return AuthenticatedRoute;
}

function lazyRoute(loader: LazyRouteLoader, exportName: string, requiresAuth = false) {
  return async () => {
    const module = (await loader()) as Record<string, RouteComponent>;
    const Component = module[exportName];

    if (!Component) {
      throw new Error(`Route component export "${exportName}" was not found.`);
    }

    return {
      Component: requiresAuth ? withAuthProvider(Component) : Component,
    };
  };
}

function lazyDefaultRoute(loader: LazyRouteLoader, requiresAuth = false) {
  return async () => {
    const module = (await loader()) as { default?: RouteComponent };
    const Component = module.default;

    if (!Component) {
      throw new Error("Default route component export was not found.");
    }

    return {
      Component: requiresAuth ? withAuthProvider(Component) : Component,
    };
  };
}

export const router = createBrowserRouter([
  // Marketing website (catstays.app)
  {
    path: "/",
    lazy: lazyRoute(() => import("./pages/marketing/Home"), "MarketingHome"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/home",
    lazy: lazyRoute(() => import("./pages/marketing/Home"), "MarketingHome"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/marketing",
    lazy: lazyRoute(() => import("./pages/marketing/Home"), "MarketingHome"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/features",
    lazy: lazyRoute(() => import("./pages/marketing/Features"), "MarketingFeatures"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/pricing",
    lazy: lazyRoute(() => import("./pages/marketing/Pricing"), "MarketingPricing"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/demo",
    lazy: lazyRoute(() => import("./pages/marketing/Demo"), "MarketingDemo"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/signup",
    lazy: lazyRoute(() => import("./pages/marketing/Signup"), "Signup", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/login",
    lazy: lazyRoute(() => import("./pages/marketing/Login"), "Login", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/onboarding",
    lazy: lazyRoute(() => import("./pages/onboarding/OnboardingWizard"), "OnboardingWizard", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/confirm-email",
    lazy: lazyRoute(() => import("./pages/onboarding/ConfirmEmail"), "ConfirmEmail"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/onboarding-demo",
    lazy: lazyRoute(() => import("./pages/onboarding/OnboardingDemo"), "OnboardingDemo"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/publish-success",
    lazy: lazyRoute(() => import("./pages/onboarding/PublishSuccessScreen"), "PublishSuccessScreen", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/upsell",
    lazy: lazyRoute(() => import("./pages/onboarding/UpsellScreen"), "UpsellScreen", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/subscription-preview",
    lazy: lazyRoute(() => import("./pages/onboarding/SubscriptionPreviewStep"), "SubscriptionPreviewStep", true),
    ErrorBoundary: RootErrorBoundary,
  },

  // Platform owner admin
  {
    path: "/admin",
    lazy: lazyRoute(() => import("./pages/platform/PlatformDashboard"), "PlatformDashboard", true),
    ErrorBoundary: RootErrorBoundary,
  },

  // Cattery staff dashboard
  {
    path: "/staff-dashboard",
    lazy: lazyRoute(() => import("./pages/staff/StaffDashboard"), "StaffDashboard", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/bookings",
    lazy: lazyRoute(() => import("./pages/admin/Bookings"), "AdminBookings", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/customers",
    lazy: lazyRoute(() => import("./pages/admin/Customers"), "AdminCustomers", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/calendar",
    lazy: lazyRoute(() => import("./pages/admin/Calendar"), "AdminCalendar", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/room-planner",
    lazy: lazyRoute(() => import("./pages/rooms/RoomPlannerDashboard"), "RoomPlannerDashboard", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/smart-import",
    lazy: lazyRoute(() => import("./pages/admin/SmartImport"), "SmartImport", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/smart-data-import",
    lazy: lazyRoute(() => import("./pages/admin/SmartDataImport"), "SmartDataImport", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/accounting",
    lazy: lazyRoute(() => import("./pages/admin/Accounting"), "AdminAccounting", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/messages",
    lazy: lazyRoute(() => import("./pages/admin/Messages"), "AdminMessages", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/promotions",
    lazy: lazyRoute(() => import("./pages/admin/Promotions"), "AdminPromotions", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/social",
    lazy: lazyRoute(() => import("./pages/admin/Social"), "AdminSocial", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/cat-update-generator",
    lazy: lazyRoute(() => import("./pages/admin/CatUpdateGenerator"), "CatUpdateGenerator", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/insights",
    lazy: lazyRoute(() => import("./pages/admin/Insights"), "AdminInsights", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/settings",
    lazy: lazyRoute(() => import("./pages/admin/Settings"), "AdminSettings", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/booking-setup",
    lazy: lazyRoute(() => import("./pages/admin/BookingSetup"), "BookingSetup", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/payment",
    lazy: lazyRoute(() => import("./pages/admin/PaymentIntegration"), "PaymentIntegration", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/website-editor",
    lazy: lazyRoute(() => import("./pages/admin/WebsiteEditor"), "DashboardWebsiteEditor", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/marketing",
    lazy: lazyRoute(() => import("./pages/admin/MarketingKit"), "MarketingKit", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/staff-dashboard/subscription",
    lazy: lazyRoute(() => import("./pages/admin/Subscription"), "Subscription", true),
    ErrorBoundary: RootErrorBoundary,
  },

  // Legacy cattery dashboard routes
  {
    path: "/admin/overview",
    lazy: lazyRoute(() => import("./pages/admin/Dashboard"), "AdminDashboard", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/modern-dashboard",
    lazy: lazyRoute(() => import("./pages/admin/ModernDashboard"), "ModernDashboard", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/dashboard-preview-mock",
    lazy: lazyRoute(() => import("./pages/onboarding/DashboardPreviewMock"), "DashboardPreviewMock", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/calendar",
    lazy: lazyRoute(() => import("./pages/admin/Calendar"), "AdminCalendar", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/booking-calendar",
    lazy: lazyRoute(() => import("./pages/admin/BookingCalendar"), "BookingCalendar", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/room-planner",
    lazy: lazyRoute(() => import("./pages/rooms/RoomPlannerDashboard"), "RoomPlannerDashboard", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/bookings",
    lazy: lazyRoute(() => import("./pages/admin/Bookings"), "AdminBookings", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/customers",
    lazy: lazyRoute(() => import("./pages/admin/Customers"), "AdminCustomers", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/settings",
    lazy: lazyRoute(() => import("./pages/admin/Settings"), "AdminSettings", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/settings/data",
    lazy: lazyRoute(() => import("./pages/tenant/SettingsDataImport"), "SettingsDataImport", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/accounting",
    lazy: lazyRoute(() => import("./pages/admin/Accounting"), "AdminAccounting", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/messages",
    lazy: lazyRoute(() => import("./pages/admin/Messages"), "AdminMessages", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/promotions",
    lazy: lazyRoute(() => import("./pages/admin/Promotions"), "AdminPromotions", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/social",
    lazy: lazyRoute(() => import("./pages/admin/Social"), "AdminSocial", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/cat-update-generator",
    lazy: lazyRoute(() => import("./pages/admin/CatUpdateGenerator"), "CatUpdateGenerator", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/insights",
    lazy: lazyRoute(() => import("./pages/admin/Insights"), "AdminInsights", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/photo-updates",
    lazy: lazyRoute(() => import("./pages/admin/PhotoUpdates"), "PhotoUpdates", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/booking-confirmation-demo",
    lazy: lazyRoute(() => import("./pages/admin/BookingConfirmationDemo"), "BookingConfirmationDemo", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/smart-import",
    lazy: lazyRoute(() => import("./pages/admin/SmartImport"), "SmartImport", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/smart-data-import",
    lazy: lazyRoute(() => import("./pages/admin/SmartDataImport"), "SmartDataImport", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/subscription-demo",
    lazy: lazyRoute(() => import("./pages/admin/SubscriptionDemo"), "SubscriptionDemo", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/subscription-locked-demo",
    lazy: lazyRoute(() => import("./pages/admin/SubscriptionDemo"), "SubscriptionLockedDemo", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/subscription/payment-paused",
    lazy: lazyRoute(() => import("./pages/subscription/PaymentPausedScreen"), "PaymentPausedScreen"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/subscription/payment-paused-demo",
    lazy: lazyRoute(() => import("./pages/subscription/PaymentPausedDemo"), "PaymentPausedDemo"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/subscription/payment-paused-comparison",
    lazy: lazyRoute(() => import("./pages/subscription/PaymentPausedComparison"), "PaymentPausedComparison"),
    ErrorBoundary: RootErrorBoundary,
  },

  // New Dashboard Components
  {
    path: "/admin/website-editor",
    lazy: lazyRoute(() => import("./pages/admin/WebsiteEditor"), "DashboardWebsiteEditor", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/booking-setup",
    lazy: lazyRoute(() => import("./pages/admin/BookingSetup"), "BookingSetup", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/marketing-kit",
    lazy: lazyRoute(() => import("./pages/admin/MarketingKit"), "MarketingKit", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/subscription",
    lazy: lazyRoute(() => import("./pages/admin/Subscription"), "Subscription", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/payment-integration",
    lazy: lazyRoute(() => import("./pages/admin/PaymentIntegration"), "PaymentIntegration", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/admin/domain-settings",
    lazy: lazyRoute(() => import("./pages/admin/DomainSettings"), "DomainSettings", true),
    ErrorBoundary: RootErrorBoundary,
  },

  // Dashboard routes (alternative paths)
  {
    path: "/dashboard/website-editor",
    lazy: lazyRoute(() => import("./pages/admin/WebsiteEditor"), "DashboardWebsiteEditor", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/dashboard/booking-setup",
    lazy: lazyRoute(() => import("./pages/admin/BookingSetup"), "BookingSetup", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/dashboard/marketing",
    lazy: lazyRoute(() => import("./pages/admin/MarketingKit"), "MarketingKit", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/dashboard/subscription",
    lazy: lazyRoute(() => import("./pages/admin/Subscription"), "Subscription", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/dashboard/payment",
    lazy: lazyRoute(() => import("./pages/admin/PaymentIntegration"), "PaymentIntegration", true),
    ErrorBoundary: RootErrorBoundary,
  },

  // Room Planner
  {
    path: "/rooms/room-planner-dashboard",
    lazy: lazyRoute(() => import("./pages/rooms/RoomPlannerDashboard"), "RoomPlannerDashboard", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/rooms/room-management",
    lazy: lazyRoute(() => import("./pages/rooms/RoomManagement"), "RoomManagement", true),
    ErrorBoundary: RootErrorBoundary,
  },

  // Public pages
  {
    path: "/update",
    lazy: lazyRoute(() => import("./pages/public/UpdatePage"), "UpdatePage"),
    ErrorBoundary: RootErrorBoundary,
  },

  // Tenant website (businessname.catstays.app)
  {
    path: "/site",
    lazy: lazyRoute(() => import("./pages/tenant/Home"), "TenantHome"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/site/about",
    lazy: lazyRoute(() => import("./pages/tenant/About"), "TenantAbout"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/site/rooms",
    lazy: lazyRoute(() => import("./pages/tenant/Rooms"), "TenantRooms"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/site/booking",
    lazy: lazyRoute(() => import("./pages/tenant/Booking"), "TenantBooking"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/site/booking-flow",
    lazy: lazyRoute(() => import("./pages/tenant/BookingFlow"), "BookingFlow"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/site/contact",
    lazy: lazyRoute(() => import("./pages/tenant/Contact"), "TenantContact"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/site/blog",
    lazy: lazyRoute(() => import("./pages/tenant/Blog"), "TenantBlog"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/site/login",
    lazy: lazyRoute(() => import("./pages/tenant/Login"), "TenantLogin"),
    ErrorBoundary: RootErrorBoundary,
  },

  // Tenant website with dynamic tenant ID
  {
    path: "/tenant/:tenantId",
    lazy: lazyRoute(() => import("./pages/tenant/Home"), "TenantHome"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/tenant/:tenantId/about",
    lazy: lazyRoute(() => import("./pages/tenant/About"), "TenantAbout"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/tenant/:tenantId/rooms",
    lazy: lazyRoute(() => import("./pages/tenant/Rooms"), "TenantRooms"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/tenant/:tenantId/booking",
    lazy: lazyRoute(() => import("./pages/tenant/Booking"), "TenantBooking"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/tenant/:tenantId/booking-flow",
    lazy: lazyRoute(() => import("./pages/tenant/BookingFlow"), "BookingFlow"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/tenant/:tenantId/contact",
    lazy: lazyRoute(() => import("./pages/tenant/Contact"), "TenantContact"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/tenant/:tenantId/blog",
    lazy: lazyRoute(() => import("./pages/tenant/Blog"), "TenantBlog"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/tenant/:tenantId/login",
    lazy: lazyRoute(() => import("./pages/tenant/Login"), "TenantLogin"),
    ErrorBoundary: RootErrorBoundary,
  },

  // Customer portal
  {
    path: "/client-portal",
    lazy: lazyRoute(() => import("./pages/customer/ClientPortalEntry"), "ClientPortalEntry"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/client-portal/bookings",
    lazy: lazyRoute(() => import("./pages/customer/ClientPortalEntry"), "ClientPortalEntry"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/client-portal/profile",
    lazy: lazyRoute(() => import("./pages/customer/ClientPortalEntry"), "ClientPortalEntry"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/customer",
    lazy: lazyRoute(() => import("./pages/customer/Dashboard"), "CustomerDashboard", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/customer/bookings",
    lazy: lazyRoute(() => import("./pages/customer/Bookings"), "CustomerBookings", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/customer/profile",
    lazy: lazyRoute(() => import("./pages/customer/Profile"), "CustomerProfile", true),
    ErrorBoundary: RootErrorBoundary,
  },

  // Website Builder & Platform Admin
  {
    path: "/builder/website-editor",
    lazy: lazyRoute(() => import("./pages/builder/WebsiteEditor"), "WebsiteEditor", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/builder/website-studio",
    lazy: lazyRoute(() => import("./pages/WebsiteBuilderStudio"), "WebsiteBuilderStudio", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/platform/dashboard",
    lazy: lazyRoute(() => import("./pages/platform/PlatformDashboard"), "PlatformDashboard", true),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/platform/admin-login",
    lazy: lazyRoute(() => import("./pages/platform/AdminLogin"), "AdminLogin"),
    ErrorBoundary: RootErrorBoundary,
  },

  // Demo pages
  {
    path: "/demo/auth-flow",
    lazy: lazyRoute(() => import("./pages/demo/AuthFlowDemo"), "AuthFlowDemo"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/demo/rooms-pricing",
    lazy: lazyRoute(() => import("./pages/demo/RoomsPricingDemo"), "RoomsPricingDemo"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/demo/booking-system",
    lazy: lazyDefaultRoute(() => import("./pages/BookingSystemDemo")),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/demo/deloraine",
    lazy: lazyRoute(() => import("./pages/demo/DeloraineDemo"), "DeloraineDemo"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/demo/deloraine-dashboard",
    lazy: lazyRoute(() => import("./pages/demo/DeloraineDemo"), "DeloraineDemoDashboard"),
    ErrorBoundary: RootErrorBoundary,
  },
  {
    path: "/demo/deloraine-client",
    lazy: lazyRoute(() => import("./pages/demo/DeloraineDemo"), "DeloraineDemoClientPortal"),
    ErrorBoundary: RootErrorBoundary,
  },

  // Not found
  {
    path: "*",
    lazy: lazyRoute(() => import("./pages/NotFound"), "NotFound"),
    ErrorBoundary: RootErrorBoundary,
  },
]);
