import { useState, useEffect } from "react";
import { initializeI18n } from "./i18n";
import { AppContainer, AppContent } from "./AppContent";



export const App = () => {


  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initializeI18n().then(() => setI18nReady(true));
  }, []);

  if (!i18nReady) {
    return <AppContainer>Loading translations...</AppContainer>;
  }


  return (
    <AppContent />
  );
};
