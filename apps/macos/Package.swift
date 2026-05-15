// swift-tools-version: 6.2
// Package manifest for the Autopus macOS companion (menu bar app + IPC library).

import PackageDescription

let package = Package(
    name: "Autopus",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "AutopusIPC", targets: ["AutopusIPC"]),
        .library(name: "AutopusDiscovery", targets: ["AutopusDiscovery"]),
        .executable(name: "Autopus", targets: ["Autopus"]),
        .executable(name: "autopus-mac", targets: ["AutopusMacCLI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/orchetect/MenuBarExtraAccess", exact: "1.3.0"),
        .package(url: "https://github.com/swiftlang/swift-subprocess.git", from: "0.4.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.10.1"),
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.9.0"),
        .package(url: "https://github.com/steipete/Peekaboo.git", exact: "3.0.0"),
        .package(path: "../shared/AutopusKit"),
        .package(path: "../swabble"),
    ],
    targets: [
        .target(
            name: "AutopusIPC",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "AutopusDiscovery",
            dependencies: [
                .product(name: "AutopusKit", package: "AutopusKit"),
            ],
            path: "Sources/AutopusDiscovery",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "Autopus",
            dependencies: [
                "AutopusIPC",
                "AutopusDiscovery",
                .product(name: "AutopusKit", package: "AutopusKit"),
                .product(name: "AutopusChatUI", package: "AutopusKit"),
                .product(name: "AutopusProtocol", package: "AutopusKit"),
                .product(name: "SwabbleKit", package: "swabble"),
                .product(name: "MenuBarExtraAccess", package: "MenuBarExtraAccess"),
                .product(name: "Subprocess", package: "swift-subprocess"),
                .product(name: "Logging", package: "swift-log"),
                .product(name: "Sparkle", package: "Sparkle"),
                .product(name: "PeekabooBridge", package: "Peekaboo"),
                .product(name: "PeekabooAutomationKit", package: "Peekaboo"),
            ],
            exclude: [
                "Resources/Info.plist",
            ],
            resources: [
                .copy("Resources/Autopus.icns"),
                .copy("Resources/DeviceModels"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "AutopusMacCLI",
            dependencies: [
                "AutopusDiscovery",
                .product(name: "AutopusKit", package: "AutopusKit"),
                .product(name: "AutopusProtocol", package: "AutopusKit"),
            ],
            path: "Sources/AutopusMacCLI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "AutopusIPCTests",
            dependencies: [
                "AutopusIPC",
                "Autopus",
                "AutopusDiscovery",
                .product(name: "AutopusProtocol", package: "AutopusKit"),
                .product(name: "SwabbleKit", package: "swabble"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
