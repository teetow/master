type QueuedJob<T> = () => Promise<T>;

export class JobRunner<T> {
  private queue: QueuedJob<T>[];
  private numJobs: number;
  private maxJobs: number;
  constructor() {
    this.queue = [];
    this.numJobs = 0;
    this.maxJobs = 5;
  }

  addJob(job: QueuedJob<T>): void {
    this.queue.push(job);
    this.runNext();
  }

  private runNext(): void {
    if (this.numJobs >= this.maxJobs) {
      return;
    }

    const job = this.queue.shift();
    if (job) {
      this.numJobs++;

      job()
        .then(() => {
          this.numJobs--;
          this.runNext();
        })
        .catch((error) => {
          console.error("Welp.", error);
          this.numJobs--;
          this.runNext();
        });
    }
  }
}
