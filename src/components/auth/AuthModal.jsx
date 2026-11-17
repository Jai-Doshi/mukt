import React, { useEffect } from "react";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useMukt } from "../../context/MuktContext";
import { DesktopAuthModal } from "./DesktopAuthModal";

export function AuthModal({ initialMode = "signin" }) {
  const isMobile = useIsMobile(991);
  const { closeModal, changeTab } = useMukt();

  useEffect(() => {
    if (isMobile) {
      closeModal();
      changeTab("auth");
    }
  }, [isMobile, closeModal, changeTab]);

  if (isMobile) {
    return null;
  }

  return <DesktopAuthModal initialMode={initialMode} onClose={closeModal} />;
}
