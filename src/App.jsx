import React, { useState } from "react";
import { MuktProvider, useMukt } from "./context/MuktContext";
import { useIsMobile } from "./hooks/useIsMobile";
import { Sidebar } from "./components/layout/Sidebar";
import { MobileHeader } from "./components/layout/MobileHeader";
import { BottomNav } from "./components/layout/BottomNav";
import { OverviewView } from "./components/overview/OverviewView";
import { RepaymentsView } from "./components/ledger/RepaymentsView";
import { BorrowingsView } from "./components/ledger/BorrowingsView";
import { SettingsView } from "./components/settings/SettingsView";
import { MobileOverview } from "./components/mobile/MobileOverview";
import { MobileLedger } from "./components/mobile/MobileLedger";
import { ModalHost } from "./components/modals/ModalHost";
import { Toast } from "./components/common/Toast";
import { Preloader } from "./components/common/Preloader";

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const { activeTab } = useMukt();
  const isMobile = useIsMobile(991);

  return (
    <>
      {isLoading && <Preloader onFinish={() => setIsLoading(false)} />}
      <div className="app-layout">
        {/* Desktop / Tablet Sidebar */}
        {!isMobile && <Sidebar />}

        {/* Main Content Area */}
        <div className="main-viewport">
          {/* Mobile Frosted Header */}
          {isMobile && <MobileHeader />}

          {/* View Switcher: Dedicated Native Mobile vs Executive Desktop */}
          <main tabIndex={-1} style={{ outline: "none", minHeight: "100vh" }}>
            {activeTab === "overview" &&
              (isMobile ? <MobileOverview /> : <OverviewView />)}

            {activeTab === "payments" &&
              (isMobile ? <MobileLedger kind="payments" /> : <RepaymentsView />)}

            {activeTab === "borrowed" &&
              (isMobile ? <MobileLedger kind="borrowed" /> : <BorrowingsView />)}

            {activeTab === "settings" && <SettingsView />}
          </main>

          {/* Mobile Bottom Navigation */}
          {isMobile && <BottomNav />}
        </div>

        {/* Global Modals & Notifications */}
        <ModalHost />
        <Toast />
      </div>
    </>
  );
}

export default function App() {
  return (
    <MuktProvider>
      <AppContent />
    </MuktProvider>
  );
}
