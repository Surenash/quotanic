import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface FileViewerState {
  isOpen: boolean;
  design: any | null;
}

interface FileViewerContextType {
  fileViewerState: FileViewerState;
  openViewer: (designId: string | any) => void;
  closeViewer: () => void;
}

const FileViewerContext = createContext<FileViewerContextType | undefined>(undefined);

export const FileViewerProvider = ({ children }: { children: ReactNode }) => {
  const [fileViewerState, setFileViewerState] = useState<FileViewerState>({ isOpen: false, design: null });
  const navigate = useNavigate();

  const openViewer = (designOrId: any) => {
    const id = typeof designOrId === 'string' ? designOrId : designOrId?.id;
    if (id) {
        navigate(`/smart-view/${id}`);
    }
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
