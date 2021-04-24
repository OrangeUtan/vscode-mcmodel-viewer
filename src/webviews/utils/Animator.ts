export class Animator {
    private handle: number | undefined = undefined;
    private frame = 0;
    private period = 1;
    private interval = 500;
    private callback: ((frame: number) => void) | undefined;

    start(cb: (frame: number) => void, interval: number, period: number) {
        if(this.handle !== undefined) {
            this.stop();
        }

        this.frame = 0;
        this.period = period;
        this.interval = interval;
        this.callback = cb;

        this.handle = setInterval(() => {
            this.frame = (this.frame + 1) % this.period;
            this.callback!(this.frame);
        }, this.interval);
    }

    pause() {
        if(this.handle !== undefined) {
            clearInterval(this.handle);
            this.handle = undefined;
        }
    }

    stop() {
        this.pause();
        this.callback = undefined;
    }

    resume() {
        if(this.handle !== undefined) {
            this.handle = setInterval(() => {
                this.frame = (this.frame + 1) % this.period;
                this.callback!(this.frame);
            }, this.interval);
        }
    }
}