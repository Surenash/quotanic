import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FileViewerState {
  isOpen: boolean;
  design: any | null;
}

interface FileViewerContextType {
  fileViewerState: FileViewerState;
  openViewer: (design: any) => void;
  closeViewer: () => void;
}

const FileViewerContext = createContext<FileViewerContextType | undefined>(undefined);

export const FileViewerProvider = ({ children }: { children: ReactNode }) => {
  const [fileViewerState, setFileViewerState] = useState<FileViewerState>({ isOpen: false, design: null });

  const openViewer = (design: any) => {
    setFileViewerState({ isOpen: true, design });
  };

  const closeViewer = () => {
    setFileViewerState({ isOpen: false, design: null });
  };

  return (
    <FileViewerContext.Provider value={{ fileViewerState, openViewer, closeViewer }}>
      {children}
    </FileViewerContext.Provider>
  );
};

export const useFileViewer = () => {
  const context = useContext(FileViewerContext);
  if (!context) {
    throw new Error('useFileViewer must be used within a FileViewerProvider');
  }
  return context;
};
