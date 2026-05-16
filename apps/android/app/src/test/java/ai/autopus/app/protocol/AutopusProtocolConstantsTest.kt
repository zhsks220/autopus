package ai.autopus.app.protocol

import org.junit.Assert.assertEquals
import org.junit.Test

class AutopusProtocolConstantsTest {
  @Test
  fun canvasCommandsUseStableStrings() {
    assertEquals("canvas.present", AutopusCanvasCommand.Present.rawValue)
    assertEquals("canvas.hide", AutopusCanvasCommand.Hide.rawValue)
    assertEquals("canvas.navigate", AutopusCanvasCommand.Navigate.rawValue)
    assertEquals("canvas.eval", AutopusCanvasCommand.Eval.rawValue)
    assertEquals("canvas.snapshot", AutopusCanvasCommand.Snapshot.rawValue)
  }

  @Test
  fun a2uiCommandsUseStableStrings() {
    assertEquals("canvas.a2ui.push", AutopusCanvasA2UICommand.Push.rawValue)
    assertEquals("canvas.a2ui.pushJSONL", AutopusCanvasA2UICommand.PushJSONL.rawValue)
    assertEquals("canvas.a2ui.reset", AutopusCanvasA2UICommand.Reset.rawValue)
  }

  @Test
  fun capabilitiesUseStableStrings() {
    assertEquals("canvas", AutopusCapability.Canvas.rawValue)
    assertEquals("camera", AutopusCapability.Camera.rawValue)
    assertEquals("voiceWake", AutopusCapability.VoiceWake.rawValue)
    assertEquals("talk", AutopusCapability.Talk.rawValue)
    assertEquals("location", AutopusCapability.Location.rawValue)
    assertEquals("sms", AutopusCapability.Sms.rawValue)
    assertEquals("device", AutopusCapability.Device.rawValue)
    assertEquals("notifications", AutopusCapability.Notifications.rawValue)
    assertEquals("system", AutopusCapability.System.rawValue)
    assertEquals("photos", AutopusCapability.Photos.rawValue)
    assertEquals("contacts", AutopusCapability.Contacts.rawValue)
    assertEquals("calendar", AutopusCapability.Calendar.rawValue)
    assertEquals("motion", AutopusCapability.Motion.rawValue)
    assertEquals("callLog", AutopusCapability.CallLog.rawValue)
  }

  @Test
  fun cameraCommandsUseStableStrings() {
    assertEquals("camera.list", AutopusCameraCommand.List.rawValue)
    assertEquals("camera.snap", AutopusCameraCommand.Snap.rawValue)
    assertEquals("camera.clip", AutopusCameraCommand.Clip.rawValue)
  }

  @Test
  fun notificationsCommandsUseStableStrings() {
    assertEquals("notifications.list", AutopusNotificationsCommand.List.rawValue)
    assertEquals("notifications.actions", AutopusNotificationsCommand.Actions.rawValue)
  }

  @Test
  fun deviceCommandsUseStableStrings() {
    assertEquals("device.status", AutopusDeviceCommand.Status.rawValue)
    assertEquals("device.info", AutopusDeviceCommand.Info.rawValue)
    assertEquals("device.permissions", AutopusDeviceCommand.Permissions.rawValue)
    assertEquals("device.health", AutopusDeviceCommand.Health.rawValue)
  }

  @Test
  fun systemCommandsUseStableStrings() {
    assertEquals("system.notify", AutopusSystemCommand.Notify.rawValue)
  }

  @Test
  fun photosCommandsUseStableStrings() {
    assertEquals("photos.latest", AutopusPhotosCommand.Latest.rawValue)
  }

  @Test
  fun contactsCommandsUseStableStrings() {
    assertEquals("contacts.search", AutopusContactsCommand.Search.rawValue)
    assertEquals("contacts.add", AutopusContactsCommand.Add.rawValue)
  }

  @Test
  fun calendarCommandsUseStableStrings() {
    assertEquals("calendar.events", AutopusCalendarCommand.Events.rawValue)
    assertEquals("calendar.add", AutopusCalendarCommand.Add.rawValue)
  }

  @Test
  fun motionCommandsUseStableStrings() {
    assertEquals("motion.activity", AutopusMotionCommand.Activity.rawValue)
    assertEquals("motion.pedometer", AutopusMotionCommand.Pedometer.rawValue)
  }

  @Test
  fun smsCommandsUseStableStrings() {
    assertEquals("sms.send", AutopusSmsCommand.Send.rawValue)
    assertEquals("sms.search", AutopusSmsCommand.Search.rawValue)
  }

  @Test
  fun talkCommandsUseStableStrings() {
    assertEquals("talk.ptt.start", AutopusTalkCommand.PttStart.rawValue)
    assertEquals("talk.ptt.stop", AutopusTalkCommand.PttStop.rawValue)
    assertEquals("talk.ptt.cancel", AutopusTalkCommand.PttCancel.rawValue)
    assertEquals("talk.ptt.once", AutopusTalkCommand.PttOnce.rawValue)
  }

  @Test
  fun callLogCommandsUseStableStrings() {
    assertEquals("callLog.search", AutopusCallLogCommand.Search.rawValue)
  }
}
