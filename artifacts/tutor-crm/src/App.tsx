import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Leads from "@/pages/leads";
import Parents from "@/pages/parents";
import NewParent from "@/pages/parents/new";
import Tutors from "@/pages/tutors";
import NewTutor from "@/pages/tutors/new";
import Requirements from "@/pages/requirements";
import NewRequirement from "@/pages/requirements/new";
import RequirementDetail from "@/pages/requirements/[id]";
import Demos from "@/pages/demos";
import Payments from "@/pages/payments";
import Staff from "@/pages/staff";
import Board from "@/pages/board";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, roles }: { component: any, roles?: string[] }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Redirect to="/" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/board" component={Board} />
      
      {/* Routes wrapped in the main App Layout */}
      <Route path="/:rest*">
        <Layout>
          <Switch>
            <Route path="/dashboard">
              {() => <ProtectedRoute component={Dashboard} />}
            </Route>

            <Route path="/leads">
              {() => <ProtectedRoute component={Leads} roles={["admin", "parent_success_executive"]} />}
            </Route>

            <Route path="/parents">
              {() => <ProtectedRoute component={Parents} roles={["admin", "parent_success_executive"]} />}
            </Route>
            <Route path="/parents/new">
              {() => <ProtectedRoute component={NewParent} roles={["admin", "parent_success_executive"]} />}
            </Route>

            <Route path="/tutors">
              {() => <ProtectedRoute component={Tutors} roles={["admin", "tutor_acquisition_executive"]} />}
            </Route>
            <Route path="/tutors/new">
              {() => <ProtectedRoute component={NewTutor} roles={["admin", "tutor_acquisition_executive"]} />}
            </Route>

            <Route path="/requirements">
              {() => <ProtectedRoute component={Requirements} roles={["admin", "tutor_acquisition_executive"]} />}
            </Route>
            <Route path="/requirements/new">
              {() => <ProtectedRoute component={NewRequirement} roles={["admin", "tutor_acquisition_executive"]} />}
            </Route>
            <Route path="/requirements/:id">
              {() => <ProtectedRoute component={RequirementDetail} roles={["admin", "tutor_acquisition_executive"]} />}
            </Route>

            <Route path="/demos">
              {() => <ProtectedRoute component={Demos} roles={["admin", "parent_success_executive"]} />}
            </Route>

            <Route path="/payments">
              {() => <ProtectedRoute component={Payments} roles={["admin"]} />}
            </Route>

            <Route path="/staff">
              {() => <ProtectedRoute component={Staff} roles={["admin"]} />}
            </Route>

            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
