import { fireEvent } from "./dom/fire_event";
import { mainWindow } from "./dom/get_main_window";

declare global {
  // for fire event
  interface HASSDomEvents {
    "location-changed": NavigateOptions;
  }
}

export interface NavigateOptions {
  replace?: boolean;
  data?: any;
}

export const navigate = (path: string, options?: NavigateOptions) => {
  const replace = options?.replace || false;

  if (__DEMO__) {
    if (replace) {
      mainWindow.history.replaceState(
        mainWindow.history.state?.root
          ? { root: true }
          : (options?.data ?? null),
        "",
        `${mainWindow.location.pathname}#${path}`
      );
    } else {
      mainWindow.location.hash = path;
    }
  } else if (replace) {
    mainWindow.history.replaceState(
      mainWindow.history.state?.root ? { root: true } : (options?.data ?? null),
      "",
      path
    );
  } else {
    mainWindow.history.pushState(options?.data ?? null, "", path);
  }
  fireEvent(mainWindow, "location-changed", {
    replace,
  });
};
