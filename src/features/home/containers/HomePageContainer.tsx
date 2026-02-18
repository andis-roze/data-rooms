import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import { HomeDialogs } from '../HomeDialogs'
import { EmptyDataRoomState } from '../components/EmptyDataRoomState'
import { HomeContentSection } from '../components/HomeContentSection'
import { HomeSidebar } from '../components/HomeSidebar'
import { IncompleteStructureState } from '../components/IncompleteStructureState'
import { CreateDataRoomDialog } from '../dialogs/CreateDataRoomDialog'
import { FeedbackStack } from '../dialogs/FeedbackStack'
import { useHomePageController } from '../useHomePageController'

export function HomePageContainer() {
  const controller = useHomePageController()
  const { t, entities, selection, viewHelpers, uiState, handlers } = controller

  const {
    selectedDataRoomId,
    selectedFolderId,
    dataRooms,
    activeDataRoom,
    rootFolder,
    activeFolder,
    breadcrumbs,
    visibleContentItems,
    locale,
    targetFolder,
    activeFile,
    canDeleteActiveDataRoom,
    dataRoomDeleteSummary,
    folderDeleteSummary,
  } = selection

  const { resolveDisplayName } = viewHelpers
  const { dialogs, forms, uploadInputRef, sortState, feedbackQueue, feedbackTimeoutMs } = uiState

  if (dataRooms.length === 0) {
    return (
      <EmptyDataRoomState
        title={t('dataroomNoDataRoomTitle')}
        body={t('dataroomNoDataRoomBody')}
        actionLabel={t('dataroomActionCreateDataRoom')}
        onCreateDataRoom={handlers.openCreateDataRoomDialog}
      >
        <CreateDataRoomDialog
          open={dialogs.isCreateDataRoomDialogOpen}
          dataRoomNameDraft={forms.dataRoomNameDraft}
          dataRoomNameError={forms.dataRoomNameError}
          onClose={handlers.closeCreateDataRoomDialog}
          onDataRoomNameDraftChange={handlers.handleDataRoomNameDraftChange}
          onSubmit={handlers.handleCreateDataRoom}
        />
      </EmptyDataRoomState>
    )
  }

  if (!rootFolder || !activeDataRoom || !activeFolder) {
    return <IncompleteStructureState title={t('dataroomStructureIncomplete')} />
  }

  return (
    <Container component="main" maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          minHeight: { md: '70vh' },
        }}
      >
        <HomeSidebar
          entities={entities}
          dataRooms={dataRooms}
          selectedDataRoomId={selectedDataRoomId}
          selectedFolderId={selectedFolderId}
          canDeleteActiveDataRoom={canDeleteActiveDataRoom}
          onCreateDataRoom={handlers.openCreateDataRoomDialog}
          onRenameDataRoom={handlers.openRenameDataRoomDialog}
          onDeleteDataRoom={handlers.openDeleteDataRoomDialog}
          onSelectDataRoom={handlers.selectDataRoom}
          onSelectFolder={handlers.selectFolder}
          resolveDisplayName={resolveDisplayName}
        />

        <HomeContentSection
          activeDataRoomName={resolveDisplayName(activeDataRoom.name)}
          activeFolderId={activeFolder.id}
          breadcrumbs={breadcrumbs}
          visibleContentItems={visibleContentItems}
          sortState={sortState}
          locale={locale}
          resolveDisplayName={resolveDisplayName}
          uploadInputRef={uploadInputRef}
          onCreateFolder={handlers.openCreateFolderDialog}
          onUploadPdf={() => uploadInputRef.current?.click()}
          onUploadInputChange={handlers.handleUploadInputChange}
          onToggleSort={handlers.toggleSort}
          onSelectFolder={handlers.selectFolder}
          onOpenRenameFolder={handlers.openRenameFolderDialog}
          onOpenDeleteFolder={handlers.openDeleteFolderDialog}
          onOpenViewFile={handlers.openViewFileDialog}
          onOpenRenameFile={handlers.openRenameFileDialog}
          onOpenDeleteFile={handlers.openDeleteFileDialog}
        />
      </Paper>

      <HomeDialogs
        createDataRoomDialogOpen={dialogs.isCreateDataRoomDialogOpen}
        renameDataRoomDialogOpen={dialogs.isRenameDataRoomDialogOpen}
        deleteDataRoomDialogOpen={dialogs.isDeleteDataRoomDialogOpen}
        createFolderDialogOpen={dialogs.isCreateFolderDialogOpen}
        renameFolderDialogOpen={dialogs.isRenameFolderDialogOpen}
        deleteFolderDialogOpen={dialogs.isDeleteFolderDialogOpen}
        renameFileDialogOpen={dialogs.isRenameFileDialogOpen}
        deleteFileDialogOpen={dialogs.isDeleteFileDialogOpen}
        viewFileDialogOpen={dialogs.isViewFileDialogOpen}
        dataRoomNameDraft={forms.dataRoomNameDraft}
        dataRoomNameError={forms.dataRoomNameError}
        folderNameDraft={forms.folderNameDraft}
        folderNameError={forms.folderNameError}
        fileNameDraft={forms.fileNameDraft}
        fileNameError={forms.fileNameError}
        activeDataRoomName={resolveDisplayName(activeDataRoom.name)}
        activeFolderName={resolveDisplayName(activeFolder.name)}
        targetFolderName={targetFolder ? resolveDisplayName(targetFolder.name) : null}
        activeFileName={activeFile?.name ?? null}
        activeFileId={activeFile?.id ?? null}
        dataRoomDeleteSummary={dataRoomDeleteSummary}
        folderDeleteSummary={folderDeleteSummary}
        onCloseCreateDataRoomDialog={handlers.closeCreateDataRoomDialog}
        onOpenDataRoomNameChange={handlers.handleDataRoomNameDraftChange}
        onCreateDataRoom={handlers.handleCreateDataRoom}
        onCloseRenameDataRoomDialog={handlers.closeRenameDataRoomDialog}
        onRenameDataRoom={handlers.handleRenameDataRoom}
        onCloseDeleteDataRoomDialog={handlers.closeDeleteDataRoomDialog}
        onDeleteDataRoom={handlers.handleDeleteDataRoom}
        onCloseCreateFolderDialog={handlers.closeCreateFolderDialog}
        onFolderNameChange={handlers.handleFolderNameDraftChange}
        onCreateFolder={handlers.handleCreateFolder}
        onCloseRenameFolderDialog={handlers.closeRenameFolderDialog}
        onRenameFolder={handlers.handleRenameFolder}
        onCloseDeleteFolderDialog={handlers.closeDeleteFolderDialog}
        onDeleteFolder={handlers.handleDeleteFolder}
        onCloseRenameFileDialog={handlers.closeRenameFileDialog}
        onFileNameChange={handlers.handleFileNameDraftChange}
        onRenameFile={handlers.handleRenameFile}
        onCloseDeleteFileDialog={handlers.closeDeleteFileDialog}
        onDeleteFile={handlers.handleDeleteFile}
        onCloseViewFileDialog={handlers.closeViewFileDialog}
      />

      <FeedbackStack
        feedbackQueue={feedbackQueue}
        timeoutMs={feedbackTimeoutMs}
        onDismissFeedback={handlers.dismissFeedback}
      />
    </Container>
  )
}
