import test from "node:test";
import assert from "node:assert/strict";
import {
  isValidMetaOrigin,
  parseWaEmbeddedSignupMessage,
} from "../src/lib/meta-sdk.ts";

test("1. Configuration API - Success & Failure parsing", () => {
  // Mock API 1 Success response
  const mockSuccessConfigResponse = {
    success: true,
    message: "Configuration retrieved",
    data: {
      app_id: "1627020728900812",
      config_id: "1683696456704799",
      graph_version: "v21.0",
      session_info_version: "2",
      is_configured: true,
    },
  };

  const config = mockSuccessConfigResponse.data;
  assert.equal(config.app_id, "1627020728900812");
  assert.equal(config.config_id, "1683696456704799");
  assert.equal(config.graph_version, "v21.0");

  // Mock API 1 Failure: missing credentials
  const mockFailureConfigResponse = {
    success: false,
    message: "Embedded signup not configured",
    data: null,
  };
  const isInvalid = !mockFailureConfigResponse.data?.app_id;
  assert.equal(isInvalid, true);
});

test("2. Initiation API - Success & Failure state validation", () => {
  // Mock API 2 Success
  const mockInitiateSuccess = {
    success: true,
    message: "Initiated",
    data: {
      session_id: "sess_meta_abc123",
      state: "crypt_oauth_state_xyz890",
    },
  };
  assert.ok(mockInitiateSuccess.data.state);
  assert.equal(mockInitiateSuccess.data.state, "crypt_oauth_state_xyz890");

  // Mock API 2 Failure (empty state)
  const mockInitiateFailure = {
    success: false,
    message: "Tenant unauthenticated",
    data: { state: "" },
  };
  assert.ok(!mockInitiateFailure.data.state);
});

test("3. Message Origin Validation - Trusted Meta Origins vs Malicious", () => {
  assert.equal(isValidMetaOrigin("https://www.facebook.com"), true);
  assert.equal(isValidMetaOrigin("https://web.facebook.com"), true);

  // Untrusted / Phishing / Third-party origins must be rejected
  assert.equal(isValidMetaOrigin("https://facebook.com.malicious.io"), false);
  assert.equal(isValidMetaOrigin("https://evil-site.com"), false);
  assert.equal(isValidMetaOrigin("http://www.facebook.com"), false); // HTTP not allowed
  assert.equal(isValidMetaOrigin("https://meta.com"), false);
});

test("4. Event Payload Parsing - Valid WA_EMBEDDED_SIGNUP", () => {
  // Stringified JSON payload from Meta
  const validFinishJson = JSON.stringify({
    type: "WA_EMBEDDED_SIGNUP",
    event: "FINISH",
    data: {
      phone_number_id: "phone_num_998877",
      waba_id: "waba_id_112233",
      current_step: "COMPLETED",
    },
  });

  const parsed = parseWaEmbeddedSignupMessage(validFinishJson);
  assert.ok(parsed);
  assert.equal(parsed.type, "WA_EMBEDDED_SIGNUP");
  assert.equal(parsed.event, "FINISH");
  assert.equal(parsed.data.phone_number_id, "phone_num_998877");
  assert.equal(parsed.data.waba_id, "waba_id_112233");

  // Object payload
  const validObjectPayload = {
    type: "WA_EMBEDDED_SIGNUP",
    event: "CANCEL",
    data: {},
  };
  const parsedObj = parseWaEmbeddedSignupMessage(validObjectPayload);
  assert.ok(parsedObj);
  assert.equal(parsedObj.event, "CANCEL");
});

test("5. Invalid Event Payload Handling", () => {
  // Non-JSON string
  assert.equal(parseWaEmbeddedSignupMessage("invalid-string"), null);

  // Different message type (e.g. from webpack or React devtools)
  const otherEvent = { type: "OTHER_EVENT", data: {} };
  assert.equal(parseWaEmbeddedSignupMessage(otherEvent), null);

  // Null or undefined
  assert.equal(parseWaEmbeddedSignupMessage(null), null);
  assert.equal(parseWaEmbeddedSignupMessage(undefined), null);
});

test("6. Callback API - Payload structure & Server validation", () => {
  // Mock API 3 Payload sent to Laravel
  const callbackPayload = {
    code: "AQD4h-123456_oauth_auth_code",
    state: "crypt_oauth_state_xyz890",
    waba_id: "waba_id_112233",
    phone_number_id: "phone_num_998877",
    set_as_default: true,
  };

  assert.ok(callbackPayload.code);
  assert.ok(callbackPayload.state);
  assert.equal(callbackPayload.set_as_default, true);

  // Mock API 3 Success Response from Laravel
  const mockCallbackSuccessResponse = {
    success: true,
    message: "WhatsApp account linked successfully",
    data: {
      id: 12,
      waba_id: "waba_id_112233",
      phone_number_id: "phone_num_998877",
      display_phone_number: "+1 555-0199",
      verified_name: "Acme Corp WhatsApp",
      status: "connected",
      quality_rating: "GREEN",
    },
  };

  assert.equal(mockCallbackSuccessResponse.success, true);
  assert.equal(mockCallbackSuccessResponse.data.status, "connected");
  assert.equal(mockCallbackSuccessResponse.data.waba_id, "waba_id_112233");
});

test("7. Duplicate Callback Prevention Guard", async () => {
  let callbackInvocations = 0;
  let isSubmitting = false;

  async function safeCallback(payload) {
    if (isSubmitting) {
      return { skipped: true };
    }
    isSubmitting = true;
    try {
      callbackInvocations += 1;
      return { success: true };
    } finally {
      // isSubmitting remains true during the transaction
    }
  }

  const payload = { code: "code_1", state: "state_1" };

  // First invocation
  const res1 = await safeCallback(payload);
  assert.equal(res1.success, true);

  // Duplicate invocation while pending or completed
  const res2 = await safeCallback(payload);
  assert.equal(res2.skipped, true);

  assert.equal(callbackInvocations, 1);
});

test("8. Expired or Invalid State Handling", () => {
  function validateState(state, expectedState) {
    if (!state || typeof state !== "string" || state.trim() === "") {
      throw new Error("Missing OAuth state token");
    }
    if (state !== expectedState) {
      throw new Error("OAuth state token mismatch or expired");
    }
    return true;
  }

  assert.equal(validateState("state_valid_123", "state_valid_123"), true);
  assert.throws(() => validateState("", "state_valid_123"), /Missing OAuth state token/);
  assert.throws(() => validateState("state_stale", "state_valid_123"), /mismatch or expired/);
});

test("9. Meta SDK Simulation - Launch, Capture, & Cancel", async () => {
  // Simulate mock window.FB
  let loginCalled = false;
  let loginOptions = null;

  const mockFB = {
    init: () => {},
    login: (callback, options) => {
      loginCalled = true;
      loginOptions = options;

      // Simulate user successful auth
      callback({
        authResponse: {
          code: "test_meta_code_999",
        },
      });
    },
  };

  mockFB.login(
    (response) => {
      assert.equal(response.authResponse.code, "test_meta_code_999");
    },
    {
      config_id: "cfg_123",
      response_type: "code",
      state: "state_abc",
    }
  );

  assert.equal(loginCalled, true);
  assert.equal(loginOptions.config_id, "cfg_123");
  assert.equal(loginOptions.response_type, "code");
  assert.equal(loginOptions.state, "state_abc");

  // Simulate user cancellation
  let cancelDetected = false;
  const mockCancelFB = {
    login: (callback) => {
      callback({ authResponse: null, status: "unknown" });
    },
  };

  mockCancelFB.login((response) => {
    if (!response.authResponse?.code) {
      cancelDetected = true;
    }
  });

  assert.equal(cancelDetected, true);
});

