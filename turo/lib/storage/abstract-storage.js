import _ from 'underscore';

/////////////////////////////////////////////////////////////////////////
class AbstractStorage {
  constructor () {
    this._state = {
      isLoading: {},
      documents: {},
    };
    // subclasses should call this constructor
    // with AbstractStorage.call(this) in their own constructors.
  }

  hasDocument (slug) {
    return this.getDocument(slug);
  }

  isLoadingDocument (slug) {
    return this._state.isLoading[slug];
  }

  // func (slug: String, documentCreator: ({id, document}, cb) -> Void, cb)
  // Should write to cache, for availability elsewhere
  loadDocument (slug, documentCreator, callback) {
    var self = this,
        listeners = self._state.isLoading[slug];

    const isNew = !slug;

    if (listeners) {
      listeners.push(callback);
      return;
    }

    listeners = [callback];
    if (!isNew) {
      self._state.isLoading[slug] = listeners; 
    }

    this.loadJSON(slug)
      .then(({ docData, loader }) => {
        if (isNew) {
          slug = "" + docData.id;
        }
        // evaluates doc
        documentCreator(
          docData,
          function (err, doc) {
            // JS is single threaded, so nothing can add to listeners
            delete self._state.isLoading[slug];
            if (err) {
              console.error(`Error loading ${slug}: ${err}`)
              listeners.forEach((cb) => cb(err));
              return;
            }
            doc.location = { slug, loader };
            self._state.documents[slug] = doc;
            listeners.forEach((cb) => cb(null, doc));
          }
        );
      })
      .catch((err) => {
        delete self._state.isLoading[slug];
        listeners.forEach((cb) => cb(err));
      });
    // load string,
    // create editable document with evaluate string
    // calls back with model.
  }

  getDocument (slug) {
    return this._state.documents[slug];
  }

  loadJSON (location) {
    return Promise.reject('Unimplemented method loadJSON');
  }

  saveDocument (doc) {
    return Promise.reject('Unimplemented method saveDocument');
  }
}

class CompositeStorage extends AbstractStorage {
  constructor (loaders) {
    super();
    this.loaders = loaders;
  }

  loadJSON (slug) {
    const generator = function* (loaders) {
      for (let loader of loaders) {
        yield loader;
      }
    }

    const g = generator(this.loaders);
    const tryNext = () => {
      const next = g.next();

      if (next.done) {
        return Promise.reject('NO DOCUMENT IN ANY LOADER');
      }
      const loader = next.value;

      return loader.loadJSON(slug)
        .then(docData => {
          return Promise.resolve({ docData, loader });
        })
        .catch(e => tryNext());
    };

    return tryNext();
  }

  saveDocument (doc) {
    const { slug, loader } = doc.location;
    if (loader && loader.saveJSON) {
      const json = {
        document: doc.text,
        id: slug, 
        title: doc.title || doc.id,
      };
      return loader.saveJSON(slug, json);
    } else {
      return Promise.reject('CANNOT SAVE');
    }
  }
}

class DocumentLoader {
  loadJSON (slug) {
    return Promise.reject('Unimplemented method loadJSON');
  }

  saveJSON (slug, doc) {
    return Promise.reject('Unimplemented method saveDocument');
  }
}

class BundleDocumentLoader extends DocumentLoader {
  constructor (files, implicitImports = null) {
    super();
    this.files = files;
    this.implicitImports = implicitImports;
  }

  loadJSON (slug) {
    const id = slug;
    const string = this.files[id];
    if (string) {
      return Promise.resolve({ id, title: slug, document: string, implicitImports: this.implicitImports });  
    } else {
      return Promise.reject('BundleDocumentLoader: NO_DOCUMENT ' + slug);
    }
  }
}

export { AbstractStorage, CompositeStorage, DocumentLoader, BundleDocumentLoader };
