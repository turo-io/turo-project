import { EditableDocument } from './document';
import { bundleLoader, storage } from './storage/app-bundle-storage';
import { CompositeStorage, DocumentLoader } from './storage/abstract-storage';

// By default, documents are loaded only from the bundle. 
// You can add your own document loaders using the composite storage class.
EditableDocument.storage = storage;

export const TuroDocument = EditableDocument;

export const loaders = {
  bundleLoader,
  DocumentLoader,
};

export {
  EditableDocument,
  CompositeStorage,
};
