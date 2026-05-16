package ai.autopus.app.ui

import ai.autopus.app.MainViewModel
import ai.autopus.app.ui.chat.ChatSheetContent
import androidx.compose.runtime.Composable

@Composable
fun ChatSheet(viewModel: MainViewModel) {
  ChatSheetContent(viewModel = viewModel)
}
