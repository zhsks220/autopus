import {
  normalizeOptionalLowercaseString,
  normalizeOptionalString,
} from "autopus/plugin-sdk/string-coerce-runtime";
import type { Command } from "commander";
import { t } from "../../../../src/i18n/cli/translate.js";
import { runCommandWithRuntime } from "../core-api.js";
import { runBrowserResizeWithOutput } from "./browser-cli-resize.js";
import { callBrowserRequest, type BrowserParentOpts } from "./browser-cli-shared.js";
import { registerBrowserCookiesAndStorageCommands } from "./browser-cli-state.cookies-storage.js";
import { danger, defaultRuntime, parseBooleanValue } from "./core-api.js";

function parseOnOff(raw: string): boolean | null {
  const parsed = parseBooleanValue(raw);
  return parsed === undefined ? null : parsed;
}

function runBrowserCommand(action: () => Promise<void>) {
  return runCommandWithRuntime(defaultRuntime, action, (err) => {
    defaultRuntime.error(danger(String(err)));
    defaultRuntime.exit(1);
  });
}

async function runBrowserSetRequest(params: {
  parent: BrowserParentOpts;
  path: string;
  body: Record<string, unknown>;
  successMessage: string;
}) {
  await runBrowserCommand(async () => {
    const profile = params.parent?.browserProfile;
    const result = await callBrowserRequest(
      params.parent,
      {
        method: "POST",
        path: params.path,
        query: profile ? { profile } : undefined,
        body: params.body,
      },
      { timeoutMs: 20000 },
    );
    if (params.parent?.json) {
      defaultRuntime.writeJson(result);
      return;
    }
    defaultRuntime.log(params.successMessage);
  });
}

export function registerBrowserStateCommands(
  browser: Command,
  parentOpts: (cmd: Command) => BrowserParentOpts,
) {
  registerBrowserCookiesAndStorageCommands(browser, parentOpts);

  const set = browser.command("set").description(t("desc.browser_environment_settings"));

  set
    .command("viewport")
    .description(t("desc.set_viewport_size_alias_for_resize"))
    .argument("<width>", "Viewport width", (v: string) => Number(v))
    .argument("<height>", "Viewport height", (v: string) => Number(v))
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (width: number, height: number, opts, cmd) => {
      const parent = parentOpts(cmd);
      const profile = parent?.browserProfile;
      await runBrowserCommand(async () => {
        await runBrowserResizeWithOutput({
          parent,
          profile,
          width,
          height,
          targetId: opts.targetId,
          timeoutMs: 20000,
          successMessage: `viewport set: ${width}x${height}`,
        });
      });
    });

  set
    .command("offline")
    .description(t("desc.toggle_offline_mode"))
    .argument("<on|off>", "on/off")
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (value: string, opts, cmd) => {
      const parent = parentOpts(cmd);
      const offline = parseOnOff(value);
      if (offline === null) {
        defaultRuntime.error(danger("Expected on|off"));
        defaultRuntime.exit(1);
        return;
      }
      await runBrowserSetRequest({
        parent,
        path: "/set/offline",
        body: {
          offline,
          targetId: normalizeOptionalString(opts.targetId),
        },
        successMessage: `offline: ${offline}`,
      });
    });

  set
    .command("headers")
    .description(t("desc.set_extra_http_headers_json_object"))
    .argument("[headersJson]", "JSON object of headers (alternative to --headers-json)")
    .option("--headers-json <json>", t("opt.json_object_of_headers"))
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (headersJson: string | undefined, opts, cmd) => {
      const parent = parentOpts(cmd);
      await runBrowserCommand(async () => {
        const headersJsonValue =
          normalizeOptionalString(opts.headersJson) ?? normalizeOptionalString(headersJson);
        if (!headersJsonValue) {
          throw new Error("Missing headers JSON (pass --headers-json or positional JSON argument)");
        }
        const parsed = JSON.parse(headersJsonValue) as unknown;
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("Headers JSON must be a JSON object");
        }
        const headers: Record<string, string> = {};
        for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
          if (typeof v === "string") {
            headers[k] = v;
          }
        }
        const profile = parent?.browserProfile;
        const result = await callBrowserRequest(
          parent,
          {
            method: "POST",
            path: "/set/headers",
            query: profile ? { profile } : undefined,
            body: {
              headers,
              targetId: normalizeOptionalString(opts.targetId),
            },
          },
          { timeoutMs: 20000 },
        );
        if (parent?.json) {
          defaultRuntime.writeJson(result);
          return;
        }
        defaultRuntime.log("headers set");
      });
    });

  set
    .command("credentials")
    .description(t("desc.set_http_basic_auth_credentials"))
    .option("--clear", t("opt.clear_credentials"), false)
    .argument("[username]", "Username")
    .argument("[password]", "Password")
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (username: string | undefined, password: string | undefined, opts, cmd) => {
      const parent = parentOpts(cmd);
      await runBrowserSetRequest({
        parent,
        path: "/set/credentials",
        body: {
          username: normalizeOptionalString(username),
          password,
          clear: Boolean(opts.clear),
          targetId: normalizeOptionalString(opts.targetId),
        },
        successMessage: opts.clear ? "credentials cleared" : "credentials set",
      });
    });

  set
    .command("geo")
    .description(t("desc.set_geolocation_and_grant_permission"))
    .option("--clear", t("opt.clear_geolocation_permissions"), false)
    .argument("[latitude]", "Latitude", (v: string) => Number(v))
    .argument("[longitude]", "Longitude", (v: string) => Number(v))
    .option("--accuracy <m>", t("opt.accuracy_in_meters"), (v: string) => Number(v))
    .option("--origin <origin>", t("opt.origin_to_grant_permissions_for"))
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (latitude: number | undefined, longitude: number | undefined, opts, cmd) => {
      const parent = parentOpts(cmd);
      await runBrowserSetRequest({
        parent,
        path: "/set/geolocation",
        body: {
          latitude: Number.isFinite(latitude) ? latitude : undefined,
          longitude: Number.isFinite(longitude) ? longitude : undefined,
          accuracy: Number.isFinite(opts.accuracy) ? opts.accuracy : undefined,
          origin: normalizeOptionalString(opts.origin),
          clear: Boolean(opts.clear),
          targetId: normalizeOptionalString(opts.targetId),
        },
        successMessage: opts.clear ? "geolocation cleared" : "geolocation set",
      });
    });

  set
    .command("media")
    .description(t("desc.emulate_prefers_color_scheme"))
    .argument("<dark|light|none>", "dark/light/none")
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (value: string, opts, cmd) => {
      const parent = parentOpts(cmd);
      const v = normalizeOptionalLowercaseString(value);
      const colorScheme =
        v === "dark" ? "dark" : v === "light" ? "light" : v === "none" ? "none" : null;
      if (!colorScheme) {
        defaultRuntime.error(danger("Expected dark|light|none"));
        defaultRuntime.exit(1);
        return;
      }
      await runBrowserSetRequest({
        parent,
        path: "/set/media",
        body: {
          colorScheme,
          targetId: normalizeOptionalString(opts.targetId),
        },
        successMessage: `media colorScheme: ${colorScheme}`,
      });
    });

  set
    .command("timezone")
    .description(t("desc.override_timezone_cdp"))
    .argument("<timezoneId>", "Timezone ID (e.g. America/New_York)")
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (timezoneId: string, opts, cmd) => {
      const parent = parentOpts(cmd);
      await runBrowserSetRequest({
        parent,
        path: "/set/timezone",
        body: {
          timezoneId,
          targetId: normalizeOptionalString(opts.targetId),
        },
        successMessage: `timezone: ${timezoneId}`,
      });
    });

  set
    .command("locale")
    .description(t("desc.override_locale_cdp"))
    .argument("<locale>", "Locale (e.g. en-US)")
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (locale: string, opts, cmd) => {
      const parent = parentOpts(cmd);
      await runBrowserSetRequest({
        parent,
        path: "/set/locale",
        body: {
          locale,
          targetId: normalizeOptionalString(opts.targetId),
        },
        successMessage: `locale: ${locale}`,
      });
    });

  set
    .command("device")
    .description('Apply a Playwright device descriptor (e.g. "iPhone 14")')
    .argument("<name>", "Device name (Playwright devices)")
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (name: string, opts, cmd) => {
      const parent = parentOpts(cmd);
      await runBrowserSetRequest({
        parent,
        path: "/set/device",
        body: {
          name,
          targetId: normalizeOptionalString(opts.targetId),
        },
        successMessage: `device: ${name}`,
      });
    });
}
