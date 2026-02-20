import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { HomeContentSection } from '../components/HomeContentSection'
import { HomeSidebar } from '../components/HomeSidebar'
import { IncompleteStructureState } from '../components/IncompleteStructureState'
import { CreateDataRoomDialog } from '../dialogs/CreateDataRoomDialog'
import { FeedbackStack } from '../dialogs/FeedbackStack'
import { useHomePageController } from '../useHomePageController'
import { HomePageDialogsContainer } from './HomePageDialogsContainer'

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
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 4 }}>
          <Stack spacing={2} role="status" aria-live="polite">
            <Typography variant="h1" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
              {t('dataroomNoDataRoomTitle')}
            </Typography>
            <Typography color="text.secondary">{t('dataroomNoDataRoomBody')}</Typography>
            <Button variant="contained" onClick={handlers.openCreateDataRoomDialog}>
              {t('dataroomActionCreateDataRoom')}
            </Button>
          </Stack>
        </Paper>
        <CreateDataRoomDialog
          open={dialogs.isCreateDataRoomDialogOpen}
          dataRoomNameDraft={forms.dataRoomNameDraft}
          dataRoomNameError={forms.dataRoomNameError}
          onClose={handlers.closeCreateDataRoomDialog}
          onDataRoomNameDraftChange={handlers.handleDataRoomNameDraftChange}
          onSubmit={handlers.handleCreateDataRoom}
        />
      </Container>
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
          onOpenRenameFolder={handlers.openRenameFolderDialog}
          onOpenDeleteFolder={handlers.openDeleteFolderDialog}
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
