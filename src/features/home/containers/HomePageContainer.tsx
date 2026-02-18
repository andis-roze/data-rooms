import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import { HomeContentSection } from '../components/HomeContentSection'
import { HomeSidebar } from '../components/HomeSidebar'
import { IncompleteStructureState } from '../components/IncompleteStructureState'
import { FeedbackStack } from '../dialogs/FeedbackStack'
import { useHomePageController } from '../useHomePageController'
import { HomePageDialogsContainer } from './HomePageDialogsContainer'
import { HomePageEmptyState } from './HomePageEmptyState'

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
      <HomePageEmptyState
        title={t('dataroomNoDataRoomTitle')}
        body={t('dataroomNoDataRoomBody')}
        actionLabel={t('dataroomActionCreateDataRoom')}
        isCreateDataRoomDialogOpen={dialogs.isCreateDataRoomDialogOpen}
        dataRoomNameDraft={forms.dataRoomNameDraft}
        dataRoomNameError={forms.dataRoomNameError}
        onOpenCreateDataRoomDialog={handlers.openCreateDataRoomDialog}
        onCloseCreateDataRoomDialog={handlers.closeCreateDataRoomDialog}
        onDataRoomNameDraftChange={handlers.handleDataRoomNameDraftChange}
        onCreateDataRoom={handlers.handleCreateDataRoom}
      />
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

      <HomePageDialogsContainer
        dialogs={dialogs}
        forms={forms}
        activeDataRoomName={resolveDisplayName(activeDataRoom.name)}
        activeFolderName={resolveDisplayName(activeFolder.name)}
        targetFolder={targetFolder}
        activeFile={activeFile}
        dataRoomDeleteSummary={dataRoomDeleteSummary}
        folderDeleteSummary={folderDeleteSummary}
        resolveDisplayName={resolveDisplayName}
        handlers={handlers}
      />

      <FeedbackStack
        feedbackQueue={feedbackQueue}
        timeoutMs={feedbackTimeoutMs}
        onDismissFeedback={handlers.dismissFeedback}
      />
    </Container>
  )
}
