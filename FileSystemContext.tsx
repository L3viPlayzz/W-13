import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { fileSystem, VirtualFile } from './fileSystem';

interface OpenFileRequest {
  file: VirtualFile;
  blobUrl?: string;
}

interface FileSystemContextType {
  files: Record<string, VirtualFile>;
  isLoading: boolean;
  currentFolder: string;
  setCurrentFolder: (id: string) => void;
  uploadFiles: (files: FileList, parentId: string) => Promise<VirtualFile[]>;
  createFolder: (name: string, parentId: string) => Promise<VirtualFile>;
  deleteFile: (id: string) => Promise<void>;
  renameFile: (id: string, newName: string) => Promise<void>;
  moveFile: (id: string, newParentId: string) => Promise<void>;
  getFile: (id: string) => VirtualFile | null;
  getBlobUrl: (fileId: string) => Promise<string | null>;
  refreshFiles: () => Promise<void>;
  openFileRequest: OpenFileRequest | null;
  requestOpenFile: (file: VirtualFile) => Promise<void>;
  clearOpenFileRequest: () => void;
  searchFiles: (query: string) => Promise<VirtualFile[]>;
}

const FileSystemContext = createContext<FileSystemContextType | null>(null);

export function FileSystemProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<Record<string, VirtualFile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState('root');
  const [openFileRequest, setOpenFileRequest] = useState<OpenFileRequest | null>(null);

  const refreshFiles = useCallback(async () => {
    try {
      await fileSystem.init();
      const allFiles = await fileSystem.getAllFiles();
      setFiles(allFiles);
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  }, []);

  useEffect(() => {
    const initFS = async () => {
      setIsLoading(true);
      await refreshFiles();
      setIsLoading(false);
    };
    
    initFS();
    
    const unsubscribe = fileSystem.subscribe(() => {
      refreshFiles();
    });
    
    return unsubscribe;
  }, [refreshFiles]);

  const uploadFiles = async (fileList: FileList, parentId: string): Promise<VirtualFile[]> => {
    const uploaded: VirtualFile[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const virtualFile = await fileSystem.uploadFile(file, parentId);
      uploaded.push(virtualFile);
    }
    
    await refreshFiles();
    return uploaded;
  };

  const createFolder = async (name: string, parentId: string): Promise<VirtualFile> => {
    const folder = await fileSystem.createFolder(name, parentId);
    await refreshFiles();
    return folder;
  };

  const deleteFile = async (id: string): Promise<void> => {
    await fileSystem.deleteFile(id);
    await refreshFiles();
  };

  const renameFile = async (id: string, newName: string): Promise<void> => {
    await fileSystem.renameFile(id, newName);
    await refreshFiles();
  };

  const moveFile = async (id: string, newParentId: string): Promise<void> => {
    await fileSystem.moveFile(id, newParentId);
    await refreshFiles();
  };

  const getFile = (id: string): VirtualFile | null => {
    return files[id] || null;
  };

  const getBlobUrl = async (fileId: string): Promise<string | null> => {
    return fileSystem.getBlobUrl(fileId);
  };

  const requestOpenFile = async (file: VirtualFile): Promise<void> => {
    let blobUrl: string | undefined;
    
    if (file.type === 'file') {
      const url = await getBlobUrl(file.id);
      if (url) blobUrl = url;
    }
    
    setOpenFileRequest({ file, blobUrl });
  };

  const clearOpenFileRequest = () => {
    setOpenFileRequest(null);
  };

  const searchFiles = async (query: string): Promise<VirtualFile[]> => {
    return fileSystem.searchFiles(query);
  };

  return (
    <FileSystemContext.Provider
      value={{
        files,
        isLoading,
        currentFolder,
        setCurrentFolder,
        uploadFiles,
        createFolder,
        deleteFile,
        renameFile,
        moveFile,
        getFile,
        getBlobUrl,
        refreshFiles,
        openFileRequest,
        requestOpenFile,
        clearOpenFileRequest,
        searchFiles,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
}

export function useFileSystem() {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
}
