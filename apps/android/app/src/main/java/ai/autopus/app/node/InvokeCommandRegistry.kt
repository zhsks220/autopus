package ai.autopus.app.node

import ai.autopus.app.protocol.AutopusCalendarCommand
import ai.autopus.app.protocol.AutopusCallLogCommand
import ai.autopus.app.protocol.AutopusCameraCommand
import ai.autopus.app.protocol.AutopusCanvasA2UICommand
import ai.autopus.app.protocol.AutopusCanvasCommand
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

data class NodeRuntimeFlags(
  val cameraEnabled: Boolean,
  val locationEnabled: Boolean,
  val sendSmsAvailable: Boolean,
  val readSmsAvailable: Boolean,
  val smsSearchPossible: Boolean,
  val callLogAvailable: Boolean,
  val voiceWakeEnabled: Boolean,
  val motionActivityAvailable: Boolean,
  val motionPedometerAvailable: Boolean,
  val debugBuild: Boolean,
)

enum class InvokeCommandAvailability {
  Always,
  CameraEnabled,
  LocationEnabled,
  SendSmsAvailable,
  ReadSmsAvailable,
  RequestableSmsSearchAvailable,
  CallLogAvailable,
  MotionActivityAvailable,
  MotionPedometerAvailable,
  DebugBuild,
}

enum class NodeCapabilityAvailability {
  Always,
  CameraEnabled,
  LocationEnabled,
  SmsAvailable,
  CallLogAvailable,
  VoiceWakeEnabled,
  MotionAvailable,
}

data class NodeCapabilitySpec(
  val name: String,
  val availability: NodeCapabilityAvailability = NodeCapabilityAvailability.Always,
)

data class InvokeCommandSpec(
  val name: String,
  val requiresForeground: Boolean = false,
  val availability: InvokeCommandAvailability = InvokeCommandAvailability.Always,
)

object InvokeCommandRegistry {
  val capabilityManifest: List<NodeCapabilitySpec> =
    listOf(
      NodeCapabilitySpec(name = AutopusCapability.Canvas.rawValue),
      NodeCapabilitySpec(name = AutopusCapability.Device.rawValue),
      NodeCapabilitySpec(name = AutopusCapability.Notifications.rawValue),
      NodeCapabilitySpec(name = AutopusCapability.System.rawValue),
      NodeCapabilitySpec(
        name = AutopusCapability.Camera.rawValue,
        availability = NodeCapabilityAvailability.CameraEnabled,
      ),
      NodeCapabilitySpec(
        name = AutopusCapability.Sms.rawValue,
        availability = NodeCapabilityAvailability.SmsAvailable,
      ),
      NodeCapabilitySpec(
        name = AutopusCapability.VoiceWake.rawValue,
        availability = NodeCapabilityAvailability.VoiceWakeEnabled,
      ),
      NodeCapabilitySpec(name = AutopusCapability.Talk.rawValue),
      NodeCapabilitySpec(
        name = AutopusCapability.Location.rawValue,
        availability = NodeCapabilityAvailability.LocationEnabled,
      ),
      NodeCapabilitySpec(name = AutopusCapability.Photos.rawValue),
      NodeCapabilitySpec(name = AutopusCapability.Contacts.rawValue),
      NodeCapabilitySpec(name = AutopusCapability.Calendar.rawValue),
      NodeCapabilitySpec(
        name = AutopusCapability.Motion.rawValue,
        availability = NodeCapabilityAvailability.MotionAvailable,
      ),
      NodeCapabilitySpec(
        name = AutopusCapability.CallLog.rawValue,
        availability = NodeCapabilityAvailability.CallLogAvailable,
      ),
    )

  val all: List<InvokeCommandSpec> =
    listOf(
      InvokeCommandSpec(
        name = AutopusCanvasCommand.Present.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = AutopusCanvasCommand.Hide.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = AutopusCanvasCommand.Navigate.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = AutopusCanvasCommand.Eval.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = AutopusCanvasCommand.Snapshot.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = AutopusCanvasA2UICommand.Push.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = AutopusCanvasA2UICommand.PushJSONL.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = AutopusCanvasA2UICommand.Reset.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = AutopusSystemCommand.Notify.rawValue,
      ),
      InvokeCommandSpec(
        name = AutopusTalkCommand.PttStart.rawValue,
      ),
      InvokeCommandSpec(
        name = AutopusTalkCommand.PttStop.rawValue,
      ),
      InvokeCommandSpec(
        name = AutopusTalkCommand.PttCancel.rawValue,
      ),
      InvokeCommandSpec(
        name = AutopusTalkCommand.PttOnce.rawValue,
      ),
      InvokeCommandSpec(
        name = AutopusCameraCommand.List.rawValue,
        requiresForeground = true,
        availability = InvokeCommandAvailability.CameraEnabled,
      ),
      InvokeCommandSpec(
        name = AutopusCameraCommand.Snap.rawValue,
        requiresForeground = true,
        availability = InvokeCommandAvailability.CameraEnabled,
      ),
      InvokeCommandSpec(
        name = AutopusCameraCommand.Clip.rawValue,
        requiresForeground = true,
        availability = InvokeCommandAvailability.CameraEnabled,
      ),
      InvokeCommandSpec(
        name = AutopusLocationCommand.Get.rawValue,
        availability = InvokeCommandAvailability.LocationEnabled,
      ),
      InvokeCommandSpec(
        name = AutopusDeviceCommand.Status.rawValue,
      ),
      InvokeCommandSpec(
        name = AutopusDeviceCommand.Info.rawValue,
      ),
      InvokeCommandSpec(
        name = AutopusDeviceCommand.Permissions.rawValue,
      ),
      InvokeCommandSpec(
        name = AutopusDeviceCommand.Health.rawValue,
      ),
      InvokeCommandSpec(
        name = AutopusNotificationsCommand.List.rawValue,
      ),
      InvokeCommandSpec(
        name = AutopusNotificationsCommand.Actions.rawValue,
      ),
      InvokeCommandSpec(
        name = AutopusPhotosCommand.Latest.rawValue,
      ),
      InvokeCommandSpec(
        name = AutopusContactsCommand.Search.rawValue,
      ),
      InvokeCommandSpec(
        name = AutopusContactsCommand.Add.rawValue,
      ),
      InvokeCommandSpec(
        name = AutopusCalendarCommand.Events.rawValue,
      ),
      InvokeCommandSpec(
        name = AutopusCalendarCommand.Add.rawValue,
      ),
      InvokeCommandSpec(
        name = AutopusMotionCommand.Activity.rawValue,
        availability = InvokeCommandAvailability.MotionActivityAvailable,
      ),
      InvokeCommandSpec(
        name = AutopusMotionCommand.Pedometer.rawValue,
        availability = InvokeCommandAvailability.MotionPedometerAvailable,
      ),
      InvokeCommandSpec(
        name = AutopusSmsCommand.Send.rawValue,
        availability = InvokeCommandAvailability.SendSmsAvailable,
      ),
      InvokeCommandSpec(
        name = AutopusSmsCommand.Search.rawValue,
        availability = InvokeCommandAvailability.RequestableSmsSearchAvailable,
      ),
      InvokeCommandSpec(
        name = AutopusCallLogCommand.Search.rawValue,
        availability = InvokeCommandAvailability.CallLogAvailable,
      ),
      InvokeCommandSpec(
        name = "debug.logs",
        availability = InvokeCommandAvailability.DebugBuild,
      ),
      InvokeCommandSpec(
        name = "debug.ed25519",
        availability = InvokeCommandAvailability.DebugBuild,
      ),
    )

  private val byNameInternal: Map<String, InvokeCommandSpec> = all.associateBy { it.name }

  fun find(command: String): InvokeCommandSpec? = byNameInternal[command]

  fun advertisedCapabilities(flags: NodeRuntimeFlags): List<String> =
    capabilityManifest
      .filter { spec ->
        when (spec.availability) {
          NodeCapabilityAvailability.Always -> true
          NodeCapabilityAvailability.CameraEnabled -> flags.cameraEnabled
          NodeCapabilityAvailability.LocationEnabled -> flags.locationEnabled
          NodeCapabilityAvailability.SmsAvailable -> flags.sendSmsAvailable || flags.readSmsAvailable
          NodeCapabilityAvailability.CallLogAvailable -> flags.callLogAvailable
          NodeCapabilityAvailability.VoiceWakeEnabled -> flags.voiceWakeEnabled
          NodeCapabilityAvailability.MotionAvailable -> flags.motionActivityAvailable || flags.motionPedometerAvailable
        }
      }.map { it.name }

  fun advertisedCommands(flags: NodeRuntimeFlags): List<String> =
    all
      .filter { spec ->
        when (spec.availability) {
          InvokeCommandAvailability.Always -> true
          InvokeCommandAvailability.CameraEnabled -> flags.cameraEnabled
          InvokeCommandAvailability.LocationEnabled -> flags.locationEnabled
          InvokeCommandAvailability.SendSmsAvailable -> flags.sendSmsAvailable
          InvokeCommandAvailability.ReadSmsAvailable -> flags.readSmsAvailable
          InvokeCommandAvailability.RequestableSmsSearchAvailable -> flags.smsSearchPossible
          InvokeCommandAvailability.CallLogAvailable -> flags.callLogAvailable
          InvokeCommandAvailability.MotionActivityAvailable -> flags.motionActivityAvailable
          InvokeCommandAvailability.MotionPedometerAvailable -> flags.motionPedometerAvailable
          InvokeCommandAvailability.DebugBuild -> flags.debugBuild
        }
      }.map { it.name }
}
