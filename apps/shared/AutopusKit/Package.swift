// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "AutopusKit",
    platforms: [
        .iOS(.v18),
        .macOS(.v15),
    ],
    products: [
        .library(name: "AutopusProtocol", targets: ["AutopusProtocol"]),
        .library(name: "AutopusKit", targets: ["AutopusKit"]),
        .library(name: "AutopusChatUI", targets: ["AutopusChatUI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/steipete/ElevenLabsKit", exact: "0.1.1"),
        .package(url: "https://github.com/gonzalezreal/textual", exact: "0.3.1"),
    ],
    targets: [
        .target(
            name: "AutopusProtocol",
            path: "Sources/AutopusProtocol",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "AutopusKit",
            dependencies: [
                "AutopusProtocol",
                .product(name: "ElevenLabsKit", package: "ElevenLabsKit"),
            ],
            path: "Sources/AutopusKit",
            resources: [
                .process("Resources"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "AutopusChatUI",
            dependencies: [
                "AutopusKit",
                .product(
                    name: "Textual",
                    package: "textual",
                    condition: .when(platforms: [.macOS, .iOS])),
            ],
            path: "Sources/AutopusChatUI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "AutopusKitTests",
            dependencies: ["AutopusKit", "AutopusChatUI"],
            path: "Tests/AutopusKitTests",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
