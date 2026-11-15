import React from "react";
import { useMukt } from "../../context/MuktContext";
import { EntryModal } from "./EntryModal";
import { PersonModal } from "./PersonModal";
import { RateModal } from "./RateModal";
import { ConfirmModal } from "./ConfirmModal";
import { PayoffSimulatorModal } from "./PayoffSimulatorModal";
import { OnboardingModal } from "./OnboardingModal";

export function ModalHost() {
  const { modal, state } = useMukt();

  // If user is not yet onboarded and no other modal is explicitly active, show Onboarding
  if (!state.settings.onboarded && (!modal || modal.type === "onboarding")) {
    return <OnboardingModal />;
  }

  if (!modal) return null;

  switch (modal.type) {
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
    case "onboarding":
      return <OnboardingModal />;
    default:
      return null;
  }
}
