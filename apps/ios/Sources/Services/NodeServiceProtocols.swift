import CoreLocation
import Foundation
import AutopusKit
import UIKit

typealias AutopusCameraSnapResult = (format: String, base64: String, width: Int, height: Int)
typealias AutopusCameraClipResult = (format: String, base64: String, durationMs: Int, hasAudio: Bool)

protocol CameraServicing: Sendable {
    func listDevices() async -> [CameraController.CameraDeviceInfo]
    func snap(params: AutopusCameraSnapParams) async throws -> AutopusCameraSnapResult
    func clip(params: AutopusCameraClipParams) async throws -> AutopusCameraClipResult
}

protocol ScreenRecordingServicing: Sendable {
    func record(
        screenIndex: Int?,
        durationMs: Int?,
        fps: Double?,
        includeAudio: Bool?,
        outPath: String?) async throws -> String
}

@MainActor
protocol LocationServicing: Sendable {
    func authorizationStatus() -> CLAuthorizationStatus
    func accuracyAuthorization() -> CLAccuracyAuthorization
    func ensureAuthorization(mode: AutopusLocationMode) async -> CLAuthorizationStatus
    func currentLocation(
        params: AutopusLocationGetParams,
        desiredAccuracy: AutopusLocationAccuracy,
        maxAgeMs: Int?,
        timeoutMs: Int?) async throws -> CLLocation
    func startLocationUpdates(
        desiredAccuracy: AutopusLocationAccuracy,
        significantChangesOnly: Bool) -> AsyncStream<CLLocation>
    func stopLocationUpdates()
    func startMonitoringSignificantLocationChanges(onUpdate: @escaping @Sendable (CLLocation) -> Void)
    func stopMonitoringSignificantLocationChanges()
}

@MainActor
protocol DeviceStatusServicing: Sendable {
    func status() async throws -> AutopusDeviceStatusPayload
    func info() -> AutopusDeviceInfoPayload
}

protocol PhotosServicing: Sendable {
    func latest(params: AutopusPhotosLatestParams) async throws -> AutopusPhotosLatestPayload
}

protocol ContactsServicing: Sendable {
    func search(params: AutopusContactsSearchParams) async throws -> AutopusContactsSearchPayload
    func add(params: AutopusContactsAddParams) async throws -> AutopusContactsAddPayload
}

protocol CalendarServicing: Sendable {
    func events(params: AutopusCalendarEventsParams) async throws -> AutopusCalendarEventsPayload
    func add(params: AutopusCalendarAddParams) async throws -> AutopusCalendarAddPayload
}

protocol RemindersServicing: Sendable {
    func list(params: AutopusRemindersListParams) async throws -> AutopusRemindersListPayload
    func add(params: AutopusRemindersAddParams) async throws -> AutopusRemindersAddPayload
}

protocol MotionServicing: Sendable {
    func activities(params: AutopusMotionActivityParams) async throws -> AutopusMotionActivityPayload
    func pedometer(params: AutopusPedometerParams) async throws -> AutopusPedometerPayload
}

struct WatchMessagingStatus: Equatable {
    var supported: Bool
    var paired: Bool
    var appInstalled: Bool
    var reachable: Bool
    var activationState: String
}

struct WatchQuickReplyEvent: Equatable {
    var replyId: String
    var promptId: String
    var actionId: String
    var actionLabel: String?
    var sessionKey: String?
    var note: String?
    var sentAtMs: Int?
    var transport: String
}

struct WatchExecApprovalResolveEvent: Equatable {
    var replyId: String
    var approvalId: String
    var decision: AutopusWatchExecApprovalDecision
    var sentAtMs: Int?
    var transport: String
}

struct WatchExecApprovalSnapshotRequestEvent: Equatable {
    var requestId: String
    var sentAtMs: Int?
    var transport: String
}

struct WatchNotificationSendResult: Equatable {
    var deliveredImmediately: Bool
    var queuedForDelivery: Bool
    var transport: String
}

protocol WatchMessagingServicing: AnyObject, Sendable {
    func status() async -> WatchMessagingStatus
    func setStatusHandler(_ handler: (@Sendable (WatchMessagingStatus) -> Void)?)
    func setReplyHandler(_ handler: (@Sendable (WatchQuickReplyEvent) -> Void)?)
    func setExecApprovalResolveHandler(_ handler: (@Sendable (WatchExecApprovalResolveEvent) -> Void)?)
    func setExecApprovalSnapshotRequestHandler(
        _ handler: (@Sendable (WatchExecApprovalSnapshotRequestEvent) -> Void)?)
    func sendNotification(
        id: String,
        params: AutopusWatchNotifyParams) async throws -> WatchNotificationSendResult
    func sendExecApprovalPrompt(
        _ message: AutopusWatchExecApprovalPromptMessage) async throws -> WatchNotificationSendResult
    func sendExecApprovalResolved(
        _ message: AutopusWatchExecApprovalResolvedMessage) async throws -> WatchNotificationSendResult
    func sendExecApprovalExpired(
        _ message: AutopusWatchExecApprovalExpiredMessage) async throws -> WatchNotificationSendResult
    func syncExecApprovalSnapshot(
        _ message: AutopusWatchExecApprovalSnapshotMessage) async throws -> WatchNotificationSendResult
}

extension CameraController: CameraServicing {}
extension ScreenRecordService: ScreenRecordingServicing {}
extension LocationService: LocationServicing {}
