import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import { HomeDialogs } from '../HomeDialogs'
import { EmptyDataRoomState } from '../components/EmptyDataRoomState'
import { HomeContentSection } from '../components/HomeContentSection'
import { HomeSidebar } from '../components/HomeSidebar'
import { IncompleteStructureState } from '../components/IncompleteStructureState'
import { useHomePageController } from '../useHomePageController'
import { FeedbackStack } from '../dialogs/FeedbackStack'

export function HomePageContainer() {
  const controller = useHomePageController()

  const {
    t,
    entities,
    selectedDataRoomId,
    selectedFolderId,
    dispatch,
    uploadInputRef,
    dataRooms,
    activeDataRoom,
    rootFolder,
    activeFolder,
    breadcrumbs,
    visibleContentItems,
    locale,
    targetFolder,
    activeFile,
    deleteSummary,
    canDeleteActiveDataRoom,
    dataRoomDeleteSummary,
    feedbackQueue,
    sortState,
    resolveDisplayName,
    dismissFeedback,
    createDataRoomDialogOpen,
    renameDataRoomDialogOpen,
    deleteDataRoomDialogOpen,
    createDialogOpen,
    renameDialogOpen,
    deleteDialogOpen,
    renameFileDialogOpen,
    deleteFileDialogOpen,
    viewFileDialogOpen,
    dataRoomNameDraft,
    dataRoomNameError,
    folderNameDraft,
    folderNameError,
    fileNameDraft,
    fileNameError,
    setCreateDataRoomDialogOpen,
    setRenameDataRoomDialogOpen,
    setDeleteDataRoomDialogOpen,
    setCreateDialogOpen,
    setRenameFileDialogOpen,
    setDeleteFileDialogOpen,
    setViewFileDialogOpen,
    setDataRoomNameDraft,
    setDataRoomNameError,
    setFolderNameDraft,
    setFolderNameError,
    setFileNameDraft,
    setFileNameError,
    openCreateDataRoomDialog,
    openRenameDataRoomDialog,
    handleCreateDataRoom,
    handleRenameDataRoom,
    handleDeleteDataRoom,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeRenameDialog,
    closeDeleteDialog,
    openRenameFileDialog,
    openDeleteFileDialog,
    openViewFileDialog,
    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
    handleUploadInputChange,
    handleRenameFile,
    handleDeleteFile,
    toggleSort,
  } = controller

  if (dataRooms.length === 0) {
    return (
      <EmptyDataRoomState
        title={t('dataroomNoDataRoomTitle')}
        body={t('dataroomNoDataRoomBody')}
        actionLabel={t('dataroomActionCreateDataRoom')}
        onCreateDataRoom={openCreateDataRoomDialog}
      >
        <HomeDialogs
          createDataRoomDialogOpen={createDataRoomDialogOpen}
          renameDataRoomDialogOpen={false}
          deleteDataRoomDialogOpen={false}
          createDialogOpen={false}
          renameDialogOpen={false}
          deleteDialogOpen={false}
          renameFileDialogOpen={false}
          deleteFileDialogOpen={false}
          viewFileDialogOpen={false}
          dataRoomNameDraft={dataRoomNameDraft}
          dataRoomNameError={dataRoomNameError}
          folderNameDraft=""
          folderNameError={null}
          fileNameDraft=""
          fileNameError={null}
          activeDataRoomName=""
          activeFolderName=""
          targetFolderName={null}
          activeFileName={null}
          activeFileObjectUrl={null}
          dataRoomDeleteSummary={{ folderCount: 0, fileCount: 0 }}
          folderDeleteSummary={{ folderCount: 0, fileCount: 0 }}
          onCloseCreateDataRoomDialog={() => setCreateDataRoomDialogOpen(false)}
          onOpenDataRoomNameChange={(value) => {
            setDataRoomNameDraft(value)
            setDataRoomNameError(null)
          }}
          onCreateDataRoom={handleCreateDataRoom}
          onCloseRenameDataRoomDialog={() => {}}
          onRenameDataRoom={() => {}}
          onCloseDeleteDataRoomDialog={() => {}}
          onDeleteDataRoom={() => {}}
          onCloseCreateFolderDialog={() => {}}
          onFolderNameChange={() => {}}
          onCreateFolder={() => {}}
          onCloseRenameFolderDialog={() => {}}
          onRenameFolder={() => {}}
          onCloseDeleteFolderDialog={() => {}}
          onDeleteFolder={() => {}}
          onCloseRenameFileDialog={() => {}}
          onFileNameChange={() => {}}
          onRenameFile={() => {}}
          onCloseDeleteFileDialog={() => {}}
          onDeleteFile={() => {}}
          onCloseViewFileDialog={() => {}}
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
          onCreateDataRoom={openCreateDataRoomDialog}
          onRenameDataRoom={openRenameDataRoomDialog}
          onDeleteDataRoom={() => setDeleteDataRoomDialogOpen(true)}
          onSelectDataRoom={(dataRoomId) => {
            dispatch({ type: 'dataroom/selectDataRoom', payload: { dataRoomId } })
          }}
          onSelectFolder={(folderId) => {
            dispatch({ type: 'dataroom/selectFolder', payload: { folderId } })
          }}
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
          onCreateFolder={openCreateDialog}
          onUploadPdf={() => uploadInputRef.current?.click()}
          onUploadInputChange={handleUploadInputChange}
          onToggleSort={toggleSort}
          onSelectFolder={(folderId) => {
            dispatch({ type: 'dataroom/selectFolder', payload: { folderId } })
          }}
          onOpenRenameFolder={openRenameDialog}
          onOpenDeleteFolder={openDeleteDialog}
          onOpenViewFile={openViewFileDialog}
          onOpenRenameFile={openRenameFileDialog}
          onOpenDeleteFile={openDeleteFileDialog}
        />
      </Paper>

      <HomeDialogs
        createDataRoomDialogOpen={createDataRoomDialogOpen}
        renameDataRoomDialogOpen={renameDataRoomDialogOpen}
        deleteDataRoomDialogOpen={deleteDataRoomDialogOpen}
        createDialogOpen={createDialogOpen}
        renameDialogOpen={renameDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        renameFileDialogOpen={renameFileDialogOpen}
        deleteFileDialogOpen={deleteFileDialogOpen}
        viewFileDialogOpen={viewFileDialogOpen}
        dataRoomNameDraft={dataRoomNameDraft}
        dataRoomNameError={dataRoomNameError}
        folderNameDraft={folderNameDraft}
        folderNameError={folderNameError}
        fileNameDraft={fileNameDraft}
        fileNameError={fileNameError}
        activeDataRoomName={resolveDisplayName(activeDataRoom.name)}
        activeFolderName={resolveDisplayName(activeFolder.name)}
        targetFolderName={targetFolder ? resolveDisplayName(targetFolder.name) : null}
        activeFileName={activeFile?.name ?? null}
        activeFileObjectUrl={activeFile?.objectUrl ?? null}
        dataRoomDeleteSummary={dataRoomDeleteSummary}
        folderDeleteSummary={deleteSummary}
        onCloseCreateDataRoomDialog={() => setCreateDataRoomDialogOpen(false)}
        onOpenDataRoomNameChange={(value) => {
          setDataRoomNameDraft(value)
          setDataRoomNameError(null)
        }}
        onCreateDataRoom={handleCreateDataRoom}
        onCloseRenameDataRoomDialog={() => setRenameDataRoomDialogOpen(false)}
        onRenameDataRoom={handleRenameDataRoom}
        onCloseDeleteDataRoomDialog={() => setDeleteDataRoomDialogOpen(false)}
        onDeleteDataRoom={handleDeleteDataRoom}
        onCloseCreateFolderDialog={() => setCreateDialogOpen(false)}
        onFolderNameChange={(value) => {
          setFolderNameDraft(value)
          setFolderNameError(null)
        }}
        onCreateFolder={handleCreateFolder}
        onCloseRenameFolderDialog={closeRenameDialog}
        onRenameFolder={handleRenameFolder}
        onCloseDeleteFolderDialog={closeDeleteDialog}
        onDeleteFolder={handleDeleteFolder}
        onCloseRenameFileDialog={() => setRenameFileDialogOpen(false)}
        onFileNameChange={(value) => {
          setFileNameDraft(value)
          setFileNameError(null)
        }}
        onRenameFile={handleRenameFile}
        onCloseDeleteFileDialog={() => setDeleteFileDialogOpen(false)}
        onDeleteFile={handleDeleteFile}
        onCloseViewFileDialog={() => setViewFileDialogOpen(false)}
      />

      <FeedbackStack feedbackQueue={feedbackQueue} onDismissFeedback={dismissFeedback} />
    </Container>
  )
}
