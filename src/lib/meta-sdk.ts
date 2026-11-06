/**
 * Meta (Facebook) JavaScript SDK Loader & Embedded Signup Helper
 * Handles secure SDK injection, initialization, origin validation,
 * and postMessage event handling for WhatsApp Business Embedded Signup.
 */

declare global {
  interface Window {
    FB?: {
      init: (options: {
        appId: string;
        autoLogAppEvents?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: MetaLoginResponse) => void,
        options: {
          config_id: string;
          response_type: "code" | "token";
          override_default_response_type?: boolean;
          extras?: {
            setup?: Record<string, any>;
            featureType?: string;
            sessionInfoVersion?: string;
          };
          state: string;
        }
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export interface MetaLoginResponse {
  status?: string;
  authResponse?: {
    code?: string;
    accessToken?: string;
    expiresIn?: number;
    signedRequest?: string;
    userID?: string;
    [key: string]: any;
  };
  error?: {
    message?: string;
    code?: number;
    [key: string]: any;
  };
}

export interface WaEmbeddedSignupEventData {
  event: "FINISH" | "CANCEL" | "ERROR" | string;
  data?: {
    phone_number_id?: string;
    phoneNumberId?: string;
    waba_id?: string;
    wabaId?: string;
    current_step?: string;
    [key: string]: any;
  };
  error_message?: string;
  [key: string]: any;
}

export interface LaunchEmbeddedSignupParams {
  appId: string;
  configId: string;
  graphVersion?: string;
  sessionInfoVersion?: string;
  state: string;
  onEvent?: (event: WaEmbeddedSignupEventData) => void;
}

export interface LaunchEmbeddedSignupResult {
  code: string;
  state: string;
  waba_id?: string;
  phone_number_id?: string;
  rawEvent?: any;
}

const META_SDK_URL = "https://connect.facebook.net/en_US/sdk.js";
const VALID_META_ORIGINS = [
  "https://www.facebook.com",
  "https://web.facebook.com",
];

/**
 * Validates whether a Window MessageEvent comes from a trusted Meta origin.
 */
export function isValidMetaOrigin(origin: string): boolean {
  return VALID_META_ORIGINS.includes(origin);
}

/**
 * Parses and validates a WA_EMBEDDED_SIGNUP message payload safely.
 */
export function parseWaEmbeddedSignupMessage(
  data: any
): WaEmbeddedSignupEventData | null {
  if (!data) return null;

  let parsed = data;
  if (typeof data === "string") {
    try {
      parsed = JSON.parse(data);
    } catch {
      return null;
    }
  }

  if (
    typeof parsed === "object" &&
    parsed !== null &&
    parsed.type === "WA_EMBEDDED_SIGNUP"
  ) {
    return parsed as WaEmbeddedSignupEventData;
  }

  return null;
}

/**
 * Safely loads and initializes the Meta JavaScript SDK.
 * Prevents multiple script injections and configures the SDK with the tenant's Meta App ID.
 */
export function loadMetaSdk(
  appId: string,
  graphVersion: string = "v21.0"
): Promise<NonNullable<Window["FB"]>> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Meta SDK can only be loaded in the browser environment"));
      return;
    }

    if (!appId) {
      reject(new Error("Meta App ID is required to initialize the Meta SDK"));
      return;
    }

    // If FB is already loaded on the window, initialize and resolve
    if (window.FB) {
      try {
        window.FB.init({
          appId,
          autoLogAppEvents: true,
          xfbml: false,
          version: graphVersion || "v21.0",
        });
        resolve(window.FB);
        return;
      } catch (err) {
        // Fall through to re-attempt or reject
      }
    }

    // Set timeout to avoid hanging if ad-blockers block connect.facebook.net
    const timeoutId = setTimeout(() => {
      reject(
        new Error(
          "Meta SDK script load timed out. Please check your network connection or ad-blocker."
        )
      );
    }, 15000);

    window.fbAsyncInit = function () {
      clearTimeout(timeoutId);
      if (window.FB) {
        try {
          window.FB.init({
            appId,
            autoLogAppEvents: true,
            xfbml: false,
            version: graphVersion || "v21.0",
          });
          resolve(window.FB);
        } catch (err: any) {
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      } else {
        reject(new Error("Meta SDK failed to initialize"));
      }
    };

    // Check if script element already exists
    const existingScript = document.getElementById("facebook-jssdk") as HTMLScriptElement | null;
    if (existingScript) {
      // Script already attached; if FB is ready, resolve
      if (window.FB) {
        clearTimeout(timeoutId);
        window.FB.init({
          appId,
          autoLogAppEvents: true,
          xfbml: false,
          version: graphVersion || "v21.0",
        });
        resolve(window.FB);
      }
      return;
    }

    // Inject SDK script
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = META_SDK_URL;
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.onerror = () => {
      clearTimeout(timeoutId);
      reject(
        new Error(
          "Failed to load Meta JavaScript SDK from connect.facebook.net (ad-blocker may be active)."
        )
      );
    };

    document.head.appendChild(script);
  });
}

/**
 * Executes the Meta Embedded Signup flow:
 * 1. Attaches secure message listener for WA_EMBEDDED_SIGNUP
 * 2. Opens FB.login with config_id and OAuth code response_type
 * 3. Captures code and WABA/phone identifiers
 * 4. Cleans up listener and returns result
 */
export async function launchMetaEmbeddedSignup(
  params: LaunchEmbeddedSignupParams
): Promise<LaunchEmbeddedSignupResult> {
  const { appId, configId, graphVersion, sessionInfoVersion, state, onEvent } = params;

  if (!appId || !configId) {
    throw new Error("Meta App ID and Configuration ID are required to launch Embedded Signup.");
  }
  if (!state) {
    throw new Error("OAuth security state is required to launch Embedded Signup.");
  }

  const FB = await loadMetaSdk(appId, graphVersion);

  return new Promise((resolve, reject) => {
    let capturedWabaId: string | undefined;
    let capturedPhoneNumberId: string | undefined;
    let rawEventData: any;
    let isFinished = false;

    // Secure postMessage event listener
    const handleMessage = (event: MessageEvent) => {
      // 1. Origin verification
      if (!isValidMetaOrigin(event.origin)) {
        return;
      }

      // 2. Payload parsing and validation
      const signupData = parseWaEmbeddedSignupMessage(event.data);
      if (!signupData) return;

      onEvent?.(signupData);

      if (signupData.event === "FINISH") {
        const payload = signupData.data || {};
        capturedWabaId = payload.waba_id || payload.wabaId || capturedWabaId;
        capturedPhoneNumberId =
          payload.phone_number_id ||
          payload.phoneNumberId ||
          capturedPhoneNumberId;
        rawEventData = signupData;
      } else if (signupData.event === "CANCEL") {
        // User closed or cancelled within Meta dialog
        cleanup();
        isFinished = true;
        const cancelError: any = new Error("Embedded signup was cancelled by user.");
        cancelError.isCancelled = true;
        reject(cancelError);
      } else if (signupData.event === "ERROR") {
        cleanup();
        isFinished = true;
        reject(
          new Error(
            signupData.error_message ||
              "Meta Embedded Signup reported an error."
          )
        );
      }
    };

    const cleanup = () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("message", handleMessage);
      }
    };

    window.addEventListener("message", handleMessage);

    try {
      FB.login(
        (response: MetaLoginResponse) => {
          cleanup();
          if (isFinished) return;
          isFinished = true;

          if (response?.authResponse?.code) {
            resolve({
              code: response.authResponse.code,
              state,
              waba_id: capturedWabaId,
              phone_number_id: capturedPhoneNumberId,
              rawEvent: rawEventData,
            });
          } else if (response?.error) {
            reject(
              new Error(
                response.error.message || "Failed to authorize with Meta"
              )
            );
          } else {
            // Popup closed without authorization code
            const cancelError: any = new Error(
              "Meta signup popup was closed without completing authorization."
            );
            cancelError.isCancelled = true;
            reject(cancelError);
          }
        },
        {
          config_id: configId,
          response_type: "code",
          override_default_response_type: true,
          extras: {
            setup: {},
            featureType: "",
            sessionInfoVersion: sessionInfoVersion || "2",
          },
          state,
        }
      );
    } catch (err: any) {
      cleanup();
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}

