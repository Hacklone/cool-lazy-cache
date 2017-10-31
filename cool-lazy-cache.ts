import { Subject } from 'rxjs';
import { DataCache } from './data-cache';

export class CoolLazyCache<T> {
  private _dataLoadLock: Subject<void>;
  private _cache: DataCache<T>;

  constructor(private _dataLoader: () => Promise<T>, millisecondsToCache: number = 60000) {
    this._cache = new DataCache<T>(millisecondsToCache);
  }

  public async getDataAsync(): Promise<T> {
    if (this._dataLoadLock) {
      await this._dataLoadLock.toPromise();
    }

    if (!this._cache.hasValidCache) {
      await this._tryLoadDataAsync();
    }

    return this._cache.getData();
  }

  public invalidateCache(): void {
    this._cache.invalidate();
  }

  private async _tryLoadDataAsync(): Promise<void> {
    this._dataLoadLock = new Subject<void>();

    let err;

    try {
      const data = await this._dataLoader();

      this._cache.store(data);
    } catch (e) {
      err = e;
    }

    this._dataLoadLock.next();
    this._dataLoadLock.complete();
    this._dataLoadLock = null;

    if (err) {
      throw err;
    }
  }
}
