import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

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
}
