import Foundation

public enum AutopusDeviceCommand: String, Codable, Sendable {
    case status = "device.status"
    case info = "device.info"
}

public enum AutopusBatteryState: String, Codable, Sendable {
    case unknown
    case unplugged
    case charging
    case full
}

public enum AutopusThermalState: String, Codable, Sendable {
    case nominal
    case fair
    case serious
    case critical
}

public enum AutopusNetworkPathStatus: String, Codable, Sendable {
    case satisfied
    case unsatisfied
    case requiresConnection
}

public enum AutopusNetworkInterfaceType: String, Codable, Sendable {
    case wifi
    case cellular
    case wired
    case other
}

public struct AutopusBatteryStatusPayload: Codable, Sendable, Equatable {
    public var level: Double?
    public var state: AutopusBatteryState
    public var lowPowerModeEnabled: Bool

    public init(level: Double?, state: AutopusBatteryState, lowPowerModeEnabled: Bool) {
        self.level = level
        self.state = state
        self.lowPowerModeEnabled = lowPowerModeEnabled
    }
}

public struct AutopusThermalStatusPayload: Codable, Sendable, Equatable {
    public var state: AutopusThermalState

    public init(state: AutopusThermalState) {
        self.state = state
    }
}

public struct AutopusStorageStatusPayload: Codable, Sendable, Equatable {
    public var totalBytes: Int64
    public var freeBytes: Int64
    public var usedBytes: Int64

    public init(totalBytes: Int64, freeBytes: Int64, usedBytes: Int64) {
        self.totalBytes = totalBytes
        self.freeBytes = freeBytes
        self.usedBytes = usedBytes
    }
}

public struct AutopusNetworkStatusPayload: Codable, Sendable, Equatable {
    public var status: AutopusNetworkPathStatus
    public var isExpensive: Bool
    public var isConstrained: Bool
    public var interfaces: [AutopusNetworkInterfaceType]

    public init(
        status: AutopusNetworkPathStatus,
        isExpensive: Bool,
        isConstrained: Bool,
        interfaces: [AutopusNetworkInterfaceType])
    {
        self.status = status
        self.isExpensive = isExpensive
        self.isConstrained = isConstrained
        self.interfaces = interfaces
    }
}

public struct AutopusDeviceStatusPayload: Codable, Sendable, Equatable {
    public var battery: AutopusBatteryStatusPayload
    public var thermal: AutopusThermalStatusPayload
    public var storage: AutopusStorageStatusPayload
    public var network: AutopusNetworkStatusPayload
    public var uptimeSeconds: Double

    public init(
        battery: AutopusBatteryStatusPayload,
        thermal: AutopusThermalStatusPayload,
        storage: AutopusStorageStatusPayload,
        network: AutopusNetworkStatusPayload,
        uptimeSeconds: Double)
    {
        self.battery = battery
        self.thermal = thermal
        self.storage = storage
        self.network = network
        self.uptimeSeconds = uptimeSeconds
    }
}

public struct AutopusDeviceInfoPayload: Codable, Sendable, Equatable {
    public var deviceName: String
    public var modelIdentifier: String
    public var systemName: String
    public var systemVersion: String
    public var appVersion: String
    public var appBuild: String
    public var locale: String

    public init(
        deviceName: String,
        modelIdentifier: String,
        systemName: String,
        systemVersion: String,
        appVersion: String,
        appBuild: String,
        locale: String)
    {
        self.deviceName = deviceName
        self.modelIdentifier = modelIdentifier
        self.systemName = systemName
        self.systemVersion = systemVersion
        self.appVersion = appVersion
        self.appBuild = appBuild
        self.locale = locale
    }
}
