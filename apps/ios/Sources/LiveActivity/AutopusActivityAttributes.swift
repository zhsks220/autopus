import ActivityKit
import Foundation

/// Shared schema used by iOS app + Live Activity widget extension.
struct AutopusActivityAttributes: ActivityAttributes {
    var agentName: String
    var sessionKey: String

    struct ContentState: Codable, Hashable {
        var statusText: String
        var isIdle: Bool
        var isDisconnected: Bool
        var isConnecting: Bool
        var startedAt: Date
    }
}

#if DEBUG
extension AutopusActivityAttributes {
    static let preview = AutopusActivityAttributes(agentName: "main", sessionKey: "main")
}

extension AutopusActivityAttributes.ContentState {
    static let connecting = AutopusActivityAttributes.ContentState(
        statusText: "Connecting...",
        isIdle: false,
        isDisconnected: false,
        isConnecting: true,
        startedAt: .now)

    static let idle = AutopusActivityAttributes.ContentState(
        statusText: "Idle",
        isIdle: true,
        isDisconnected: false,
        isConnecting: false,
        startedAt: .now)

    static let disconnected = AutopusActivityAttributes.ContentState(
        statusText: "Disconnected",
        isIdle: false,
        isDisconnected: true,
        isConnecting: false,
        startedAt: .now)
}
#endif
