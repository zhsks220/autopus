import Foundation
import Testing
@testable import Autopus

@Suite(.serialized) struct NodeServiceManagerTests {
    @Test func `builds node service commands with current CLI shape`() async throws {
        try await TestIsolation.withUserDefaultsValues(["autopus.gatewayProjectRootPath": nil]) {
            let tmp = try makeTempDirForTests()
            CommandResolver.setProjectRoot(tmp.path)

            let autopusPath = tmp.appendingPathComponent("node_modules/.bin/autopus")
            try makeExecutableForTests(at: autopusPath)

            let start = NodeServiceManager._testServiceCommand(["start"])
            #expect(start == [autopusPath.path, "node", "start", "--json"])

            let stop = NodeServiceManager._testServiceCommand(["stop"])
            #expect(stop == [autopusPath.path, "node", "stop", "--json"])
        }
    }
}
