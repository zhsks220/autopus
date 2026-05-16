import Testing
@testable import Autopus

@Suite(.serialized) struct AutopusAppDelegateTests {
    @Test @MainActor func resolvesRegistryModelBeforeViewTaskAssignsDelegateModel() {
        let registryModel = NodeAppModel()
        AutopusAppModelRegistry.appModel = registryModel
        defer { AutopusAppModelRegistry.appModel = nil }

        let delegate = AutopusAppDelegate()

        #expect(delegate._test_resolvedAppModel() === registryModel)
    }

    @Test @MainActor func prefersExplicitDelegateModelOverRegistryFallback() {
        let registryModel = NodeAppModel()
        let explicitModel = NodeAppModel()
        AutopusAppModelRegistry.appModel = registryModel
        defer { AutopusAppModelRegistry.appModel = nil }

        let delegate = AutopusAppDelegate()
        delegate.appModel = explicitModel

        #expect(delegate._test_resolvedAppModel() === explicitModel)
    }
}
