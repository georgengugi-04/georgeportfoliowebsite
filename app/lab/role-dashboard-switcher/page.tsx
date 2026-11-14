import type { Metadata } from "next";
import ExperimentShell from "@/components/lab/ExperimentShell";
import RoleDashboard from "@/components/lab/RoleDashboard";

export const metadata: Metadata = {
  title: "Role-Based Dashboard Switcher — Lab 016",
  description: "One dataset, three roles, three dashboards: switch between farmer, transporter and retailer and see role-based access control shape what each can see and do.",
  alternates: { canonical: "/lab/role-dashboard-switcher" },
};

export default function Page() {
  return (
    <ExperimentShell
      n="016" title="Role-Based Dashboard Switcher" line="Same data, different doors."
      demoNote="Demo · mock animals and people · nothing is saved"
      shows="In a traceability system a farmer, a transporter and a retailer all look at the same animals but need different things. Switch roles to see the columns, rows and actions change, and try an action your role isn't allowed."
      how={<>
        <p>There is one list of animals and one permission table mapping each role to the actions it may perform. Every column, button and message asks a single function, <code>can(role, action)</code>. A forbidden action is refused with a 403-style message, not hidden, so you can see the rule working. Actions change the shared list: register an animal as the farmer, then switch to the transporter to find it ready for pickup.</p>
        <p>Real role-based access control also has to be enforced on the server, because anything the browser hides can still be requested. This demo shows the modelling and the interface side, with mock data only.</p>
      </>}
      related={{ label: "BeefTrace case study", href: "/work/beeftrace" }}
    >
      <RoleDashboard />
    </ExperimentShell>
  );
}
