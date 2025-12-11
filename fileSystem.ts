export interface VirtualFile {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'drive' | 'root';
  fileType?: string;
  mimeType?: string;
  size?: number;
  data?: string;
  blobUrl?: string;
  children?: string[];
  parentId?: string;
  createdAt: number;
  modifiedAt: number;
  icon?: string;
  color?: string;
}

export interface FileSystemState {
  files: Record<string, VirtualFile>;
  version: number;
}

const DB_NAME = 'Windows13FileSystem';
const DB_VERSION = 1;
const STORE_NAME = 'files';
const BLOBS_STORE = 'blobs';

class FileSystemManager {
  private db: IDBDatabase | null = null;
  private listeners: Set<() => void> = new Set();
  private cache: Record<string, VirtualFile> = {};
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        this.loadInitialFiles().then(resolve);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains(BLOBS_STORE)) {
          db.createObjectStore(BLOBS_STORE, { keyPath: 'id' });
        }
      };
    });
  }

  private async loadInitialFiles(): Promise<void> {
    const files = await this.getAllFiles();
    
    if (Object.keys(files).length === 0) {
      await this.createDefaultFileSystem();
    } else {
      this.cache = files;
    }
  }

  private async createDefaultFileSystem(): Promise<void> {
    const now = Date.now();
    
    const defaultFiles: Record<string, VirtualFile> = {
      root: {
        id: 'root',
        name: 'This PC',
        type: 'root',
        children: ['desktop', 'documents', 'downloads', 'pictures', 'music', 'videos', 'c_drive'],
        createdAt: now,
        modifiedAt: now,
      },
      desktop: {
        id: 'desktop',
        name: 'Desktop',
        type: 'folder',
        icon: 'Monitor',
        color: 'text-blue-500',
        children: [],
        parentId: 'root',
        createdAt: now,
        modifiedAt: now,
      },
      documents: {
        id: 'documents',
        name: 'Documents',
        type: 'folder',
        icon: 'FileText',
        color: 'text-yellow-500',
        children: [],
        parentId: 'root',
        createdAt: now,
        modifiedAt: now,
      },
      downloads: {
        id: 'downloads',
        name: 'Downloads',
        type: 'folder',
        icon: 'Download',
        color: 'text-green-500',
        children: [],
        parentId: 'root',
        createdAt: now,
        modifiedAt: now,
      },
      pictures: {
        id: 'pictures',
        name: 'Pictures',
        type: 'folder',
        icon: 'Image',
        color: 'text-purple-500',
        children: [],
        parentId: 'root',
        createdAt: now,
        modifiedAt: now,
      },
      music: {
        id: 'music',
        name: 'Music',
        type: 'folder',
        icon: 'Music',
        color: 'text-pink-500',
        children: [],
        parentId: 'root',
        createdAt: now,
        modifiedAt: now,
      },
      videos: {
        id: 'videos',
        name: 'Videos',
        type: 'folder',
        icon: 'Video',
        color: 'text-red-500',
        children: [],
        parentId: 'root',
        createdAt: now,
        modifiedAt: now,
      },
      c_drive: {
        id: 'c_drive',
        name: 'Local Disk (C:)',
        type: 'drive',
        icon: 'HardDrive',
        color: 'text-gray-500',
        children: ['program_files', 'users', 'windows_folder'],
        parentId: 'root',
        createdAt: now,
        modifiedAt: now,
      },
      program_files: {
        id: 'program_files',
        name: 'Program Files',
        type: 'folder',
        children: [],
        parentId: 'c_drive',
        createdAt: now,
        modifiedAt: now,
      },
      users: {
        id: 'users',
        name: 'Users',
        type: 'folder',
        children: [],
        parentId: 'c_drive',
        createdAt: now,
        modifiedAt: now,
      },
      windows_folder: {
        id: 'windows_folder',
        name: 'Windows',
        type: 'folder',
        children: [],
        parentId: 'c_drive',
        createdAt: now,
        modifiedAt: now,
      },
    };

    for (const file of Object.values(defaultFiles)) {
      await this.saveFile(file);
    }
    
    this.cache = defaultFiles;
  }

  async getAllFiles(): Promise<Record<string, VirtualFile>> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const files: Record<string, VirtualFile> = {};
        for (const file of request.result) {
          files[file.id] = file;
        }
        resolve(files);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async getFile(id: string): Promise<VirtualFile | null> {
    if (this.cache[id]) return this.cache[id];
    
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      
      request.onsuccess = () => {
        if (request.result) {
          this.cache[id] = request.result;
        }
        resolve(request.result || null);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async saveFile(file: VirtualFile): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(file);
      
      request.onsuccess = () => {
        this.cache[file.id] = file;
        this.notifyListeners();
        resolve();
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async saveBlob(id: string, blob: Blob): Promise<string> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(BLOBS_STORE, 'readwrite');
      const store = transaction.objectStore(BLOBS_STORE);
      const request = store.put({ id, blob });
      
      request.onsuccess = () => {
        const url = URL.createObjectURL(blob);
        resolve(url);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async getBlob(id: string): Promise<Blob | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(BLOBS_STORE, 'readonly');
      const store = transaction.objectStore(BLOBS_STORE);
      const request = store.get(id);
      
      request.onsuccess = () => {
        resolve(request.result?.blob || null);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFile(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    const file = await this.getFile(id);
    if (!file) return;

    if (file.children && file.children.length > 0) {
      for (const childId of file.children) {
        await this.deleteFile(childId);
      }
    }

    if (file.parentId) {
      const parent = await this.getFile(file.parentId);
      if (parent && parent.children) {
        parent.children = parent.children.filter(c => c !== id);
        await this.saveFile(parent);
      }
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME, BLOBS_STORE], 'readwrite');
      const fileStore = transaction.objectStore(STORE_NAME);
      const blobStore = transaction.objectStore(BLOBS_STORE);
      
      fileStore.delete(id);
      blobStore.delete(id);
      
      transaction.oncomplete = () => {
        delete this.cache[id];
        this.notifyListeners();
        resolve();
      };
      
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async createFolder(name: string, parentId: string): Promise<VirtualFile> {
    const now = Date.now();
    const id = `folder_${now}_${Math.random().toString(36).substr(2, 9)}`;
    
    const folder: VirtualFile = {
      id,
      name,
      type: 'folder',
      children: [],
      parentId,
      createdAt: now,
      modifiedAt: now,
    };
    
    await this.saveFile(folder);
    
    const parent = await this.getFile(parentId);
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(id);
      await this.saveFile(parent);
    }
    
    return folder;
  }

  async uploadFile(file: File, parentId: string): Promise<VirtualFile> {
    const now = Date.now();
    const id = `file_${now}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fileType = this.getFileType(file.name);
    const blobUrl = await this.saveBlob(id, file);
    
    let data: string | undefined;
    if (file.type.startsWith('text/') || fileType === 'text' || fileType === 'code') {
      data = await file.text();
    }
    
    const virtualFile: VirtualFile = {
      id,
      name: file.name,
      type: 'file',
      fileType,
      mimeType: file.type,
      size: file.size,
      data,
      blobUrl,
      parentId,
      createdAt: now,
      modifiedAt: now,
    };
    
    await this.saveFile(virtualFile);
    
    const parent = await this.getFile(parentId);
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(id);
      await this.saveFile(parent);
    }
    
    return virtualFile;
  }

  async renameFile(id: string, newName: string): Promise<void> {
    const file = await this.getFile(id);
    if (!file) return;
    
    file.name = newName;
    file.modifiedAt = Date.now();
    await this.saveFile(file);
  }

  async moveFile(id: string, newParentId: string): Promise<void> {
    const file = await this.getFile(id);
    if (!file) return;

    if (file.parentId) {
      const oldParent = await this.getFile(file.parentId);
      if (oldParent && oldParent.children) {
        oldParent.children = oldParent.children.filter(c => c !== id);
        await this.saveFile(oldParent);
      }
    }

    const newParent = await this.getFile(newParentId);
    if (newParent) {
      newParent.children = newParent.children || [];
      newParent.children.push(id);
      await this.saveFile(newParent);
    }
    
    file.parentId = newParentId;
    file.modifiedAt = Date.now();
    await this.saveFile(file);
  }

  getFileType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    
    const typeMap: Record<string, string> = {
      jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', svg: 'image', bmp: 'image', ico: 'image',
      mp3: 'audio', wav: 'audio', ogg: 'audio', flac: 'audio', aac: 'audio', m4a: 'audio',
      mp4: 'video', webm: 'video', avi: 'video', mov: 'video', mkv: 'video',
      pdf: 'pdf',
      doc: 'word', docx: 'word',
      xls: 'excel', xlsx: 'excel',
      ppt: 'powerpoint', pptx: 'powerpoint',
      txt: 'text', md: 'text', rtf: 'text',
      js: 'code', ts: 'code', jsx: 'code', tsx: 'code', html: 'code', css: 'code', json: 'code', py: 'code',
      zip: 'archive', rar: 'archive', '7z': 'archive', tar: 'archive', gz: 'archive',
      exe: 'executable', msi: 'executable', dmg: 'executable', app: 'executable',
    };
    
    return typeMap[ext] || 'unknown';
  }

  getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
      mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac',
      mp4: 'video/mp4', webm: 'video/webm', avi: 'video/avi', mov: 'video/quicktime',
      pdf: 'application/pdf',
      txt: 'text/plain', md: 'text/markdown', html: 'text/html', css: 'text/css',
      js: 'text/javascript', json: 'application/json',
    };
    
    return mimeMap[ext] || 'application/octet-stream';
  }

  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(cb => cb());
  }

  async getFilesInFolder(folderId: string): Promise<VirtualFile[]> {
    const folder = await this.getFile(folderId);
    if (!folder || !folder.children) return [];
    
    const files: VirtualFile[] = [];
    for (const childId of folder.children) {
      const child = await this.getFile(childId);
      if (child) files.push(child);
    }
    
    return files;
  }

  async searchFiles(query: string): Promise<VirtualFile[]> {
    const allFiles = await this.getAllFiles();
    const lowerQuery = query.toLowerCase();
    
    return Object.values(allFiles).filter(file => 
      file.name.toLowerCase().includes(lowerQuery)
    );
  }

  async getBlobUrl(fileId: string): Promise<string | null> {
    const file = await this.getFile(fileId);
    if (!file) return null;
    
    if (file.blobUrl) {
      const blob = await this.getBlob(fileId);
      if (blob) {
        return URL.createObjectURL(blob);
      }
    }
    
    return null;
  }
}

export const fileSystem = new FileSystemManager();
