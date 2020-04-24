/**
 * SplitUpdateWorker class
 */
export default class SplitUpdateWorker {

  /**
   * @param {Object} splitStorage splits cache
   * @param {Object} splitProducer node producer or full browser producer
   */
  constructor(splitStorage, splitProducer, splitsEventEmitter) {
    this.splitStorage = splitStorage;
    this.splitProducer = splitProducer;
    this.maxChangeNumber = 0;
    this.splitsEventEmitter = splitsEventEmitter;
    this.put = this.put.bind(this);
    this.killSplit = this.killSplit.bind(this);
  }

  // Private method
  // Preconditions: this.splitProducer.isSynchronizingSplits === false
  __handleSplitUpdateCall() {
    if (this.maxChangeNumber > this.splitStorage.getChangeNumber()) {
      this.splitProducer.synchronizeSplits().then(() => {
        this.__handleSplitUpdateCall();
      });
    } else {
      this.maxChangeNumber = 0;
    }
  }

  /**
   * Invoked by NotificationProcessor on SPLIT_UPDATE event
   *
   * @param {number} changeNumber change number of the SPLIT_UPDATE notification
   */
  put(changeNumber) {
    const currentChangeNumber = this.splitStorage.getChangeNumber();

    if (changeNumber <= currentChangeNumber || changeNumber <= this.maxChangeNumber) return;

    this.maxChangeNumber = changeNumber;

    if (this.splitProducer.isSynchronizingSplits()) return;

    this.__handleSplitUpdateCall();
  }

  /**
   * Invoked by NotificationProcessor on SPLIT_KILL event
   *
   * @param {number} changeNumber change number of the SPLIT_UPDATE notification
   * @param {string} splitName name of split to kill
   * @param {string} defaultTreatment default treatment value
   */
  killSplit(changeNumber, splitName, defaultTreatment) {
    this.splitStorage.killLocally(splitName, defaultTreatment, changeNumber).then((updated) => {
      // trigger an SDK_UPDATE if Split was killed locally
      if (updated) this.splitsEventEmitter.emit(this.splitsEventEmitter.SDK_SPLITS_ARRIVED, true);
      // queues the SplitChanges fetch (only if changeNumber is newer)
      this.put(changeNumber);
    });
  }

}