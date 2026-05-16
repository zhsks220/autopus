import Foundation

public enum AutopusCameraCommand: String, Codable, Sendable {
    case list = "camera.list"
    case snap = "camera.snap"
    case clip = "camera.clip"
}

public enum AutopusCameraFacing: String, Codable, Sendable {
    case back
    case front
}

public enum AutopusCameraImageFormat: String, Codable, Sendable {
    case jpg
    case jpeg
}

public enum AutopusCameraVideoFormat: String, Codable, Sendable {
    case mp4
}

public struct AutopusCameraSnapParams: Codable, Sendable, Equatable {
    public var facing: AutopusCameraFacing?
    public var maxWidth: Int?
    public var quality: Double?
    public var format: AutopusCameraImageFormat?
    public var deviceId: String?
    public var delayMs: Int?

    public init(
        facing: AutopusCameraFacing? = nil,
        maxWidth: Int? = nil,
        quality: Double? = nil,
        format: AutopusCameraImageFormat? = nil,
        deviceId: String? = nil,
        delayMs: Int? = nil)
    {
        self.facing = facing
        self.maxWidth = maxWidth
        self.quality = quality
        self.format = format
        self.deviceId = deviceId
        self.delayMs = delayMs
    }
}

public struct AutopusCameraClipParams: Codable, Sendable, Equatable {
    public var facing: AutopusCameraFacing?
    public var durationMs: Int?
    public var includeAudio: Bool?
    public var format: AutopusCameraVideoFormat?
    public var deviceId: String?

    public init(
        facing: AutopusCameraFacing? = nil,
        durationMs: Int? = nil,
        includeAudio: Bool? = nil,
        format: AutopusCameraVideoFormat? = nil,
        deviceId: String? = nil)
    {
        self.facing = facing
        self.durationMs = durationMs
        self.includeAudio = includeAudio
        self.format = format
        self.deviceId = deviceId
    }
}
