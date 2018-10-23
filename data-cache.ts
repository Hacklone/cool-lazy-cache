import { Observable, ReplaySubject } from 'rxjs';

export class DataCache<T> {
  private _data: T;
  private _lastStoreDate: number | null = null;

  private _dataObservable: ReplaySubject<T> = new ReplaySubject<T>(1);

  constructor(private _millisecondsToCache: number) {

  }

  public store(data: T): void {
    this._data = data;
    this._dataObservable.next(this._data);
    this._lastStoreDate = new Date().getTime();

    setTimeout(() => {
      this._tryRemoveOutdatedData();
    }, this._millisecondsToCache + 5000);
  }

  public get hasValidCache(): boolean {
    if (!this._lastStoreDate) {
      return false;
    }

    const millisecondsDifference = new Date().getTime() - this._lastStoreDate;

    return millisecondsDifference < this._millisecondsToCache;
  }

  public getData(): T {
    if (!this.hasValidCache) {
      this._data = null;

      return null;
    }

    return JSON.parse(JSON.stringify(this._data));
  }

  public getDataObservable(): Observable<T> {
    return this._dataObservable.asObservable();
  }

  public invalidate() {
    this._data = null;
    this._lastStoreDate = null;
  }

  private _tryRemoveOutdatedData() {
    if (this.hasValidCache) {
      return;
    }

    this._data = null;
  }
}
