import { render } from "@testing-library/react";

import { SettingsContext } from "utils/contexts/settings";

export function renderWithProviders(ui, { settings = {} } = {}) {
  const value = {
    settings,
    // Most tests don't need to mutate settings; this keeps Container happy.
    setSettings: () => {},
  };

  return render(<SettingsContext.Provider value={value}>{ui}</SettingsContext.Provider>);
}
