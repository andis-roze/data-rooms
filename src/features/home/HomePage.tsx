import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FolderContentTable } from './FolderContentTable'
import { CreateDataRoomDialog, FeedbackStack, HomeDialogs } from './HomeDialogs'
import { DataRoomTreeNode } from './FolderTree'
import { useHomePageController } from './useHomePageController'

export function HomePage() {
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
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 4 }}>
          <Stack spacing={2}>
            <Typography variant="h1" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
              {t('dataroomNoDataRoomTitle')}
            </Typography>
            <Typography color="text.secondary">{t('dataroomNoDataRoomBody')}</Typography>
            <Button variant="contained" onClick={openCreateDataRoomDialog}>
              {t('dataroomActionCreateDataRoom')}
            </Button>
          </Stack>
        </Paper>

        <CreateDataRoomDialog
          open={createDataRoomDialogOpen}
          dataRoomNameDraft={dataRoomNameDraft}
          dataRoomNameError={dataRoomNameError}
          onClose={() => setCreateDataRoomDialogOpen(false)}
          onDataRoomNameDraftChange={(value) => {
            setDataRoomNameDraft(value)
            setDataRoomNameError(null)
          }}
          onSubmit={handleCreateDataRoom}
        />
      </Container>
    )
  }

  if (!rootFolder || !activeDataRoom || !activeFolder) {
    return (
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 4 }}>
          <Typography variant="h1" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            {t('dataroomStructureIncomplete')}
          </Typography>
        </Paper>
      </Container>
    )
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
        <Box
          component="aside"
          sx={{ width: { md: 320 }, borderRight: { md: '1px solid' }, borderColor: 'divider', p: 2 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            {t('dataroomSidebarTitle')}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} spacing={1} sx={{ mb: 1.5 }}>
            <Button size="small" variant="contained" onClick={openCreateDataRoomDialog}>
              {t('dataroomActionCreateDataRoom')}
            </Button>
            <Button size="small" variant="outlined" onClick={openRenameDataRoomDialog}>
              {t('dataroomActionRenameDataRoom')}
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              disabled={!canDeleteActiveDataRoom}
              onClick={() => setDeleteDataRoomDialogOpen(true)}
            >
              {t('dataroomActionDeleteDataRoom')}
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" color="text.secondary" sx={{ px: 1, pb: 1 }}>
            {t('dataroomFolderTreeTitle')}
          </Typography>
          <List dense disablePadding aria-label={t('dataroomFolderTreeTitle')}>
            {dataRooms.map((dataRoom) => (
              <DataRoomTreeNode
                key={dataRoom.id}
                dataRoom={dataRoom}
                state={entities}
                selectedDataRoomId={selectedDataRoomId}
                selectedFolderId={selectedFolderId}
                onSelectDataRoom={(dataRoomId) => {
                  dispatch({ type: 'dataroom/selectDataRoom', payload: { dataRoomId } })
                }}
                onSelectFolder={(folderId) => {
                  dispatch({ type: 'dataroom/selectFolder', payload: { folderId } })
                }}
                renderDataRoomName={resolveDisplayName}
                renderFolderName={resolveDisplayName}
              />
            ))}
          </List>
        </Box>

        <Box component="section" sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          <Stack spacing={2.5}>
            <Stack spacing={0.75}>
              <Typography variant="h1" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                {resolveDisplayName(activeDataRoom.name)}
              </Typography>
              <Breadcrumbs aria-label={t('dataroomBreadcrumbsLabel')}>
                {breadcrumbs.map((folder) => (
                  <Button
                    key={folder.id}
                    size="small"
                    color={folder.id === activeFolder.id ? 'primary' : 'inherit'}
                    onClick={() => {
                      dispatch({ type: 'dataroom/selectFolder', payload: { folderId: folder.id } })
                    }}
                  >
                    {resolveDisplayName(folder.name)}
                  </Button>
                ))}
              </Breadcrumbs>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button variant="contained" onClick={openCreateDialog}>
                {t('dataroomActionCreateFolder')}
              </Button>
              <Button variant="text" onClick={() => uploadInputRef.current?.click()}>
                {t('dataroomActionUploadPdf')}
              </Button>
            </Stack>

            <input
              ref={uploadInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleUploadInputChange}
              data-testid="upload-pdf-input"
              style={{ display: 'none' }}
            />

            <FolderContentTable
              items={visibleContentItems}
              sortState={sortState}
              onToggleSort={toggleSort}
              locale={locale}
              resolveDisplayName={resolveDisplayName}
              onSelectFolder={(folderId) => {
                dispatch({ type: 'dataroom/selectFolder', payload: { folderId } })
              }}
              onOpenRenameFolder={openRenameDialog}
              onOpenDeleteFolder={openDeleteDialog}
              onOpenViewFile={openViewFileDialog}
              onOpenRenameFile={openRenameFileDialog}
              onOpenDeleteFile={openDeleteFileDialog}
            />
          </Stack>
        </Box>
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
