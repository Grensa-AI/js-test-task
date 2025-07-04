import { useState } from "react";

export const useTabs = (defaultTab = "summary") => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const switchToTab = (tabName) => {
    setActiveTab(tabName);
  };

  const isActive = (tabName) => {
    return activeTab === tabName;
  };

  return {
    activeTab,
    switchToTab,
    isActive,
  };
};
