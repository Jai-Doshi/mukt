import React from "react";
import { useMukt } from "../../context/MuktContext";
import { useAuth } from "../../context/AuthContext";
import { EntryModal } from "./EntryModal";
import { PersonModal } from "./PersonModal";
import { RateModal } from "./RateModal";
import { ConfirmModal } from "./ConfirmModal";
import { PayoffSimulatorModal } from "./PayoffSimulatorModal";
import { OnboardingModal } from "./OnboardingModal";
import { AuthModal } from "../auth/AuthModal";
import { InterestDetailsModal } from "./InterestDetailsModal";
import { RateRevisionModal } from "./RateRevisionModal";

export function ModalHost() {
  const { modal, state, activeTab } = useMukt();
  const { isAuthenticated } = useAuth();

  // If user is on the dedicated mobile auth screen, suppress all modals
  if (activeTab === "auth") {
    return null;
  }

  // If user is authenticated, do not show onboarding modal
  if (isAuthenticated && (!modal || modal.type === "onboarding")) {
    return null;
  }

  // If user is not yet onboarded and no other modal is explicitly active, show Onboarding
  if (!state.settings.onboarded && (!modal || modal.type === "onboarding")) {
    return <OnboardingModal />;
  }

  if (!modal) return null;

  switch (modal.type) {
    case "auth":
      return <AuthModal initialMode={modal.data?.mode || "signin"} />;
    case "entry":
      return <EntryModal data={modal.data} />;
    case "person":
      return <PersonModal data={modal.data} />;
    case "rate":
      return <RateModal data={modal.data} />;
    case "confirm":
      return <ConfirmModal data={modal.data} />;
    case "simulator":
      return <PayoffSimulatorModal data={modal.data} />;
    case "interest":
      return <InterestDetailsModal data={modal.data} />;
    case "rate-revision":
      return <RateRevisionModal data={modal.data} />;
    case "onboarding":
      return <OnboardingModal />;
    default:
      return null;
  }
}
