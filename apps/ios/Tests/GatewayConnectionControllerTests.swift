import AutopusKit
import Foundation
import Testing
import UIKit
@testable import Autopus

@Suite(.serialized) struct GatewayConnectionControllerTests {
    @Test @MainActor func resolvedDisplayNameSetsDefaultWhenMissing() {
        let defaults = UserDefaults.standard
        let displayKey = "node.displayName"

        withUserDefaults([displayKey: nil, "node.instanceId": "ios-test"]) {
            let appModel = NodeAppModel()
            let controller = GatewayConnectionController(appModel: appModel, startDiscovery: false)

            let resolved = controller._test_resolvedDisplayName(defaults: defaults)
            #expect(!resolved.isEmpty)
            #expect(defaults.string(forKey: displayKey) == resolved)
        }
    }

    @Test @MainActor func currentCapsReflectToggles() {
        withUserDefaults([
            "node.instanceId": "ios-test",
            "node.displayName": "Test Node",
            "camera.enabled": true,
            "location.enabledMode": AutopusLocationMode.always.rawValue,
            VoiceWakePreferences.enabledKey: true,
        ]) {
            let appModel = NodeAppModel()
            let controller = GatewayConnectionController(appModel: appModel, startDiscovery: false)
            let caps = Set(controller._test_currentCaps())

            #expect(caps.contains(AutopusCapability.canvas.rawValue))
            #expect(caps.contains(AutopusCapability.screen.rawValue))
            #expect(caps.contains(AutopusCapability.camera.rawValue))
            #expect(caps.contains(AutopusCapability.location.rawValue))
            #expect(caps.contains(AutopusCapability.voiceWake.rawValue))
            #expect(caps.contains(AutopusCapability.talk.rawValue))
        }
    }

    @Test @MainActor func currentCommandsIncludeLocationWhenEnabled() {
        withUserDefaults([
            "node.instanceId": "ios-test",
            "location.enabledMode": AutopusLocationMode.whileUsing.rawValue,
        ]) {
            let appModel = NodeAppModel()
            let controller = GatewayConnectionController(appModel: appModel, startDiscovery: false)
            let commands = Set(controller._test_currentCommands())

            #expect(commands.contains(AutopusLocationCommand.get.rawValue))
        }
    }
    @Test @MainActor func currentCommandsExcludeDangerousSystemExecCommands() {
        withUserDefaults([
            "node.instanceId": "ios-test",
            "camera.enabled": true,
            "location.enabledMode": AutopusLocationMode.whileUsing.rawValue,
        ]) {
            let appModel = NodeAppModel()
            let controller = GatewayConnectionController(appModel: appModel, startDiscovery: false)
            let commands = Set(controller._test_currentCommands())

            // iOS should expose notify, but not host shell/exec-approval commands.
            #expect(commands.contains(AutopusSystemCommand.notify.rawValue))
            #expect(!commands.contains(AutopusSystemCommand.run.rawValue))
            #expect(!commands.contains(AutopusSystemCommand.which.rawValue))
            #expect(!commands.contains(AutopusSystemCommand.execApprovalsGet.rawValue))
            #expect(!commands.contains(AutopusSystemCommand.execApprovalsSet.rawValue))
        }
    }

    @Test @MainActor func operatorConnectOptionsOnlyRequestApprovalScopeWhenEnabled() {
        let appModel = NodeAppModel()
        let withoutApprovalScope = appModel._test_makeOperatorConnectOptions(
            clientId: "autopus-ios",
            displayName: "Autopus iOS",
            includeApprovalScope: false)
        let withApprovalScope = appModel._test_makeOperatorConnectOptions(
            clientId: "autopus-ios",
            displayName: "Autopus iOS",
            includeApprovalScope: true)

        #expect(withoutApprovalScope.role == "operator")
        #expect(withoutApprovalScope.scopes.contains("operator.read"))
        #expect(withoutApprovalScope.scopes.contains("operator.write"))
        #expect(!withoutApprovalScope.scopes.contains("operator.approvals"))
        #expect(withoutApprovalScope.scopes.contains("operator.talk.secrets"))

        #expect(withApprovalScope.scopes.contains("operator.approvals"))
    }

    @Test func operatorApprovalScopeRequestsStayBackwardCompatible() {
        #expect(
            !NodeAppModel._test_shouldRequestOperatorApprovalScope(
                token: nil,
                password: nil,
                storedOperatorScopes: ["operator.read", "operator.write", "operator.talk.secrets"])
        )
        #expect(
            NodeAppModel._test_shouldRequestOperatorApprovalScope(
                token: nil,
                password: nil,
                storedOperatorScopes: [
                    "operator.approvals",
                    "operator.read",
                    "operator.write",
                    "operator.talk.secrets",
                ])
        )
        #expect(
            NodeAppModel._test_shouldRequestOperatorApprovalScope(
                token: "shared-token",
                password: nil,
                storedOperatorScopes: [])
        )
    }

    @Test @MainActor func loadLastConnectionReadsSavedValues() {
        let prior = KeychainStore.loadString(service: "ai.autopus.gateway", account: "lastConnection")
        defer {
            if let prior {
                _ = KeychainStore.saveString(prior, service: "ai.autopus.gateway", account: "lastConnection")
            } else {
                _ = KeychainStore.delete(service: "ai.autopus.gateway", account: "lastConnection")
            }
        }
        _ = KeychainStore.delete(service: "ai.autopus.gateway", account: "lastConnection")

        GatewaySettingsStore.saveLastGatewayConnectionManual(
            host: "gateway.example.com",
            port: 443,
            useTLS: true,
            stableID: "manual|gateway.example.com|443")
        let loaded = GatewaySettingsStore.loadLastGatewayConnection()
        #expect(loaded == .manual(host: "gateway.example.com", port: 443, useTLS: true, stableID: "manual|gateway.example.com|443"))
    }

    @Test @MainActor func loadLastConnectionReturnsNilForInvalidData() {
        let prior = KeychainStore.loadString(service: "ai.autopus.gateway", account: "lastConnection")
        defer {
            if let prior {
                _ = KeychainStore.saveString(prior, service: "ai.autopus.gateway", account: "lastConnection")
            } else {
                _ = KeychainStore.delete(service: "ai.autopus.gateway", account: "lastConnection")
            }
        }
        _ = KeychainStore.delete(service: "ai.autopus.gateway", account: "lastConnection")

        // Plant legacy UserDefaults with invalid host/port to exercise migration + validation.
        withUserDefaults([
            "gateway.last.kind": "manual",
            "gateway.last.host": "",
            "gateway.last.port": 0,
            "gateway.last.tls": false,
            "gateway.last.stableID": "manual|invalid|0",
        ]) {
            let loaded = GatewaySettingsStore.loadLastGatewayConnection()
            #expect(loaded == nil)
        }
    }
}
