package ai.autopus.app.node

import ai.autopus.app.protocol.AutopusCalendarCommand
import ai.autopus.app.protocol.AutopusCallLogCommand
import ai.autopus.app.protocol.AutopusCameraCommand
import ai.autopus.app.protocol.AutopusCapability
import ai.autopus.app.protocol.AutopusContactsCommand
import ai.autopus.app.protocol.AutopusDeviceCommand
import ai.autopus.app.protocol.AutopusLocationCommand
import ai.autopus.app.protocol.AutopusMotionCommand
import ai.autopus.app.protocol.AutopusNotificationsCommand
import ai.autopus.app.protocol.AutopusPhotosCommand
import ai.autopus.app.protocol.AutopusSmsCommand
import ai.autopus.app.protocol.AutopusSystemCommand
import ai.autopus.app.protocol.AutopusTalkCommand
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class InvokeCommandRegistryTest {
  private val coreCapabilities =
    setOf(
      AutopusCapability.Canvas.rawValue,
      AutopusCapability.Device.rawValue,
      AutopusCapability.Notifications.rawValue,
      AutopusCapability.System.rawValue,
      AutopusCapability.Talk.rawValue,
      AutopusCapability.Photos.rawValue,
      AutopusCapability.Contacts.rawValue,
      AutopusCapability.Calendar.rawValue,
    )

  private val optionalCapabilities =
    setOf(
      AutopusCapability.Camera.rawValue,
      AutopusCapability.Location.rawValue,
      AutopusCapability.Sms.rawValue,
      AutopusCapability.CallLog.rawValue,
      AutopusCapability.VoiceWake.rawValue,
      AutopusCapability.Motion.rawValue,
    )

  private val coreCommands =
    setOf(
      AutopusDeviceCommand.Status.rawValue,
      AutopusDeviceCommand.Info.rawValue,
      AutopusDeviceCommand.Permissions.rawValue,
      AutopusDeviceCommand.Health.rawValue,
      AutopusNotificationsCommand.List.rawValue,
      AutopusNotificationsCommand.Actions.rawValue,
      AutopusSystemCommand.Notify.rawValue,
      AutopusTalkCommand.PttStart.rawValue,
      AutopusTalkCommand.PttStop.rawValue,
      AutopusTalkCommand.PttCancel.rawValue,
      AutopusTalkCommand.PttOnce.rawValue,
      AutopusPhotosCommand.Latest.rawValue,
      AutopusContactsCommand.Search.rawValue,
      AutopusContactsCommand.Add.rawValue,
      AutopusCalendarCommand.Events.rawValue,
      AutopusCalendarCommand.Add.rawValue,
    )

  private val optionalCommands =
    setOf(
      AutopusCameraCommand.Snap.rawValue,
      AutopusCameraCommand.Clip.rawValue,
      AutopusCameraCommand.List.rawValue,
      AutopusLocationCommand.Get.rawValue,
      AutopusMotionCommand.Activity.rawValue,
      AutopusMotionCommand.Pedometer.rawValue,
      AutopusSmsCommand.Send.rawValue,
      AutopusSmsCommand.Search.rawValue,
      AutopusCallLogCommand.Search.rawValue,
    )

  private val debugCommands = setOf("debug.logs", "debug.ed25519")

  @Test
  fun advertisedCapabilities_respectsFeatureAvailability() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags())

    assertContainsAll(capabilities, coreCapabilities)
    assertMissingAll(capabilities, optionalCapabilities)
  }

  @Test
  fun advertisedCapabilities_includesFeatureCapabilitiesWhenEnabled() {
    val capabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(
          cameraEnabled = true,
          locationEnabled = true,
          sendSmsAvailable = true,
          readSmsAvailable = true,
          smsSearchPossible = true,
          callLogAvailable = true,
          voiceWakeEnabled = true,
          motionActivityAvailable = true,
          motionPedometerAvailable = true,
        ),
      )

    assertContainsAll(capabilities, coreCapabilities + optionalCapabilities)
  }

  @Test
  fun advertisedCommands_respectsFeatureAvailability() {
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags())

    assertContainsAll(commands, coreCommands)
    assertMissingAll(commands, optionalCommands + debugCommands)
  }

  @Test
  fun advertisedCommands_includesFeatureCommandsWhenEnabled() {
    val commands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(
          cameraEnabled = true,
          locationEnabled = true,
          sendSmsAvailable = true,
          readSmsAvailable = true,
          smsSearchPossible = true,
          callLogAvailable = true,
          motionActivityAvailable = true,
          motionPedometerAvailable = true,
          debugBuild = true,
        ),
      )

    assertContainsAll(commands, coreCommands + optionalCommands + debugCommands)
  }

  @Test
  fun advertisedCommands_onlyIncludesSupportedMotionCommands() {
    val commands =
      InvokeCommandRegistry.advertisedCommands(
        NodeRuntimeFlags(
          cameraEnabled = false,
          locationEnabled = false,
          sendSmsAvailable = false,
          readSmsAvailable = false,
          smsSearchPossible = false,
          callLogAvailable = false,
          voiceWakeEnabled = false,
          motionActivityAvailable = true,
          motionPedometerAvailable = false,
          debugBuild = false,
        ),
      )

    assertTrue(commands.contains(AutopusMotionCommand.Activity.rawValue))
    assertFalse(commands.contains(AutopusMotionCommand.Pedometer.rawValue))
  }

  @Test
  fun advertisedCommands_splitsSmsSendAndSearchAvailability() {
    val readOnlyCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(readSmsAvailable = true, smsSearchPossible = true),
      )
    val sendOnlyCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(sendSmsAvailable = true),
      )
    val requestableSearchCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(smsSearchPossible = true),
      )

    assertTrue(readOnlyCommands.contains(AutopusSmsCommand.Search.rawValue))
    assertFalse(readOnlyCommands.contains(AutopusSmsCommand.Send.rawValue))
    assertTrue(sendOnlyCommands.contains(AutopusSmsCommand.Send.rawValue))
    assertFalse(sendOnlyCommands.contains(AutopusSmsCommand.Search.rawValue))
    assertTrue(requestableSearchCommands.contains(AutopusSmsCommand.Search.rawValue))
  }

  @Test
  fun advertisedCapabilities_includeSmsWhenEitherSmsPathIsAvailable() {
    val readOnlyCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(readSmsAvailable = true),
      )
    val sendOnlyCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(sendSmsAvailable = true),
      )
    val requestableSearchCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(smsSearchPossible = true),
      )

    assertTrue(readOnlyCapabilities.contains(AutopusCapability.Sms.rawValue))
    assertTrue(sendOnlyCapabilities.contains(AutopusCapability.Sms.rawValue))
    assertFalse(requestableSearchCapabilities.contains(AutopusCapability.Sms.rawValue))
  }

  @Test
  fun advertisedCommands_excludesCallLogWhenUnavailable() {
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags(callLogAvailable = false))

    assertFalse(commands.contains(AutopusCallLogCommand.Search.rawValue))
  }

  @Test
  fun advertisedCapabilities_excludesCallLogWhenUnavailable() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags(callLogAvailable = false))

    assertFalse(capabilities.contains(AutopusCapability.CallLog.rawValue))
  }

  @Test
  fun advertisedCapabilities_includesVoiceWakeWithoutAdvertisingCommands() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags(voiceWakeEnabled = true))
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags(voiceWakeEnabled = true))

    assertTrue(capabilities.contains(AutopusCapability.VoiceWake.rawValue))
    assertFalse(commands.any { it.contains("voice", ignoreCase = true) })
  }

  @Test
  fun find_returnsForegroundMetadataForCameraCommands() {
    val list = InvokeCommandRegistry.find(AutopusCameraCommand.List.rawValue)
    val location = InvokeCommandRegistry.find(AutopusLocationCommand.Get.rawValue)

    assertNotNull(list)
    assertEquals(true, list?.requiresForeground)
    assertNotNull(location)
    assertEquals(false, location?.requiresForeground)
  }

  @Test
  fun find_returnsNullForUnknownCommand() {
    assertNull(InvokeCommandRegistry.find("not.real"))
  }

  private fun defaultFlags(
    cameraEnabled: Boolean = false,
    locationEnabled: Boolean = false,
    sendSmsAvailable: Boolean = false,
    readSmsAvailable: Boolean = false,
    smsSearchPossible: Boolean = false,
    callLogAvailable: Boolean = false,
    voiceWakeEnabled: Boolean = false,
    motionActivityAvailable: Boolean = false,
    motionPedometerAvailable: Boolean = false,
    debugBuild: Boolean = false,
  ): NodeRuntimeFlags =
    NodeRuntimeFlags(
      cameraEnabled = cameraEnabled,
      locationEnabled = locationEnabled,
      sendSmsAvailable = sendSmsAvailable,
      readSmsAvailable = readSmsAvailable,
      smsSearchPossible = smsSearchPossible,
      callLogAvailable = callLogAvailable,
      voiceWakeEnabled = voiceWakeEnabled,
      motionActivityAvailable = motionActivityAvailable,
      motionPedometerAvailable = motionPedometerAvailable,
      debugBuild = debugBuild,
    )

  private fun assertContainsAll(
    actual: List<String>,
    expected: Set<String>,
  ) {
    expected.forEach { value -> assertTrue(actual.contains(value)) }
  }

  private fun assertMissingAll(
    actual: List<String>,
    forbidden: Set<String>,
  ) {
    forbidden.forEach { value -> assertFalse(actual.contains(value)) }
  }
}
